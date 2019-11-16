// publicRoutes.js
var express = require('express')
var publicRoutes = express.Router()
var Course = require('../models/Course')
var Plan = require('../models/Plan')

// GET COURSE
publicRoutes.route(['/course/:_id', '/course/permalink/:link']).get(async function (req, res) {
  try {
    let q = { public: true }
    if (req.params._id) {
      q._id = req.params._id
    } else {
      q.link = req.params.link
    }
    var course = await Course.findOne(q).select(['-points', '-raw']).exec()
    await course.addData()
    res.json(course)
  } catch (err) {
    console.log(err)
    res.status(400).send(err)
  }
})

// GET COURSE BY PLAN
publicRoutes.route('/course/plan/:_id').get(async function (req, res) {
  try {
    let plan = await Plan.findById(req.params._id)
      .populate(['_user', {path: '_course', select: '-points -raw'}])
      .exec()
    if (plan._course.public) {
      await plan._course.addData(plan._user, req.params._id)
      res.json(plan._course)
    } else {
      res.status(403).send('No permission')
    }
  } catch (err) {
    console.log(err)
    res.status(400).send(err)
  }
})

// GET COURSE FIELD
publicRoutes.route('/course/:course/field/:field').get(async function (req, res) {
  try {
    let q = {
      _id: req.params.course,
      public: true
    }
    let course = await Course.findOne(q)
      .select(['_user', req.params.field])
      .exec()
    res.json(course[req.params.field])
  } catch (err) {
    console.log(err)
    res.status(400).send(err)
  }
})

module.exports = publicRoutes
