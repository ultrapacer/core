// courseRoutes.js
var express = require('express')
var courseRoutes = express.Router()
const utilities = require('../../shared/utilities')
var Course = require('../models/Course')
var User = require('../models/User')
var Track = require('../models/Track')
var Plan = require('../models/Plan')
var Waypoint = require('../models/Waypoint')

// Defined store route
courseRoutes.route('/').post(async function (req, res) {
  try {
    var user = await User.findOne({ auth0ID: req.user.sub }).exec()
    req.body.track = new Track(req.body.track)
    var course = new Course(req.body)
    course._user = user
    var stats = utilities.calcStats(course.track.points)
    course.distance = stats.distance
    course.gain = stats.gain
    course.loss = stats.loss
    await course.track.save()
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
  var courses = await Course.find({ _user: user }).populate('track', '-points').sort('name').exec()
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
      await course.save()
      res.json('Update complete')
    } else {
      res.status(403).send('No permission')
    }
  } catch (err) {
    res.status(400).send(err)
  }
})

// REMOVE
courseRoutes.route('/:id').delete(async function (req, res) {
  try {
    var user = await User.findOne({ auth0ID: req.user.sub }).exec()
    var course = await Course.findById(req.params.id).exec()
    if (course._user.equals(user._id)) {
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
    if (course._user.equals(user._id)) {
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
courseRoutes.route('/:course').get(async function (req, res) {
  try {
    var user = await User.findOne({ auth0ID: req.user.sub }).exec()
    var course = await Course.findOne({ _id: req.params.course }).populate(['track', '_plan']).exec()
    if (course._user.equals(user._id) || course.public) {
      await validateWaypoints(course, course.waypoints)
      res.json(course)
    } else {
      res.status(403).send('No permission')
    }
  } catch (err) {
    res.status(400).send(err)
  }
})

// GET WAYPOINT LIST
courseRoutes.route('/:course/waypoints').get(async function (req, res) {
  try {
    var user = await User.findOne({ auth0ID: req.user.sub }).exec()
    var course = await Course.findById(req.params.course).exec()
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
courseRoutes.route('/:course/plans').get(async function (req, res) {
  try {
    var user = await User.findOne({ auth0ID: req.user.sub }).exec()
    var course = await Course.findById(req.params.course).exec()
    if (course._user.equals(user._id) || course.public) {
      var plans = await Plan.find({ _course: course }).sort('name').exec()
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
  if (!waypoints.find(waypoint => waypoint.type === 'start') || !waypoints.find(waypoint => waypoint.type === 'finish')) {
    if (!waypoints.find(waypoint => waypoint.type === 'start')) {
      var ws = new Waypoint({
        name: 'Start',
        type: 'start',
        location: 0,
        _course: course._id,
        elevation: course.track.points[0].alt,
        lat: course.track.points[0].lat,
        lon: course.track.points[0].lon
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
        elevation: course.track.points[course.track.points.length - 1].alt,
        lat: course.track.points[course.track.points.length - 1].lat,
        lon: course.track.points[course.track.points.length - 1].lon
      })
      await wf.save()
      waypoints.push(wf)
    }
  }
  return waypoints
}

module.exports = courseRoutes
