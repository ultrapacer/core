// publicRoutes.js
const express = require('express')
const routes = express.Router()
const Course = require('../models/Course')

// GET COURSE PUBLIC
routes.route('/up-table/:_id/:mode').get(async function (req, res) {
  try {
    const query = {
      _id: req.params._id,
      public: true
    }
    const select = [
      'distance',
      'gain',
      'loss',
      'scales',
      `splits.${req.params.mode}`
    ]
    const course = await Course.findOne(query).select(select).exec()
    await course.addData()
    if (!course.splits[req.params.mode].length) { await course.updateCache() }
    res.json(course)
  } catch (err) {
    console.log(err)
    res.status(400).send(err)
  }
})

module.exports = routes
