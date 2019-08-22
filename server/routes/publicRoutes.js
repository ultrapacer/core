// publicRoutes.js
var express = require('express')
var publicRoutes = express.Router()
var Course = require('../models/Course')
var Plan = require('../models/Plan')
var User = require('../models/User')
var Waypoint = require('../models/Waypoint')

// GET COURSE
publicRoutes.route('/course/:_id').get(async function (req, res) {
  try {
    let q = { _id: req.params._id }
    var course = await Course.findOne(q).populate(['_plan']).exec()
    if (course.public) {
      await course.addData()
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
publicRoutes.route('/course/plan/:_id').get(async function (req, res) {
  try {
    let plan = await Plan.findById(req.params._id).populate(['_user', '_course']).exec()
    let course = plan._course
    if (course.public) {
      await course.addData(plan._user, req.params._id)
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
