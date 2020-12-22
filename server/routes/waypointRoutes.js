// waypointRoutes.js
const express = require('express')
const waypointRoutes = express.Router()
const Course = require('../models/Course')
const Waypoint = require('../models/Waypoint')
const User = require('../models/User')

// SAVE NEW
waypointRoutes.route('/').post(async function (req, res) {
  try {
    const waypoint = new Waypoint(req.body)
    if (isNaN(waypoint.terrainFactor)) {
      waypoint.terrainFactor = null
    }
    waypoint._user = await User.findOne({ auth0ID: req.user.sub }).exec()
    const course = await Course.findById(waypoint._course).select('_user').exec()
    if (waypoint._user.equals(course._user)) {
      await waypoint.save()
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

//  UPDATE
waypointRoutes.route('/:id').put(async function (req, res) {
  try {
    const user = await User.findOne({ auth0ID: req.user.sub }).exec()
    const waypoint = await Waypoint.findById(req.params.id).exec()
    const course = await Course.findById(waypoint._course).select('_user').exec()
    if (user.equals(course._user)) {
      waypoint.name = req.body.name
      waypoint.location = req.body.location
      waypoint.type = req.body.type
      waypoint.tier = req.body.tier
      waypoint.description = req.body.description
      waypoint.elevation = req.body.elevation
      waypoint.lat = req.body.lat
      waypoint.lon = req.body.lon
      waypoint.pointsIndex = req.body.pointsIndex
      const tF = req.body.terrainFactor
      waypoint.terrainFactor = isNaN(tF) ? null : tF
      await waypoint.save()
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

// DELETE
waypointRoutes.route('/:id').delete(async function (req, res) {
  try {
    const user = await User.findOne({ auth0ID: req.user.sub }).exec()
    const waypoint = await Waypoint.findById(req.params.id).populate('_course', '_user').exec()
    if (waypoint._course._user.equals(user._id)) {
      await waypoint._course.clearCache()
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
