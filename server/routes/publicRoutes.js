// publicRoutes.js
var express = require('express')
var publicRoutes = express.Router()
var Course = require('../models/Course')
var Waypoint = require('../models/Waypoint')
var Plan = require('../models/Plan')

// GET COURSE
publicRoutes.route('/course/:course').get(async function (req, res) {
  try {
    var course = await Course.find({ _id: req.params.course }).populate(['_plan']).exec()
    if (course.public) {
      course.waypoints = await Waypoint.find({ _course: course }).sort('location').exec()
      course.plans = await Plan.find({ _course: course }).sort('name').exec()
      user = await User.find({ _id: _course._user._id }).select('altModel').exec()
      course.altModel = user.altModel
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
