const express = require('express')
const mongoose = require('mongoose')
const Course = require('../models/Course')
const CourseGroup = require('../models/CourseGroup')
const User = require('../models/User')
const Plan = require('../models/Plan')
const Waypoint = require('../models/Waypoint')
const shallowEqual = require('../../core/util/shallow-equal')
const { isValidObjectId, getCurrentUser, routeName } = require('../util')
const logger = require('winston').child({ file: 'courseRoutes.js' })

const router = {
  auth: express.Router(), // authenticated
  open: express.Router() // unauthenticated
}

// SAVE NEW
router.auth.route('/').post(async function (req, res) {
  const log = logger.child({ method: routeName(req) })
  try {
    log.info('run')
    const user = await User.findOne({ auth0ID: req.user.sub }).exec()
    const course = new Course(req.body)
    course._user = user // depreciated 2021.10.22
    course._users = [user]
    await course.save()
    log.info('Course saved')

    // create start and finish waypoints:
    const ws = new Waypoint({
      name: 'Start',
      type: 'start',
      location: 0,
      percent: 0,
      _course: course,
      lat: course.points[0][0],
      lon: course.points[0][1],
      elevation: course.points[0][2]
    })
    await ws.save()
    log.info('Start waypoint created')

    const wf = new Waypoint({
      name: 'Finish',
      type: 'finish',
      location: course.distance,
      percent: 1,
      _course: course,
      lat: course.points[course.points.length - 1][0],
      lon: course.points[course.points.length - 1][1],
      elevation: course.points[course.points.length - 1][2]
    })
    await wf.save()
    log.info('Finish waypoint created')

    res.status(200).json({ id: course._id, post: 'Course added successfully' })
  } catch (err) {
    log.error(err)
    res.status(400).send(err)
  }
})

// GET COURSES
router.auth.route('/').get(async function (req, res) {
  const log = logger.child({ method: routeName(req) })
  try {
    log.info('run')
    const user = await getCurrentUser(req)
    const q = {
      $or: [
        { _user: user },
        { _users: user },
        {
          $and: [
            { _id: { $in: user._courses } },
            { public: true }
          ]
        }
      ]
    }
    const courses = await Course.find(q)
      .select(['name', 'distance', 'gain', 'loss', 'loops', 'override', 'link', '_user', '_users'])
      .exec()
    log.info(`${courses.length} courses found`)

    // now lets find out which are delete-able:
    courses.forEach(c => { c.meta.deletable = false })
    const owned = courses.filter(c => c._users.findIndex(u => user.equals(u)) >= 0)
    log.info(`${owned.length} courses owned`)
    let withOthersPlans = []
    if (owned.length) {
      withOthersPlans = await Plan.find({
        $and: [
          { _course: { $in: owned.map(o => o._id) } }, // in the owned list
          { _user: { $ne: user } } // not this user
        ]
      }).distinct('_course').exec()

      log.info(`${withOthersPlans.length} owned courses have plans by others (not-deleteable)`)
      owned.filter(c => withOthersPlans.findIndex(p => c.equals(p)) < 0).forEach(c => { c.meta.deletable = true })
    }

    res.status(200).json(courses)
  } catch (error) {
    log.error(error)
    res.status(400).send('Error retrieving courses.')
  }
})

// UPDATE
router.auth.route('/:id').put(async function (req, res) {
  const log = logger.child({ method: routeName(req) })
  try {
    log.info('run')
    const { user, course } = await getUserAndCourse(req, [], ['-raw', '-points', '-splits'])
    if (course.isPermitted('modify', user)) {
      // define available fields
      const fields = [
        'name', 'description', 'public', 'source', 'cutoff',
        'race', 'eventStart', 'eventTimezone',
        'override', 'points',
        'distance', 'gain', 'loss', 'loops'
      ]
      if (user.admin) fields.push('_user', 'link')

      //  add values from req to course model
      fields.forEach(f => {
        if (req.body[f] !== undefined) {
          if (!shallowEqual(req.body[f], course[f])) course[f] = req.body[f]
        }
      })

      // update database
      await course.save()

      // respond to request
      res.status(200).json('Update complete')
    } else {
      log.warn('No permission')
      res.status(403).send('No permission')
    }
  } catch (err) {
    log.error(err)
    res.status(400).send(err)
  }
})

// DELETE COURSE OR REMOVE COURSE FROM USER
router.auth.route('/:id').delete(async function (req, res) {
  const log = logger.child({ method: routeName(req) })
  try {
    log.info('run')
    const { user, course } = await getUserAndCourse(req, ['_courses'], [])

    // remove course from user
    await user.removeCourse(course)

    // if user is permitted to modify course, remove user or delete course:
    if (course.isPermitted('modify', user)) {
      // if current user is in the _users list, remove them:
      const i = course._users.findIndex(u => user.equals(u))
      if (i >= 0) course._users.splice(i, 1)

      // current user is the _user, clear it:
      if (user.equals(course._user)) course._user = undefined

      // find out if other people are using the course:
      await course.isDeletable(user)

      // if deletable, remove it:
      if (course.meta.deletable) {
        await course.remove()
        log.info('Course removed from database')
        res.status(200).json('Course removed')

      // otherwise there are still other users for course, save changes:
      } else {
        log.info('Other\'s plans exist for course; removed user')
        await course.save()
        res.status(200).json('User removed from course')
      }
    } else {
      res.status(200).json('Course removed from user')
    }
  } catch (err) {
    log.error(err)
    res.status(400).send('Error removing course.')
  }
})

// GET COURSE
router.auth.route(['/:id', '/link/:id']).get(async function (req, res) {
  const log = logger.child({ method: routeName(req) })
  try {
    log.info('run')
    const { user, course } = await getUserAndCourse(req, [], ['-points', '-raw'])
    if (course.isPermitted('view', user)) {
      await course.addData(user, null)
      if (!course.hasCache()) { await course.updateCache() }

      // set deletable metadata:
      await course.isDeletable(user)

      res.status(200).json(course)
    } else {
      log.warn('No permission')
      res.status(403).send('No permission')
    }
  } catch (err) {
    log.error(err)
    res.status(400).send('Error getting course.')
  }
})

// GET COURSE FIELD
router.auth.route('/:id/field/:field').get(async function (req, res) {
  const log = logger.child({ method: routeName(req) })
  try {
    log.info('run')
    const { user, course } = await getUserAndCourse(req, [], [req.params.field])
    if (course.isPermitted('view', user)) {
      res.status(200).json(course[req.params.field])
    } else {
      log.warn('No permission')
      res.status(403).send('No permission')
    }
  } catch (err) {
    log.error(err)
    res.status(400).send(err)
  }
})

// GET WAYPOINT LIST
router.auth.route('/:id/waypoints').get(async function (req, res) {
  const log = logger.child({ method: routeName(req) })
  try {
    log.info('run')
    const { user, course } = await getUserAndCourse(req)
    if (course.isPermitted('view', user)) {
      const waypoints = await Waypoint.find({ _course: course }).sort('percent location').exec()
      res.status(200).json(waypoints)
    } else {
      res.status(403).send('No permission')
    }
  } catch (err) {
    log.error(err)
    res.status(400).send(err)
  }
})

// GET PLAN LIST
router.auth.route('/:id/plans').get(async function (req, res) {
  const log = logger.child({ method: routeName(req) })
  try {
    log.info('run')
    const { user, course } = await getUserAndCourse(req)
    if (course.isPermitted('view', user)) {
      const plans = await Plan.find({ _course: course, _user: user }).sort('name').exec()
      res.status(200).json(plans)
    } else {
      log.warn('No permission')
      res.status(403).send('No permission')
    }
  } catch (err) {
    log.error(err)
    res.status(400).send('Error retrieving plans')
  }
})

// COPY COURSE
router.auth.route('/:id/copy').put(async function (req, res) {
  const log = logger.child({ method: routeName(req) })
  try {
    log.info('run')
    const { user, course } = await getUserAndCourse(req, [], ['-raw'])
    if (course.isPermitted('view', user)) {
      console.log('course1 ' + course._id)
      const wps = await Waypoint.find({ _course: course }).exec()
      const course2 = new Course(course)
      course2._id = mongoose.Types.ObjectId()
      course2.isNew = true
      course2._user = undefined // depreciated 2021.10.22
      course2._users = [user]
      course2.name = `${course2.name} [copy]`
      course2.link = null
      await course2.save()
      await course2.clearCache()
      console.log('course2 ' + course2._id)
      wps.forEach(async wp => {
        const wp2 = new Waypoint(wp)
        wp2._id = mongoose.Types.ObjectId()
        wp2.isNew = true
        wp2._course = course2
        await wp2.save()
      })
      res.status(200).send('Course copied')
    } else {
      log.warn('No permission')
      res.status(403).send('No permission')
    }
  } catch (err) {
    log.error(err)
    res.status(400).send('Error copying course')
  }
})

// MODIFY COURSE USERS (OWNERS)
router.auth.route('/:id/user/:action/:userId').put(async function (req, res) {
  const log = logger.child({ method: routeName(req) })
  try {
    log.info('run')
    const { action, userId } = req.params
    const { user, course } = await getUserAndCourse(req)
    if (course.isPermitted('modify', user)) {
      // search by id or email:
      const q = isValidObjectId(userId)
        ? { _id: userId }
        : { email: userId }
      const u = await User.findOne(q).exec()

      if (!u) {
        log.warn('User not found.')
        return res.status(404).send('User not found.')
      }

      const i = course._users.findIndex(x => x.equals(u))
      if (action === 'add') {
        // add if not already in the list
        if (i < 0) course._users.push(u)
      } else if (action === 'remove') {
        // remove if it is in the list:
        if (i >= 0) course._users.splice(i, 1)
      } else {
        log.warn(`incorrect action: ${action}`)
        return res.status(400).send('Incorrect action specified')
      }

      // save model
      await course.save()

      // respond
      res.status(200).send(`User ${action} complete`)
    } else {
      log.warn('No permission')
      res.status(403).send('No permission')
    }
  } catch (err) {
    log.error(err)
    res.status(400).send('Error modifying course users')
  }
})

// GROUP ADD
router.auth.route(['/:id/group/add/course/:course', '/:id/group/add/group/:group']).put(async function (req, res) {
  // params.id: ungrouped course database id or race link
  // params.course: other course database id or race link to group with
  // params.group: group database id

  const log = logger.child({ method: routeName(req) })
  try {
    log.info('run')
    const { user, course } = await getUserAndCourse(req, [], ['group'])

    // make sure we have permission:
    if (!course.isPermitted('modify', user)) {
      log.warn('No permission')
      res.status(403).send('No permission')
      return
    }

    // make sure course isn't already in a group
    if (course.group) {
      const warn = `Course ${req.params.id} is already in a group.`
      log.warn(warn)
      res.status(400).send(warn)
      return
    }

    let courseGroup

    // if assigning by a group id:
    if (req.params.group) {
      log.verbose(`Finding course group by id: ${req.params.group}`)

      courseGroup = await CourseGroup.findOne({ _id: req.params.group }).exec()

      if (!courseGroup) {
        const warn = `Course group ${req.params.group} not found.`
        log.warn(warn)
        res.status(404).send(warn)
        return
      }

      // if assigning by a course id:
    } else if (req.params.course) {
      log.verbose(`Finding course group by course: ${req.params.course}`)

      const { course: course2 } = await getUserAndCourse({ params: { id: req.params.course }, user: req.user }, [], ['group'])
      if (!course2) {
        const warn = `Course ${req.params.course} not found.`
        log.warn(warn)
        res.status(404).send(warn)
        return
      } else if (!course2.isPermitted('modify', user)) {
        log.warn('No permission')
        res.status(403).send('No permission')
        return
      }

      // first see if other course has a group already:
      if (course2.group) {
        courseGroup = course2.group
      } else {
        courseGroup = new CourseGroup()
        await courseGroup.save()
        course2.group = courseGroup
        await course2.save()
        log.verbose(`Created new course group: ${courseGroup._id} with course ${course2._id}.`)
      }
    }

    // finally, add our course to group
    course.group = courseGroup
    await course.save()

    const msg = `Added course ${req.params.id} to course group ${courseGroup._id}.`
    log.info(msg)
    res.status(200).send(msg)
  } catch (err) {
    log.error(err)
    res.status(500).send(err)
  }
})

// GET LIST OF COURSES IN GROUP:
router.auth.route('/group/:id/list').get(async function (req, res) {
  const log = logger.child({ method: routeName(req) })
  try {
    log.info('run')
    const user = await getCurrentUser(req)
    const courses = await getcourseGroupList(res, req.params.id, user)
    res.status(200).json(courses)
  } catch (error) {
    log.error(error.stack || error)
    res.status(500).send(error)
  }
})
router.open.route('/group/:id/list').get(async function (req, res) {
  const log = logger.child({ method: routeName(req) })
  try {
    log.info('run')
    const courses = await getcourseGroupList(res, req.params.id)
    res.status(200).json(courses)
  } catch (error) {
    log.error(error.stack || error)
    res.status(500).send(error)
  }
})
async function getcourseGroupList (res, groupId, user = {}) {
  let courses = await Course.find({ group: groupId }).select(['name', '_user', '_users', 'public', 'eventStart']).sort('-eventStart').exec()
  courses = courses.filter(c => c.isPermitted('view', user))
  return courses
}

// function returns user and course based on req.params.id && req.user.sub
async function getUserAndCourse (req, userFields = [], courseFields = []) {
  // add admin field to requested userFields
  userFields = [...userFields, 'admin']

  // add users/public fields to requested courseFields (if not excluding)
  if (!(courseFields[0]?.charAt(0) === '-')) {
    courseFields = [
      ...courseFields,
      '_user', // depreciated 2021.10.22
      '_users',
      'public'
    ]
  }

  // query course by id or link:
  const courseQuery = isValidObjectId(req.params.id)
    ? { _id: req.params.id }
    : { link: req.params.id }

  // pull database
  const [user, course] = await Promise.all([
    getCurrentUser(req, userFields),
    Course.findOne(courseQuery).select(courseFields).exec()
  ])

  // return user and course
  return { user: user, course: course }
}

module.exports = router
