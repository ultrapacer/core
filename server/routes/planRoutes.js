// planRoutes.js
var express = require('express')
var planRoutes = express.Router()
var User = require('../models/User')
var Plan = require('../models/Plan')

// SAVE NEW
planRoutes.route('/').post(async function (req, res) {
  try {
    var plan = new Plan(req.body)
    plan._user = await User.findOne({ auth0ID: req.user.sub }).exec()
    await plan.save()
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
    var plan = await Plan.findById(req.params.id).exec()
    if (user.equals(plan._user)) {
      plan.name = req.body.name
      plan.description = req.body.description
      plan.pacingMethod = req.body.pacingMethod
      plan.pacingTarget = req.body.pacingTarget
      plan.drift = req.body.drift
      plan.startTime = req.body.startTime
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
    var plan = await Plan.findById(req.params.id).select('_user').exec()
    if (user.equals(plan._user)) {
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
