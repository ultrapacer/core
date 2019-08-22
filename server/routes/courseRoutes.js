// courseRoutes.js
var express = require('express')
var courseRoutes = express.Router()
var Course = require('../models/Course')
var User = require('../models/User')
var Plan = require('../models/Plan')
var Waypoint = require('../models/Waypoint')
var wputil = require('../../shared/waypointUtilities')

// Defined store route
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
  var courses = await Course.find({ _user: user }).select('-points').sort('name').exec()
  res.json(courses)
})

// UPDATE
courseRoutes.route('/:id').put(async function (req, res) {
  try {
    var user = await User.findOne({ auth0ID: req.user.sub }).exec()
    var course = await Course.findById(req.params.id).exec()
    if (course._user.equals(user._id)) {
      course.name = req.body.name
      course.description = req.body.description
      course.public = req.body.public
      if (req.body.points) {
        course.points = req.body.points
        course.source = req.body.source
        var old = course.distance
        course.distance = req.body.distance
        course.gain = req.body.gain
        course.loss = req.body.loss
        var waypoints = await Waypoint.find({ _course: course })
          .sort('location').exec()
        await Promise.all(waypoints.map(async wp => {
          var wpold = wp.location
          // scale waypoint location for new course distance:
          if (wp.type === 'finish') {
            wp.location = course.distance
          } else {
            wp.location = wp.location * course.distance / old
          }
          if (wp.type !== 'start' && wp.type !== 'finish') {
            try {
              var wpdelta = Math.abs(wpold - wp.location)
              // iteration threshold th:
              var th = Math.max(0.5, Math.min(wpdelta, course.distance))
              // resolve closest distance for waypoint LLA
              wp.location = wputil.nearestLoc(wp, course.points, th)
            } catch (err) {
              console.log(err)
            }
          }
          wputil.updateLLA(wp, course.points)
          await wp.save()
        }))
      }
      await course.save()
      res.json('Update complete')
    } else {
      res.status(403).send('No permission')
    }
  } catch (err) {
    console.log(err)
    res.status(400).send(err)
  }
})

// REMOVE
courseRoutes.route('/:id').delete(async function (req, res) {
  try {
    var user = await User.findOne({ auth0ID: req.user.sub }).exec()
    var course = await Course.findById(req.params.id).exec()
    if (user.equals(course._user)) {
      await course.remove()
      res.json('Course removed')
    } else {
      res.status(403).send('No permission')
    }
  } catch (err) {
    res.status(400).send(err)
  }
})

//  UPDATE SELECTED PLAN
courseRoutes.route('/:courseid/plan').put(async function (req, res) {
  try {
    var user = await User.findOne({ auth0ID: req.user.sub }).exec()
    var course = await Course.findById(req.params.courseid).exec()
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

async function addCourseData(course, user, plan = null) {
  course.waypoints = await Waypoint.find({ _course: course }).sort('location').exec()
  let q = { _course: course, _user: user }
  course.plans = await Plan.find(q).sort('name').exec()
  console.log(course.plans)
  course.altModel = user.altModel
  if (plan) {
    course._plan = plan
  } else {
    course._plan = null
  }
}

// GET COURSE
courseRoutes.route('/:_id').get(async function (req, res) {
  try {
    let user = await User.findOne({ auth0ID: req.user.sub }).exec()
    let q = { _id: req.params._id }
    let course = await Course.findOne(q).exec()
    if (user.equals(course._user) || course.public) {
      await addCourseData(course, user, null)
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
    let q = { _id: req.params._id }
    let plan = await Plan.findById(req.params._id).exec()
    let course = await Course.findOne({ _id: plan._course }).exec()
    if (course._user.equals(user._id) || course.public) {
      let planUser = await User.findOne({ _id: plan._user }).exec()
      await addCourseData(course, planUser, req.params._id)
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
  console.log('getwaypointlist')
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
  return waypoints
}

module.exports = courseRoutes
