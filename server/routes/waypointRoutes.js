// waypointRoutes.js
var express = require('express')
var waypointRoutes = express.Router()
var Waypoint = require('../models/Waypoint')
var Course = require('../models/Course')
var GPX = require('../models/GPX')
var User = require('../models/User')

// GET LIST
waypointRoutes.route('/list/:courseID').get(async function (req, res) {
  try {
    var waypoints = await Waypoint.find({ _course: req.params.courseID }).sort('location').exec()
    // check to make sure start and end waypoints exists:
    if (!waypoints.find(waypoint => waypoint.type === 'start') || !waypoints.find(waypoint => waypoint.type === 'finish')) {
      var course = await Course.findOne({ _id: req.params.courseID }).exec()
      var gpx = await GPX.findOne({_id: course._gpx}).exec()
       if (!waypoints.find(waypoint => waypoint.type === 'start')) {
        var ws = new Waypoint({
          name: 'Start',
          type: 'start',
          location: 0,
          _course: req.params.courseID,
          elevation: gpx.points[0].alt,
          lat: gpx.points[0].lat,
          lon: gpx.points[0].lon
        })
        await ws.save()
        waypoints.unshift(ws)
      }
      if (!waypoints.find(waypoint => waypoint.type === 'finish')) {
        var course = await Course.findOne({ _id: req.params.courseID }).exec()
        var wf = new Waypoint({
          name: 'Finish',
          type: 'finish',
          location: course.distance,
          _course: req.params.courseID,
          elevation: gpx.points[gpx.points.length - 1].alt,
          lat: gpx.points[gpx.points.length - 1].lat,
          lon: gpx.points[gpx.points.length - 1].lon
        })
        await wf.save()
        waypoints.push(wf)
      }
    }
    res.json(waypoints)
  } catch (err) {
    console.log(err)
    res.status(400).send(err)
  }
})

// SAVE NEW
waypointRoutes.route('/').post(async function (req, res) {
  try {
    var waypoint = new Waypoint(req.body)
    await waypoint.save()
    res.json('Update complete')
  } catch (err) {
    console.log(err)
    res.status(400).send(err)
  }
})

//  UPDATE
waypointRoutes.route('/:id').put(async function (req, res) {
  try {
    var user = await User.findOne({ auth0ID: req.user.sub }).exec()
    var waypoint = await Waypoint.findById(req.params.id).populate('_course').exec()
    if (waypoint._course._user.equals(user._id)) {
      waypoint.name = req.body.name
      waypoint.location = req.body.location
      waypoint.description = req.body.description
      waypoint.elevation = req.body.elevation
      waypoint.lat = req.body.lat
      waypoint.lon = req.body.lon
      waypoint.pointsIndex = req.body.pointsIndex
      waypoint.save().then(post => {
          res.json('Update complete')
      })
    } else {
      res.status(403).send("No permission")
    }
  } catch (err) {
    res.status(400).send(err)
  }
})

//  UPDATE SEGMENT
waypointRoutes.route('/:id/segment').put(async function (req, res) {
  try {
    var user = await User.findOne({ auth0ID: req.user.sub }).exec()
    var waypoint = await Waypoint.findById(req.params.id).populate('_course').exec()
    if (waypoint._course._user.equals(user._id)) {
      waypoint.terrainIndex = req.body.terrainIndex
      waypoint.segmentNotes = req.body.segmentNotes
      waypoint.save().then(post => {
          res.json('Update complete')
      })
    } else {
      res.status(403).send("No permission")
    }
  } catch (err) {
    res.status(400).send(err)
  }
})

// DELETE
waypointRoutes.route('/:id').delete(async function (req, res) {
  try {
    var user = await User.findOne({ auth0ID: req.user.sub }).exec()
    var waypoint = await Waypoint.findById(req.params.id).populate('_course').exec()
    if (waypoint._course._user.equals(user._id)) {
      await waypoint.remove()
      res.json('Successfully removed');
    } else {
      res.status(403).send("No permission")
    }
  } catch (err) {
    res.status(400).send(err)
  }
})

module.exports = waypointRoutes;