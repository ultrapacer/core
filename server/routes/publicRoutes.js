// publicRoutes.js
var express = require('express')
var publicRoutes = express.Router()
var Course = require('../models/Course')

// GET COURSE
publicRoutes.route('/course/:course').get(async function (req, res) {
  try {
    var q = { _id: req.params.course }
    var course = await Course.findOne(q).populate(['_plan']).exec()
    if (course.public) {
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
