// courseRoutes.js
const express = require('express')
const mongoose = require('mongoose')
const courseRoutes = express.Router()
const Course = require('../models/Course')
const User = require('../models/User')
const Plan = require('../models/Plan')
const Waypoint = require('../models/Waypoint')

// SAVE NEW
courseRoutes.route('/').post(async function (req, res) {
  try {
    const user = await User.findOne({ auth0ID: req.user.sub }).exec()
    const course = new Course(req.body)
    course._user = user
    await course.save()

    // create start and finish waypoints:
    const arr = course.reduced ? course.raw : course.points
    const s = arr[0].length === 3 ? 0 : 1
    const ws = new Waypoint({
      name: 'Start',
      type: 'start',
      location: 0,
      _course: course._id,
      lat: arr[0][0 + s],
      lon: arr[0][1 + s],
      elevation: arr[0][2 + s]
    })
    await ws.save()
    const wf = new Waypoint({
      name: 'Finish',
      type: 'finish',
      location: course.distance,
      _course: course._id,
      lat: arr[arr.length - 1][0 + s],
      lon: arr[arr.length - 1][1 + s],
      elevation: arr[arr.length - 1][2 + s]
    })
    await wf.save()

    res.status(200).json({ post: 'Course added successfully' })
  } catch (err) {
    console.log(err)
    res.status(400).send(err)
  }
})

// GET COURSES
courseRoutes.route('/').get(async function (req, res) {
  const user = await User.findOne({ auth0ID: req.user.sub }).exec()
  const q = {
    $or: [
      {
        _user: user
      },
      {
        $and: [
          {
            _id: {
              $in: user._courses
            }
          },
          {
            public: true
          }
        ]
      }
    ]
  }
  const courses = await Course.find(q)
    .select(['name', 'distance', 'gain', 'loss', 'link', '_user'])
    .exec()
  res.json(courses)
})

// UPDATE
courseRoutes.route('/:id').put(async function (req, res) {
  try {
    const user = await User.findOne({ auth0ID: req.user.sub }).select('admin').exec()
    const course = await Course.findById(req.params.id).populate('_user').exec()
    if (user.admin || course._user.auth0ID === req.user.sub) {
      const fields1 = [ // these are benign fields
        'name', 'description', 'public', 'source'
      ]
      const fields2 = [ // these are important fields (requiring clearing cache)
        'eventStart', 'eventTimezone',
        'override', 'points', 'reduced', 'raw',
        'distance', 'gain', 'loss'
      ]
      if (user.admin) {
        fields1.push('_user', 'link')
      }
      const fields = [...fields1, ...fields2]
      let clearCache = false
      fields.forEach(f => {
        if (req.body[f] !== undefined) {
          course[f] = req.body[f]
          if (fields2.includes(f)) clearCache = true
        }
      })
      await course.save()
      if (clearCache) await course.clearCache()
      res.json('Update complete')
    } else {
      res.status(403).send('No permission')
    }
  } catch (err) {
    console.log(err)
    res.status(400).send(err)
  }
})

// DELETE COURSE OR REMOVE COURSE FROM USER
courseRoutes.route('/:id').delete(async function (req, res) {
  try {
    const user = await User.findOne({ auth0ID: req.user.sub }).exec()
    const course = await Course.findById(req.params.id).exec()
    if (user.equals(course._user)) {
      // if owner, delete course
      await course.remove()
      res.json('Course removed')
    } else {
      // if not owner, remove course from course list
      const i = user._courses.findIndex(x => course.equals(x))
      if (i >= 0) {
        user._courses.splice(i, 1)
        await user.save()
        await Plan.deleteMany({ _course: course._id, _user: user._id }).exec()
        res.json('Course removed')
      } else {
        res.status(403).send('No permission')
      }
    }
  } catch (err) {
    res.status(400).send(err)
  }
})

//  UPDATE SELECTED PLAN
courseRoutes.route('/:courseid/plan').put(async function (req, res) {
  try {
    const user = await User.findOne({ auth0ID: req.user.sub }).exec()
    const course = await Course.findById(req.params.courseid).select('_user').exec()
    if (user.equals(course._user)) {
      course._plan = await Plan.findById(req.body.plan).exec()
      await course.save()
      res.json('Update complete')
    } else {
      res.status(403).send('No permission')
    }
  } catch (err) {
    res.status(400).send(err)
  }
})

// GET COURSE
courseRoutes.route(['/:_id', '/link/:link']).get(async function (req, res) {
  try {
    const q = (req.params.link)
      ? { link: req.params.link }
      : { _id: req.params._id }
    const [course, user] = await Promise.all([
      Course.findOne(q).populate('_user')
        .select(['-points', '-raw']).exec(),
      User.findOne({ auth0ID: req.user.sub }).exec()
    ])
    if (course.public || course._user.auth0ID === req.user.sub) {
      await course.addData(user, null)
      if (!course.hasCache()) { await course.updateCache() }
      course._user = course._user._id // don't return all user data, just id
      res.json(course)
    } else {
      res.status(403).send('No permission')
    }
  } catch (err) {
    console.log(err)
    res.status(400).send(err)
  }
})

// GET COURSE BY PLAN
courseRoutes.route('/plan/:_id').get(async function (req, res) {
  try {
    const plan = await Plan.findById(req.params._id)
      .populate(['_user', { path: '_course', select: '-points -raw' }]).exec()
    const course = plan._course
    if (course.public || plan._user.auth0ID === req.user.sub) {
      await course.addData(plan._user, req.params._id)
      if (!course.hasCache()) { await course.updateCache() }
      course._user = course._user._id // don't return all user data, just id
      res.json(course)
    } else {
      res.status(403).send('No permission')
    }
  } catch (err) {
    console.log(err)
    res.status(400).send(err)
  }
})

// GET COURSE FIELD
courseRoutes.route('/:course/field/:field').get(async function (req, res) {
  try {
    const course = await Course.findById(req.params.course).populate('_user')
      .select(['public', '_user', req.params.field]).exec()
    if (course.public || course._user.auth0ID === req.user.sub) {
      res.json(course[req.params.field])
    } else {
      res.status(403).send('No permission')
    }
  } catch (err) {
    console.log(err)
    res.status(400).send(err)
  }
})

// GET COURSE FIELDS
courseRoutes.route(['/:_id/fields', '/link/:link/fields']).put(async function (req, res) {
  try {
    const q = (req.params.link)
      ? { link: req.params.link }
      : { _id: req.params._id }
    const course = await Course.findOne(q).populate('_user')
      .select(['_user', ...req.body]).exec()
    if (course.public || course._user.auth0ID === req.user.sub) {
      course._user = course._user._id // don't return all user data, just id
      res.json(course)
    } else {
      res.status(403).send('No permission')
    }
  } catch (err) {
    console.log(err)
    res.status(400).send(err)
  }
})

// GET WAYPOINT LIST
courseRoutes.route('/:course/waypoints').get(async function (req, res) {
  try {
    const user = await User.findOne({ auth0ID: req.user.sub }).exec()
    const course = await Course.findById(req.params.course).select(['_user', 'public']).exec()
    if (course._user.equals(user._id) || course.public) {
      const waypoints = await Waypoint.find({ _course: course }).sort('location').exec()
      res.json(waypoints)
    } else {
      res.status(403).send('No permission')
    }
  } catch (err) {
    console.log(err)
    res.status(400).send(err)
  }
})

// GET PLAN LIST
courseRoutes.route('/:course/plans/:user_id').get(async function (req, res) {
  try {
    const user = await User.findOne({ auth0ID: req.user.sub }).exec()
    const course = await Course.findById(req.params.course).select(['_user', 'public']).exec()
    if (user.equals(course._user) || course.public) {
      const plans = await Plan.find(
        { _course: course, _user: req.params.user_id }
      ).sort('name').exec()
      res.json(plans)
    } else {
      res.status(403).send('No permission')
    }
  } catch (err) {
    console.log(err)
    res.status(400).send(err)
  }
})

// COPY COURSE
courseRoutes.route('/:id/copy').put(async function (req, res) {
  try {
    const user = await User.findOne({ auth0ID: req.user.sub }).exec()
    const course = await Course.findById(req.params.id).exec()
    if (course._user.equals(user._id) || course.public) {
      console.log('course1 ' + course._id)
      const wps = await Waypoint.find({ _course: course }).sort('location').exec()
      const course2 = new Course(course)
      course2._id = mongoose.Types.ObjectId()
      course2.isNew = true
      course2._user = user
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
      res.json(1)
    } else {
      res.status(403).send('No permission')
    }
  } catch (err) {
    console.log(err)
    res.status(400).send(err)
  }
})

module.exports = courseRoutes
