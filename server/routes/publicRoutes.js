// publicRoutes.js
var express = require('express')
var publicRoutes = express.Router()
var Course = require('../models/Course')
var Waypoint = require('../models/Waypoint')
var Plan = require('../models/Plan')

// GET PLAN LIST
publicRoutes.route('/course/plans/:courseID').get(async function (req, res) {
  try {
    var course = await Course.findById(req.params.courseID).exec()
    if (course.public) {
      var plans = await Plan.find({ _course: req.params.courseID }).sort('name').exec()
      res.json(plans)
    } else {
      res.status(403).send('No permission')
    }
  } catch (err) {
    console.log(err)
    res.status(400).send(err)
  }
})

module.exports = publicRoutes
