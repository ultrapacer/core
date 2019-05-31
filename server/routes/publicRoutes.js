// publicRoutes.js
var express = require('express')
var publicRoutes = express.Router()
var Course = require('../models/Course')
var Waypoint = require('../models/Waypoint')
var Plan = require('../models/Plan')

// GET COURSE
publicRoutes.route('/course/:course').get(async function (req, res) {
  try {
    var course = await Course.findById(req.params.course).populate(['_gpx', '_plan']).exec()
    if (course.public) {
      course.waypoints = await Waypoint.find({ _course: course }).sort('location').exec()
      course.plans = await Plan.find({ _course: course }).sort('name').exec()
      res.json(course)
    } else {
      res.status(403).send('No permission')
    }
  } catch (err) {
    console.log(err)
    res.status(400).send(err)
  }
})

module.exports = publicRoutes
