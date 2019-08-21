// publicRoutes.js
var express = require('express')
var publicRoutes = express.Router()
var Course = require('../models/Course')
var Plan = require('../models/Plan')
var User = require('../models/User')

// GET COURSE
publicRoutes.route('/course/:_id').get(async function (req, res) {
  try {
    let q = { _id: req.params._id }
    var course = await Course.findOne(q).populate(['_plan']).exec()
    if (course.public) {
      course.plans = []
      course._plan = null
      course.altModel = null
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
    let q = { _id: req.params._id }
    let plan = await Plan.findById(req.params._id).exec()
    let course = await Course.findOne({ _id: plan._course }).exec()
    if (course.public) {
      q = { _course: course, _user: plan._user }
      course.plans = await Plan.find(q).sort('name').exec()
      course._plan = req.params._id
      let planUser = await User.findOne({ _id: plan._user }).exec()
      course.altModel = planUser.altModel
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
