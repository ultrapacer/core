// waypointRoutes.js
var express = require('express')
var waypointRoutes = express.Router()
var Waypoint = require('../models/Waypoint')
var User = require('../models/User')

// SAVE NEW
waypointRoutes.route('/').post(async function (req, res) {
  try {
    var waypoint = new Waypoint(req.body)
    waypoint._user = await User.findOne({ auth0ID: req.user.sub }).exec()
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
    var waypoint = await Waypoint.findById(req.params.id).populate('_course', '_user').exec()
    if (waypoint._course._user.equals(user._id)) {
      waypoint.name = req.body.name
      waypoint.location = req.body.location
      waypoint.type = req.body.type
      waypoint.tier = req.body.tier
      waypoint.description = req.body.description
      waypoint.elevation = req.body.elevation
      waypoint.lat = req.body.lat
      waypoint.lon = req.body.lon
      waypoint.pointsIndex = req.body.pointsIndex
      waypoint.save().then(post => {
        res.json('Update complete')
      })
    } else {
      res.status(403).send('No permission')
    }
  } catch (err) {
    console.log(err)
    res.status(400).send(err)
  }
})

//  UPDATE SEGMENT
waypointRoutes.route('/:id/segment').put(async function (req, res) {
  try {
    var user = await User.findOne({ auth0ID: req.user.sub }).exec()
    var waypoint = await Waypoint.findById(req.params.id).populate('_course', '_user').exec()
    if (waypoint._course._user.equals(user._id)) {
      let tF = req.body.terrainFactor
      if (isNaN(tF)) tF = null
      waypoint.terrainFactor = tF
      waypoint.segmentNotes = req.body.segmentNotes
      waypoint.save().then(post => {
        res.json('Update complete')
      })
    } else {
      res.status(403).send('No permission')
    }
  } catch (err) {
    res.status(400).send(err)
  }
})

// DELETE
waypointRoutes.route('/:id').delete(async function (req, res) {
  try {
    var user = await User.findOne({ auth0ID: req.user.sub }).exec()
    var waypoint = await Waypoint.findById(req.params.id).populate('_course', '_user').exec()
    if (waypoint._course._user.equals(user._id)) {
      await waypoint.remove()
      res.json('Successfully removed')
    } else {
      res.status(403).send('No permission')
    }
  } catch (err) {
    res.status(400).send(err)
  }
})

module.exports = waypointRoutes
