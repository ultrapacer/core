// publicRoutes.js
const express = require('express')
const routes = express.Router()
const Course = require('../models/Course')
const ObjectId = require('mongoose').Types.ObjectId

function isValidObjectId (id) {
  if (ObjectId.isValid(id)) {
    if ((String)(new ObjectId(id)) === id) { return true }
    return false
  }
  return false
}

// GET COURSE PUBLIC
routes.route('/up-table/:_id/:mode').get(async function (req, res) {
  try {
    // search by link or id (if valid id):
    const q = [{
      link: req.params._id
    }]
    if (isValidObjectId(req.params._id)) {
      q.push({ _id: req.params._id })
    }

    const query = {
      $and: [
        {
          public: true
        },
        {
          $or: q
        }
      ]
    }
    const select = [
      'distance',
      'gain',
      'link',
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
