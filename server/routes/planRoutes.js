// planRoutes.js
var express = require('express')
var planRoutes = express.Router()
var User = require('../models/User')
var Plan = require('../models/Plan')
var Course = require('../models/Course')

// SAVE NEW
planRoutes.route('/').post(async function (req, res) {
  try {
    var plan = new Plan(req.body)
    plan._user = await User.findOne({ auth0ID: req.user.sub }).exec()
    await plan.save()
    await Course.update({ _id: plan._course }, { _plan: plan }).exec()
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
    var plan = await Plan.findById(req.params.id).populate('_course', '_user').exec()
    if (plan._course._user.equals(user._id)) {
      plan.name = req.body.name
      plan.description = req.body.description
      plan.pacingMethod = req.body.pacingMethod
      plan.pacingTarget = req.body.pacingTarget
      plan.drift = req.body.drift
      plan.waypointDelay = req.body.waypointDelay
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
    var plan = await Plan.findById(req.params.id).populate('_course', '_user').exec()
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
