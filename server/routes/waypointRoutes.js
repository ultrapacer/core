// waypointRoutes.js
var express = require('express')
var waypointRoutes = express.Router()
var Waypoint = require('../models/Waypoint')
var Course = require('../models/Course')
var GPX = require('../models/GPX')

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
waypointRoutes.route('/:id').put(function (req, res) {
  Waypoint.findById(req.params.id, function(err, waypoint) {
    if (!waypoint)
      return next(new Error('Could not load Document'))
    else {
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
      .catch(err => {
            res.status(400).send("unable to update the database")
      })
    }
  })
})

//  UPDATE
waypointRoutes.route('/:id/segment').put(function (req, res) {
  Waypoint.findById(req.params.id, function(err, waypoint) {
    if (!waypoint)
      return next(new Error('Could not load Document'));
    else {
      waypoint.terrainIndex = req.body.terrainIndex
      waypoint.segmentNotes = req.body.segmentNotes
      waypoint.save().then(post => {
        res.json('Update complete')
      })
      .catch(err => {
        res.status(400).send("unable to update the database")
      })
    }
  })
})

// DELETE
waypointRoutes.route('/:id').delete(function (req, res) {
  console.log('delete ' + req.params.id)
  Waypoint.findByIdAndRemove({_id: req.params.id}, function(err, waypoint){
        if(err) res.json(err);
        else res.json('Successfully removed');
    });
});

module.exports = waypointRoutes;