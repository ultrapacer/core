// courseRoutes.js
var express = require('express')
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
  var courses = await Course.find(q).select('-points')
    .collation({'locale': 'en'}).sort('name').exec()
  res.json(courses)
})

// UPDATE
courseRoutes.route('/:id').put(async function (req, res) {
  try {
    let [user, course] = await Promise.all([
      User.findOne({ auth0ID: req.user.sub }).exec(),
      Course.findById(req.params.id).exec()
    ])
    if (course._user.equals(user._id)) {
      let fields = ['name', 'description', 'public', 'eventStart', 'eventTimezone']
      if (req.body.points) {
        fields.push('points', 'source', 'distance', 'gain', 'loss')
      }
      fields.forEach(f => {
        course[f] = req.body[f]
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
        await Plan.remove({_course: this._id, _user: user}).exec()
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
courseRoutes.route('/:_id').get(async function (req, res) {
  try {
    let user = await User.findOne({ auth0ID: req.user.sub }).exec()
    let course = await Course.findById(req.params._id).select('-points').exec()
    if (user.equals(course._user) || course.public) {
      await course.addData(user, null)
      await validateWaypoints(course, course.waypoints)
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
    let user = await User.findOne({ auth0ID: req.user.sub }).exec()
    let plan = await Plan.findById(req.params._id).populate(['_user', '_course']).exec()
    let course = plan._course
    if (course._user.equals(user._id) || course.public) {
      await course.addData(plan._user, req.params._id)
      res.json(course)
    } else {
      res.status(403).send('No permission')
    }
  } catch (err) {
    console.log(err)
    res.status(400).send(err)
  }
})

// GET COURSE POINTS
courseRoutes.route('/:course/points').get(async function (req, res) {
  try {
    var user = await User.findOne({ auth0ID: req.user.sub }).exec()
    let q = {
      _id: req.params.course,
      $or: [ { _user: user }, { public: true } ]
    }
    var course = await Course.findOne(q).select('points').exec()
    let p = course.points.map(x => {
      return [x.lat, x.lon, x.alt]
    })
    res.json(p)
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
      await validateWaypoints(course, waypoints)
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

// ADD COURSE TO USER:
courseRoutes.route('/:course/use').put(async function (req, res) {
  console.log(1)
  try {
    let [user, course] = await Promise.all([
      User.findOne({ auth0ID: req.user.sub }).exec(),
      Course.findById(req.params.course).select(['_user', 'public']).exec()
    ])
    if (user.equals(course._user) || course.public) {
      if (!user._courses.find(x => course.equals(x))) {
        user._courses.push(course)
        await user.save()
      }
      res.json('Update complete')
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

async function validateWaypoints (course, waypoints) {
  if (
    !waypoints.find(waypoint => waypoint.type === 'start') ||
    !waypoints.find(waypoint => waypoint.type === 'finish')
  ) {
    if (!waypoints.find(waypoint => waypoint.type === 'start')) {
      var ws = new Waypoint({
        name: 'Start',
        type: 'start',
        location: 0,
        _course: course._id,
        elevation: course.points[0].alt,
        lat: course.points[0].lat,
        lon: course.points[0].lon
      })
      await ws.save()
      waypoints.unshift(ws)
    }
    if (!waypoints.find(waypoint => waypoint.type === 'finish')) {
      var wf = new Waypoint({
        name: 'Finish',
        type: 'finish',
        location: course.distance,
        _course: course._id,
        elevation: course.points[course.points.length - 1].alt,
        lat: course.points[course.points.length - 1].lat,
        lon: course.points[course.points.length - 1].lon
      })
      await wf.save()
      waypoints.push(wf)
    }
  }
}

module.exports = courseRoutes
