// courseRoutes.js
var express = require('express')
var courseRoutes = express.Router()
const multer = require('multer')
const gpxParse = require('gpx-parse')
const utilities = require('../../shared/utilities')
const upload = multer()
var Course = require('../models/Course')
var User = require('../models/User')
var GPX = require('../models/GPX')
var Plan = require('../models/Plan')
var Waypoint = require('../models/Waypoint')

// Defined store route
courseRoutes.route('/').post(upload.single('file'), function (req, res) {
  var query = { auth0ID: req.user.sub }
  User.findOne(query).exec(function (err, user) {
    console.log(user)
    gpxParse.parseGpx(req.file.buffer.toString(), function (error, data) {
      if (error) throw error

      var course = new Course(JSON.parse(req.body.model))
      course._user = user
      console.log(course._user)
      var gpx = new GPX()

      gpx.filename = req.file.path
      gpx.points = utilities.cleanPoints(data.tracks[0].segments[0])
      var stats = utilities.calcStats(gpx.points)
      course.distance = stats.distance
      course.gain = stats.gain
      course.loss = stats.loss

      gpx.save(function (err, record) {
        course._gpx = record
        course.save().then(post => {
          res.status(200).json({'post': 'Course added successfully'})
        })
          .catch(err => {
            console.log(err)
            res.status(400).send('unable to save to database')
          })
      })
    })
  })
})

// GET COURSES
courseRoutes.route('/').get(async function (req, res) {
  var user = await User.findOne({ auth0ID: req.user.sub }).exec()
  var courses = await Course.find({ _user: user }).exec()
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
    var course = await Course.findById(req.params.course).populate(['_gpx', '_plan']).exec()
    if (course._user.equals(user._id) || course.public) {
      course.waypoints = await Waypoint.find({ _course: course }).sort('location').exec()
      await validateWaypoints(course, course.waypoints)
      course.plans = await Plan.find({ _course: course }).sort('name').exec()
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

async function validateWaypoints(course, waypoints) {
  // make sure a start and finish waypoint exist
  if (!waypoints.find(waypoint => waypoint.type === 'start') || !waypoints.find(waypoint => waypoint.type === 'finish')) {
    var gpx = await GPX.findOne({_id: course._gpx}).exec()
    if (!waypoints.find(waypoint => waypoint.type === 'start')) {
      var ws = new Waypoint({
        name: 'Start',
        type: 'start',
        location: 0,
        _course: course._id,
        elevation: gpx.points[0].alt,
        lat: gpx.points[0].lat,
        lon: gpx.points[0].lon
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
        elevation: gpx.points[gpx.points.length - 1].alt,
        lat: gpx.points[gpx.points.length - 1].lat,
        lon: gpx.points[gpx.points.length - 1].lon
      })
      await wf.save()
      waypoints.push(wf)
    }
  }
  return waypoints
}

module.exports = courseRoutes
