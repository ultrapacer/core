const express = require('express')
const mongoose = require('mongoose')
const Course = require('../models/Course')
const CourseGroup = require('../models/CourseGroup')
const User = require('../models/User')
const Plan = require('../models/Plan')
const Track = require('../models/Track')
const Points = require('../models/Points')
const Waypoint = require('../models/Waypoint')
const shallowEqual = require('../../core/util/shallow-equal')
const { isValidObjectId, getCurrentUser, routeName } = require('../util')
const logger = require('winston').child({ file: 'courseRoutes.js' })

const router = {
  auth: express.Router(), // authenticated
  open: express.Router() // unauthenticated
}

// utility function to reformat points array for database insertion
function reformatPoints (points) {
  // there was an older format w/ array of 5
  const adjust = points[0].length === 5 ? 1 : 0
  return {
    lat: points.map(x => x[0 + adjust]),
    lon: points.map(x => x[1 + adjust]),
    alt: points.map(x => x[2 + adjust])
  }
}

// utility function to check permission and respond if needed
function checkPermission (res, log, course, user, perm) {
  if (!course.isPermitted(perm, user)) {
    log.warn('No permission')
    res.status(403).send('No permission')
    return false
  }
  return true
}

// utility funciton to check course existence and respond 404 if needed
function checkExists (res, log, course) {
  if (!course) {
    log.warn('Not found')
    res.status(404).send('Not found')
    return false
  }
  return true
}

// SAVE NEW
router.auth.route('/').post(async function (req, res) {
  const log = logger.child({ method: routeName(req) })
  try {
    log.info('run')
    const user = await getCurrentUser(req)
    const course = new Course(req.body.course)
    const track = new Track(req.body.track)
    const points = new Points(reformatPoints(req.body.track.points))

    course._user = user // depreciated 2021.10.22
    course._users = [user]

    // create start waypoint:
    const ws = new Waypoint({
      name: 'Start',
      type: 'start',
      location: 0,
      percent: 0,
      _course: course,
      lat: points.lat[0],
      lon: points.lon[0],
      elevation: points.alt[0]
    })

    // create finish waypoint:
    const last = points.lat.length - 1
    const wf = new Waypoint({
      name: 'Finish',
      type: 'finish',
      location: course.distance,
      percent: 1,
      _course: course,
      lat: points.lat[last],
      lon: points.lon[last],
      elevation: points.alt[last]
    })

    await points.save()
    track.points = points

    await track.save()
    course.track = track

    await course.save()
    log.info('Course saved')

    await ws.save()
    log.info('Start waypoint created')

    await wf.save()
    log.info('Finish waypoint created')

    res.status(200).json({ id: course._id, post: 'Course added successfully' })
  } catch (error) {
    log.error(error)
    res.status(500).send('Error creating course.')
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
      .select(['name', 'distance', 'gain', 'loss', 'loops', 'override', 'link', '_user', '_users', 'group', 'eventStart'])
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
    res.status(500).send('Error retrieving course list.')
  }
})

// UPDATE
router.auth.route('/:id').put(async function (req, res) {
  const log = logger.child({ method: routeName(req) })
  try {
    log.info(req.params.id)

    // execute database functions
    const [user, course] = await Promise.all([
      getCurrentUser(req, 'admin'),
      Course.findOne(courseQuery(req.params.id)).populate({
        path: 'track',
        populate: { path: 'points', select: '_id' }
      }).exec()
    ])

    if (!checkPermission(res, log, course, user, 'modify')) return

    if (req.body.track) {
      const llas = reformatPoints(req.body.track.points)

      const courses = await Course.find({ track: course.track }).select('_id').exec()
      log.verbose(`${courses.length} course(s) are using track ${course.track._id}.`)

      if (courses.length > 1) {
        log.info('Creating new database objects for track & points.')
        const points = new Points(llas)
        await points.save()

        const track = new Track({ source: req.body.track.source })
        track.points = points
        await track.save()

        course.track = track
      } else {
        course.track.source = req.body.track.source
        ;['lat', 'lon', 'alt'].forEach(x => { course.track.points[x] = llas[x] })

        await course.track.points.save()
        await course.track.save()
      }
    }

    if (req.body.course) {
      // define available fields
      const courseFields = [
        'name', 'description', 'public', 'cutoff',
        'race', 'eventStart', 'eventTimezone',
        'override', 'distance', 'gain', 'loss', 'loops'
      ]
      if (user.admin) courseFields.push('_user', 'link')

      //  add values from req to course model
      courseFields.forEach(f => {
        if (req.body.course[f] !== undefined) {
          if (!shallowEqual(req.body.course[f], course[f])) course[f] = req.body.course[f]
        }
      })

      // update database
      await course.save()
    }

    // respond to request
    res.status(200).json('Update complete')
  } catch (error) {
    log.error(error)
    res.status(500).send('Error updating course.')
  }
})

// DELETE COURSE OR REMOVE COURSE FROM USER
router.auth.route('/:id').delete(async function (req, res) {
  const log = logger.child({ method: routeName(req) })
  try {
    log.info(`id: ${req.params.id}`)

    const cq = courseQuery(req.params.id)

    // execute database functions
    const [user, course] = await Promise.all([
      getCurrentUser(req, ['admin', '_courses']),
      Course.findOne(cq).populate({
        // populate track & patch objects for cascading removals
        path: 'track',
        populate: { path: 'points', select: '_id' }
      }).exec()
    ])

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
  } catch (error) {
    log.error(error)
    res.status(500).send('Error removing course.')
  }
})

// GET COURSE
router.auth.route(['/:id', '/link/:id']).get(async function (req, res) {
  getCourse(true, req, res, req.params.id)
})
router.open.route(['/:id', '/link/:id']).get(async function (req, res) {
  getCourse(false, req, res, req.params.id)
})
async function getCourse (auth, req, res, id) {
  const log = logger.child({ method: `getCourse-${auth ? 'auth' : 'open'}` })
  try {
    log.info(id)

    const cq = courseQuery(id)
    const queries = [Course.findOne(cq).populate(['track']).exec()]

    // if auth, also get user, otherwise empty user
    queries.push(auth ? getCurrentUser(req, 'admin') : {})

    // execute database functions
    const [course, user] = await Promise.all(queries)

    // make sure it exists
    if (!checkExists(res, log, course)) return

    // check permissions
    if (!checkPermission(res, log, course, user, 'view')) return

    // TEMPORARY, if no track object create one (for 1.2.0 migration)
    if (!course.track) {
      log.warn('TEMPORARY: creating Track from Course.points')
      const c = await Course.findOne(cq).exec()
      const points = new Points(reformatPoints(c.points))
      await points.save()
      const track = new Track({ source: c.source })
      track.points = points
      await track.save()
      course.track = track

      course.source = undefined
      course.points = undefined
      course.raw = undefined

      course.save()
    }

    await course.addData(auth ? user : null)
    if (!course.hasCache()) { await course.updateCache() }

    // set deletable metadata:
    if (auth) await course.isDeletable(user)

    res.status(200).json(course)
  } catch (error) {
    log.error(error)
    res.status(500).send('Error retrieving course.')
  }
}

// GET COURSE FIELD
router.auth.route('/:id/field/:field').get(async function (req, res) {
  getCourseField(true, req, res, req.params.id, req.params.field)
})
router.open.route('/:id/field/:field').get(async function (req, res) {
  getCourseField(false, req, res, req.params.id, req.params.field)
})
async function getCourseField (auth, req, res, id, field) {
  const log = logger.child({ method: `getCourseField-${auth ? 'auth' : 'open'}` })
  try {
    log.info(`Course: ${id}, Field: ${field}`)

    const cq = courseQuery(id)
    const queries = [Course.findOne(cq).select(['_user', '_users', 'public', field]).exec()]

    // if auth, also get user, otherwise empty user
    queries.push(auth ? getCurrentUser(req, 'admin') : {})

    // execute database functions
    const [course, user] = await Promise.all(queries)

    // check permissions (a check for 'public' is allowed for anybody)
    if (field !== 'public' && !checkPermission(res, log, course, user, 'view')) return

    res.status(200).json(course[field])
  } catch (error) {
    log.error(error)
    res.status(500).send('Error retrieving field.')
  }
}

// GET WAYPOINT LIST
router.auth.route('/:id/waypoints').get(async function (req, res) {
  const log = logger.child({ method: routeName(req) })
  try {
    log.info('run')
    const { user, course } = await getUserAndCourse(req)

    // check permissions
    if (!checkPermission(res, log, course, user, 'view')) return

    const waypoints = await Waypoint.find({ _course: course }).sort('percent location').exec()
    res.status(200).json(waypoints)
  } catch (error) {
    log.error(error)
    res.status(500).send('Error retrieving waypoints.')
  }
})

// GET PLAN LIST
router.auth.route('/:id/plans').get(async function (req, res) {
  const log = logger.child({ method: routeName(req) })
  try {
    log.info('run')
    const { user, course } = await getUserAndCourse(req)

    // check permissions
    if (!checkPermission(res, log, course, user, 'view')) return

    const plans = await Plan.find({ _course: course, _user: user }).sort('name').exec()
    res.status(200).json(plans)
  } catch (error) {
    log.error(error)
    res.status(500).send('Error retrieving plans.')
  }
})

// COPY COURSE
router.auth.route('/:id/copy').put(async function (req, res) {
  const log = logger.child({ method: routeName(req) })
  try {
    log.info(`id: ${req.params.id}`)

    const [user, course] = await Promise.all([
      getCurrentUser(req, 'admin'),
      Course.findOne(courseQuery(req.params.id)).exec()
    ])

    // check permissions
    if (!checkPermission(res, log, course, user, 'view')) return

    log.verbose('Copying course')
    const course2 = new Course(course)
    course2._id = mongoose.Types.ObjectId()
    course2.isNew = true
    course2._users = [user]
    course2.name = req.body.name || `${course2.name} [copy]`
    course2.link = null
    await course2.save()
    await course2.clearCache()

    log.verbose('Copying waypoints')
    const wps = await Waypoint.find({ _course: course }).exec()
    wps.forEach(async wp => {
      const wp2 = new Waypoint(wp)
      wp2._id = mongoose.Types.ObjectId()
      wp2.isNew = true
      wp2._course = course2
      await wp2.save()
    })
    res.status(200).send(course2._id)
  } catch (error) {
    log.error(error)
    res.status(500).send('Error copying course.')
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
  } catch (error) {
    log.error(error)
    res.status(500).send('Error modifying course owners.')
  }
})

// HAS COURSE PERMISSION
router.auth.route('/:id/permission/:permission').get(async function (req, res) {
  getCoursePermission(true, req, res, req.params.id, req.params.permission)
})
router.open.route('/:id/permission/:permission').get(async function (req, res) {
  getCoursePermission(false, req, res, req.params.id, req.params.permission)
})
async function getCoursePermission (auth, req, res, id, permission) {
  const log = logger.child({ method: `getCoursePermission-${auth ? 'auth' : 'open'}` })
  try {
    log.verbose(`Course: ${id}, Permission: ${permission}`)
    const cq = courseQuery(id)
    const queries = [Course.findOne(cq).select(['_user', '_users', 'public']).exec()]

    // if auth, also get user, otherwise empty user
    queries.push(auth ? getCurrentUser(req, 'admin') : {})

    // execute database functions
    const [course, user] = await Promise.all(queries)

    // make sure course exists
    if (!checkExists(res, log, course)) return

    // check permissions
    const hasPermission = course.isPermitted(permission, user)
    log.verbose(`Course: ${id}, Permission: ${permission}, Result: ${hasPermission}`)

    // respond
    res.status(200).json(hasPermission)
  } catch (error) {
    log.error(error)
    res.status(500).send('Error retrieving field.')
  }
}

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
    if (!checkPermission(res, log, course, user, 'modify')) return

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

      const course2 = await Course.findOne(courseQuery(req.params.course)).exec()
      if (!course2) {
        const warn = `Course ${req.params.course} not found.`
        log.warn(warn)
        res.status(404).send(warn)
        return
      }

      // make sure we have permission:
      if (!checkPermission(res, log, course2, user, 'modify')) return

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
  } catch (error) {
    log.error(error)
    res.status(500).send('Error grouping course.')
  }
})

// GET LIST OF COURSES IN GROUP:
router.auth.route('/group/:id/list').get(async function (req, res) {
  getcourseGroupList(true, req, res, req.params.id)
})
router.open.route('/group/:id/list').get(async function (req, res) {
  getcourseGroupList(false, req, res, req.params.id)
})
async function getcourseGroupList (auth, req, res, id) {
  const log = logger.child({ method: `getcourseGroupList-${auth ? 'auth' : 'open'}` })
  try {
    log.verbose(`id: ${req.params.id}`)
    const queries = [Course.find({ group: id }).select(['name', '_users', 'public', 'eventStart']).sort('-eventStart').exec()]

    // if auth, also get user, otherwise empty user
    queries.push(auth ? getCurrentUser(req, 'admin') : {})

    // execute database functions
    let [courses, user] = await Promise.all(queries)

    // filter by permissions
    courses = courses.filter(c => c.isPermitted('view', user))

    res.status(200).json(courses)
  } catch (error) {
    log.error(error)
    res.status(500).send('Error retrieving course group list.')
  }
}

function courseQuery (id) {
  return isValidObjectId(id)
    ? { _id: id }
    : { link: id }
}

// function returns user and course based on req fields
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
  const cq = courseQuery(req.params.id)

  // pull database
  const [user, course] = await Promise.all([
    getCurrentUser(req, userFields),
    Course.findOne(cq).select(courseFields).exec()
  ])

  // return user and course
  return { user: user, course: course }
}

module.exports = router
