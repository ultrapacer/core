// planRoutes.js
const express = require('express')
const Plan = require('../models/Plan')
const { getCurrentUser, routeName, checkExists, checkCoursePermission } = require('../util')
const logger = require('winston').child({ file: 'planRoutes.js' })

const router = {
  auth: express.Router(), // authenticated
  open: express.Router() // unauthenticated
}

// SAVE NEW
router.auth.route('/').post(async function (req, res) {
  try {
    const plan = new Plan(req.body)
    plan._user = await getCurrentUser(req)
    await plan.save()
    if (!plan._user._courses.find(x => plan._course.equals(x))) {
      plan._user._courses.push(plan._course)
      await plan._user.save()
    }
    res.json(plan)
  } catch (error) {
    logger.child({ method: routeName(req) }).error(error)
    res.status(500).send('Error saving plan')
  }
})

// GET PLAN
router.auth.route('/:id').get(async function (req, res) {
  getPlan(true, req, res, req.params.id)
})
router.open.route('/:id').get(async function (req, res) {
  getPlan(false, req, res, req.params.id)
})
async function getPlan (auth, req, res, id) {
  const log = logger.child({ method: `getPlan-${auth ? 'auth' : 'open'}` })
  try {
    log.info(id)

    const queries = [Plan.findOne({ _id: id }).populate({ path: '_course', select: ['user', '_users', 'public'] }).exec()]

    // if auth, also get user, otherwise empty user
    queries.push(auth ? getCurrentUser(req, 'admin') : {})

    // execute database functions
    const [plan, user] = await Promise.all(queries)

    // make sure it exists
    if (!checkExists(res, log, plan)) return

    // check permissions
    if (!checkCoursePermission(res, log, plan._course, user, 'view')) return

    res.status(200).json(plan)
  } catch (error) {
    log.error(error)
    res.status(500).send('Error retrieving plan')
  }
}

//  UPDATE
router.auth.route('/:id').put(async function (req, res) {
  try {
    const [user, plan] = await Promise.all([
      getCurrentUser(req, 'admin'),
      Plan.findById(req.params.id).select('_user').exec()
    ])
    if (user.admin || user.equals(plan._user)) {
      const fields = [
        'name', 'description', 'pacingMethod', 'pacingTarget',
        'drift', 'heatModel', 'waypointDelay', 'waypointDelays',
        'eventStart', 'eventTimezone', 'last_viewed'
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
  } catch (error) {
    logger.child({ method: routeName(req) }).error(error)
    res.status(500).send('Error updating plan')
  }
})

// DELETE
router.auth.route('/:id').delete(async function (req, res) {
  try {
    const user = await getCurrentUser(req)
    const plan = await Plan.findById(req.params.id).select('_user').exec()
    if (user.equals(plan._user)) {
      await plan.remove()
      res.json('Successfully removed')
    } else {
      res.status(403).send('No permission')
    }
  } catch (error) {
    logger.child({ method: routeName(req) }).error(error)
    res.status(500).send('Error deleting plan')
  }
})

module.exports = router
