const express = require('express')
const userRoutes = express.Router()
const User = require('../models/User')
const Course = require('../models/Course')
const Plan = require('../models/Plan')
const { isValidObjectId, getCurrentUser, getCurrentUserQuery, getUser, routeName } = require('../util')
const logger = require('winston').child({ file: 'userRoutes.js' })

// GET
userRoutes.route('/').get(async function (req, res) {
  const log = logger.child({ method: routeName(req) })
  log.verbose('run')
  try {
    const query = getCurrentUserQuery(req)
    let user = await User.findOneAndUpdate(
      query,
      { last_login: new Date() }
    ).exec()
    if (user == null) {
      user = new User(query)
      log.info('creating new user')
      await user.save()
    }
    res.json(user)
  } catch (err) {
    log.error(err)
    res.status(400).send('Error getting user')
  }
})

// GET STATS
userRoutes.route('/stats').get(async function (req, res) {
  const log = logger.child({ method: routeName(req) })
  log.verbose('run')
  try {
    const user = await getCurrentUser(req)
    const q = {
      $or: [
        { _user: user }, // depreciated 2021.10.22
        { _users: user },
        {
          $and: [
            { _id: { $in: user._courses } },
            { public: true }
          ]
        }
      ]
    }
    const courseCount = await Course.countDocuments(q).exec()
    const planCount = await Plan.countDocuments({ _user: user }).exec()
    res.json({
      courses: courseCount,
      plans: planCount
    })
  } catch (err) {
    log.error(err)
    res.status(400).send('Error getting user stats')
  }
})

// UPDATE
userRoutes.route('/:id').put(async function (req, res) {
  const log = logger.child({ method: routeName(req) })
  log.verbose('run')
  try {
    // search by id or email:
    const q = isValidObjectId(req.params.id) ? { _id: req.params.id } : { email: req.params.id }

    // get user to update and currentUser (logged in)
    const [user, currentUser] = await Promise.all([
      User.findOne(q).exec(),
      getCurrentUser(req, 'admin')
    ])

    if (currentUser.admin || user.equals(currentUser)) {
      const fields = [
        'distUnits', 'elevUnits', 'altModel', 'email',
        'membership.patreon', 'membership.lastAnnoyed', 'membership.nextAnnoy'
      ]
      if (currentUser.admin) {
        fields.push('membership', 'membership.active', 'membership.method')
      }

      // loop through available fields and assign applicable ones to update
      const update = {}
      fields.forEach(f => {
        if (req.body[f] !== undefined) {
          update[f] = req.body[f]
        }
      })

      await user.updateOne(update)

      log.info('User updated')
      res.json('Update complete')
    } else {
      log.warn('No permission')
      res.status(403).send('No permission')
    }
  } catch (err) {
    log.error(err)
    res.status(400).send('Error updating user')
  }
})

// UPDATE USER COURSES LIST:
userRoutes.route('/:id/course/:action/:courseId').put(async function (req, res) {
  const log = logger.child({ method: routeName(req) })
  log.info('run')
  const { id, action, courseId } = req.params
  try {
    // get user to update and currentUser (logged in)
    const [user, currentUser] = await Promise.all([
      getUser(id, '_courses'),
      getCurrentUser(req, ['admin', '_courses'])
    ])
    if (user.equals(currentUser) || currentUser.admin) {
      if (action === 'add') {
        user._courses.push(courseId)
        await user.save()
      } else if (action === 'remove') {
        await user.removeCourse(courseId)
      } else {
        return res.status(400).send('Incorrect action specified')
      }
      res.status(200).send(`User course ${action} complete`)
    } else {
      log.warn('No permission')
      res.status(403).send('No permission')
    }
  } catch (error) {
    log.error(error)
    res.status(400).send('Error modifying user courses')
  }
})

module.exports = userRoutes
