// courseRoutes.js
var express = require('express')
var mongoose = require('mongoose')
var courseRoutes = express.Router()
var Course = require('../models/Course')
var User = require('../models/User')
var Plan = require('../models/Plan')
var Waypoint = require('../models/Waypoint')

// SAVE NEW
courseRoutes.route('/').post(async function (req, res) {
  try {
    var user = await User.findOne({ auth0ID: req.user.sub }).exec()
    var course = new Course(req.body)
    course._user = user
    await course.save()

    // create start and finish waypoints:
    var ws = new Waypoint({
      name: 'Start',
      type: 'start',
      location: 0,
      _course: course._id,
      lat: course.raw[0][0],
      lon: course.raw[0][1],
      elevation: course.raw[0][2]
    })
    await ws.save()
    var wf = new Waypoint({
      name: 'Finish',
      type: 'finish',
      location: course.distance,
      _course: course._id,
      lat: course.raw[course.raw.length - 1][0],
      lon: course.raw[course.raw.length - 1][1],
      elevation: course.raw[course.raw.length - 1][2]
    })
    await wf.save()

    res.status(200).json({'post': 'Course added successfully'})
  } catch (err) {
    console.log(err)
    res.status(400).send(err)
  }
})

// GET COURSES
courseRoutes.route('/').get(async function (req, res) {
  var user = await User.findOne({ auth0ID: req.user.sub }).exec()
  let q = {
    $or: [
      {
        _user: user
      },
      {
        _id: {
          $in: user._courses
        }
      }
    ]
  }
  var courses = await Course.find(q).select(['-points', '-raw'])
    .collation({'locale': 'en'}).sort('name').exec()
  res.json(courses)
})

// UPDATE
courseRoutes.route('/:id').put(async function (req, res) {
  try {
    let course = await Course.findById(req.params.id).populate('_user').exec()
    if (course._user.auth0ID === req.user.sub) {
      let fields = ['name', 'link', 'description', 'public', 'eventStart', 'eventTimezone']
      if (req.body.points) {
        fields.push('points', 'raw', 'source', 'distance', 'gain', 'loss')
      }
      fields.forEach(f => {
        if (req.body.hasOwnProperty(f)) {
          course[f] = req.body[f]
        }
      })
      await course.save()
      await course.clearCache()
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
    var user = await User.findOne({ auth0ID: req.user.sub }).exec()
    var course = await Course.findById(req.params.id).exec()
    if (user.equals(course._user)) {
      // if owner, delete course
      await course.remove()
      res.json('Course removed')
    } else {
      // if not owner, remove course from course list
      let i = user._courses.findIndex(x => course.equals(x))
      if (i >= 0) {
        user._courses.splice(i, 1)
        await user.save()
        await Plan.deleteMany({_course: course._id, _user: user._id}).exec()
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
    var user = await User.findOne({ auth0ID: req.user.sub }).exec()
    var course = await Course.findById(req.params.courseid).select('_user').exec()
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
    let q = (req.params.link)
      ? { link: req.params.link }
      : { _id: req.params._id }
    let [course, user] = await Promise.all([
      Course.findOne(q).populate('_user')
        .select(['-points', '-raw']).exec(),
      User.findOne({ auth0ID: req.user.sub }).exec()
    ])
    if (course.public || course._user.auth0ID === req.user.sub) {
      await course.addData(user, null)
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
    let plan = await Plan.findById(req.params._id)
      .populate(['_user', {path: '_course', select: '-points -raw'}]).exec()
    let course = plan._course
    if (course.public || plan._user.auth0ID === req.user.sub) {
      await course.addData(plan._user, req.params._id)
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
    let course = await Course.findById(req.params.course).populate('_user')
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

// GET WAYPOINT LIST
courseRoutes.route('/:course/waypoints').get(async function (req, res) {
  try {
    var user = await User.findOne({ auth0ID: req.user.sub }).exec()
    var course = await Course.findById(req.params.course).select(['_user', 'public']).exec()
    if (course._user.equals(user._id) || course.public) {
      var waypoints = await Waypoint.find({ _course: course }).sort('location').exec()
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
    var user = await User.findOne({ auth0ID: req.user.sub }).exec()
    var course = await Course.findById(req.params.course).select(['_user', 'public']).exec()
    if (user.equals(course._user) || course.public) {
      var plans = await Plan.find(
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

//  UPDATE CACHE
courseRoutes.route('/:id/cache').put(async function (req, res) {
  try {
    let [user, course] = await Promise.all([
      User.findOne({ auth0ID: req.user.sub }).exec(),
      Course.findById(req.params.id).select('_user').exec()
    ])
    if (user.equals(course._user)) {
      course.cache = req.body.cache
      course.save()
      res.json('Cached')
    } else {
      res.status(403).send('No permission')
    }
  } catch (err) {
    res.status(400).send(err)
  }
})

// COPY COURSE
courseRoutes.route('/:id/copy').put(async function (req, res) {
  try {
    var user = await User.findOne({ auth0ID: req.user.sub }).exec()
    var course = await Course.findById(req.params.id).exec()
    if (course._user.equals(user._id) || course.public) {
      console.log('course1 ' + course._id)
      var wps = await Waypoint.find({ _course: course }).sort('location').exec()
      let course2 = new Course(course)
      course2._id = mongoose.Types.ObjectId()
      course2.isNew = true
      course2._user = user
      course2.name = `${course2.name} [copy]`
      course2.link = null
      await course2.save()
      await course2.clearCache()
      console.log('course2 ' + course2._id)
      wps.forEach(async wp => {
        let wp2 = new Waypoint(wp)
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
