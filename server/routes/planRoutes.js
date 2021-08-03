// planRoutes.js
const express = require('express')
const planRoutes = express.Router()
const User = require('../models/User')
const Plan = require('../models/Plan')

// SAVE NEW
planRoutes.route('/').post(async function (req, res) {
  try {
    const plan = new Plan(req.body)
    plan._user = await User.findOne({ auth0ID: req.user.sub }).exec()
    await plan.save()
    if (!plan._user._courses.find(x => plan._course.equals(x))) {
      plan._user._courses.push(plan._course)
      await plan._user.save()
    }
    res.json(plan)
  } catch (err) {
    console.log(err)
    res.status(400).send(err)
  }
})

//  UPDATE
planRoutes.route('/:id').put(async function (req, res) {
  try {
    const [user, plan] = await Promise.all([
      User.findOne({ auth0ID: req.user.sub }).select('admin').exec(),
      Plan.findById(req.params.id).select('_user').exec()
    ])
    if (user.admin || user.equals(plan._user)) {
      const fields = [
        'name', 'description', 'pacingMethod', 'pacingTarget',
        'drift', 'heatModel', 'waypointDelay', 'waypointDelays',
        'eventStart', 'eventTimezone'
      ]
      const update = {}
      fields.forEach(f => {
        if (req.body[f] !== undefined) {
          update[f] = req.body[f]
        }
      })
      await plan.updateOne(update)
      res.json('Update complete')
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
    const user = await User.findOne({ auth0ID: req.user.sub }).exec()
    const plan = await Plan.findById(req.params.id).select('_user').exec()
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
