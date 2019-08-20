// publicRoutes.js
var express = require('express')
var publicRoutes = express.Router()
var Course = require('../models/Course')
var Plan = require('../models/Plan')

// GET COURSE
let getMatch = ['/course/:_id', '/course/:_id/plan/:plan_id']
publicRoutes.route(getMatch).get(async function (req, res) {
  try {
    let q = { _id: req.params._id }
    var course = await Course.findOne(q).populate(['_plan']).exec()
    if (course.public) {
      if (typeof (req.params.plan_id) !== 'undefined' && course.plans.length) {
        if (!course._plan.equals(req.params.plan_id)) {
          try {
            course._plan = await Plan.findById(req.params.plan_id).exec()
          } catch (err) {
            console.log(err)
          }
        }
      }
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
