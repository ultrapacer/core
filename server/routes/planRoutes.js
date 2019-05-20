// planRoutes.js
var express = require('express')
var planRoutes = express.Router()
var User = require('../models/User')
var Plan = require('../models/Plan')
var Course = require('../models/Course')

// GET LIST
planRoutes.route('/list/:courseID').get(async function (req, res) {
  try {
    var user = await User.findOne({ auth0ID: req.user.sub }).exec()
    var course = await Course.findById(req.params.courseID).exec()
    if (course._user.equals(user._id) || course.public) {
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

// SAVE NEW
planRoutes.route('/').post(async function (req, res) {
  try {
    var plan = new Plan(req.body)
    plan._user = await User.findOne({ auth0ID: req.user.sub }).exec()
    await plan.save()
    var course = await Course.findById(plan._course).exec()
    course._plan = plan
    course.save()
    res.json(plan)
  } catch (err) {
    console.log(err)
    res.status(400).send(err)
  }
})

//  UPDATE
planRoutes.route('/:id').put(async function (req, res) {
  try {
    var user = await User.findOne({ auth0ID: req.user.sub }).exec()
    var plan = await Plan.findById(req.params.id).populate('_course').exec()
    if (plan._course._user.equals(user._id)) {
      plan.name = req.body.name
      plan.description = req.body.description
      plan.pacingMethod = req.body.pacingMethod
      plan.pacingTarget = req.body.pacingTarget
      plan.time = req.body.time
      plan.pace = req.body.pace
      plan.gap = req.body.gap
      await plan.save()
      res.json(plan)
    } else {
      res.status(403).send('No permission')
    }
  } catch (err) {
    res.status(400).send(err)
  }
})

// DELETE
planRoutes.route('/:id').delete(async function (req, res) {
  try {
    var user = await User.findOne({ auth0ID: req.user.sub }).exec()
    var plan = await Plan.findById(req.params.id).populate('_course').exec()
    if (plan._course._user.equals(user._id)) {
      await plan.remove()
      res.json('Successfully removed')
    } else {
      res.status(403).send('No permission')
    }
  } catch (err) {
    console.log(err)
    res.status(400).send(err)
  }
})

module.exports = planRoutes
