const express = require('express')
const waypointRoutes = express.Router()
const shallowEqual = require('../../core/util/shallow-equal')
const Course = require('../models/Course')
const Waypoint = require('../models/Waypoint')
const { getCurrentUser, routeName } = require('../util')
const logger = require('winston').child({ file: 'waypointRoutes.js' })

// SAVE NEW
waypointRoutes.route('/').post(async function (req, res) {
  const log = logger.child({ method: routeName(req) })
  log.info('run')
  try {
    const waypoint = new Waypoint(req.body)
    if (isNaN(waypoint.terrainFactor)) {
      waypoint.terrainFactor = null
    }
    waypoint._user = await getCurrentUser(req, 'admin')
    waypoint._course = await Course.findById(waypoint._course).select(['_user', '_users']).exec()
    if (waypoint._course.isPermitted('modify', waypoint._user)) {
      await waypoint.save()
      res.status(200).json('Update complete')
    } else {
      log.warn('No permission')
      res.status(403).send('No permission')
    }
  } catch (err) {
    log.error(err)
    res.status(400).send('Error saving new waypoint')
  }
})

//  UPDATE
waypointRoutes.route('/:id').put(async function (req, res) {
  const log = logger.child({ method: routeName(req) })
  log.info('run')
  try {
    const [user, waypoint] = await Promise.all([
      getCurrentUser(req, 'admin'),
      Waypoint
        .findById(req.params.id)
        .populate([{ path: '_course', select: ['_user', '_users'] }])
        .exec()
    ])
    if (waypoint._course.isPermitted('modify', user)) {
      // add values from req to waypoint model
      const fields = Object.keys(Waypoint.schema.obj).filter(k => k.charAt(0) !== '_')
      fields.forEach(f => {
        if (req.body[f] !== undefined) {
          if (!shallowEqual(req.body[f], waypoint[f])) waypoint[f] = req.body[f]
        }
      })

      // update database
      await waypoint.save()

      res.status(200).send('Update complete')
    } else {
      log.warn('No permission')
      res.status(403).send('No permission')
    }
  } catch (err) {
    log.error(err)
    res.status(400).send('Error updating waypoint')
  }
})

// DELETE
waypointRoutes.route('/:id').delete(async function (req, res) {
  const log = logger.child({ method: routeName(req) })
  log.info('run')
  try {
    const [user, waypoint] = await Promise.all([
      getCurrentUser(req, 'admin'),
      Waypoint
        .findById(req.params.id)
        .populate([{ path: '_course', select: ['_user', '_users'] }])
        .exec()
    ])
    if (waypoint._course.isPermitted('modify', user)) {
      await waypoint.remove()
      res.status(200).send('Successfully removed')
    } else {
      log.warn('No permission')
      res.status(403).send('No permission')
    }
  } catch (err) {
    log.error(err)
    res.status(400).send('Error deleting waypoint')
  }
})

module.exports = waypointRoutes
