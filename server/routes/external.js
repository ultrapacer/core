// publicRoutes.js
const express = require('express')
const routes = express.Router()
const Course = require('../models/Course')
const ObjectId = require('mongoose').Types.ObjectId
const logger = require('winston').child({ file: 'external.js' })
const { routeName } = require('../util')

function isValidObjectId (id) {
  if (ObjectId.isValid(id)) {
    if ((String)(new ObjectId(id)) === id) { return true }
    return false
  }
  return false
}

// GET DATA FOR THE "UP TABLE" EXTERNAL COMPONENT
routes.route('/up-table/:_id/:mode').get(async function (req, res) {
  const log = logger.child({ method: routeName(req) })
  try {
    log.info(`id: {req.params._id}, mode: ${req.params.mode}`)
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
      'loops',
      'override',
      `splits.${req.params.mode}`
    ]
    const course = await Course.findOne(query).select(select).exec()
    await course.addData()
    if (!course.hasCache(req.params.mode)) { await course.updateCache() }
    res.json(course)
  } catch (error) {
    log.error(error)
    res.status(500).send('Error retrieving data for component')
  }
})

module.exports = routes
