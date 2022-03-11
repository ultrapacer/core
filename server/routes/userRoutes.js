const express = require('express')
const User = require('../models/User')
const Course = require('../models/Course')
const Plan = require('../models/Plan')
const { isValidObjectId, getCurrentUser, getCurrentUserQuery, getUser, routeName } = require('../util')
const logger = require('winston').child({ file: 'userRoutes.js' })
const router = {
  auth: express.Router(), // authenticated
  open: express.Router() // unauthenticated
}

// GET
router.auth.route('/').get(async function (req, res) {
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
router.auth.route('/stats').get(async function (req, res) {
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
router.auth.route('/:id').put(async function (req, res) {
  const log = logger.child({ method: routeName(req) })
  log.info(`id: ${req.params.id}`)
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
        'distUnits', 'elevUnits', 'altModel', 'email', 'unsubscriptions',
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
router.auth.route('/:id/course/:action/:courseId').put(async function (req, res) {
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

// GET EMAIL UNSUBSCRIPTIONS
router.open.route('/unsubscriptions/:email/:token').get(async function (req, res) {
  const log = logger.child({ method: routeName(req) })
  try {
    const { email, token } = req.params
    log.info(`email: ${email}`)

    // get user to update and currentUser (logged in)
    const user = await User.findOne({ email: email, publicKey: token }).select(['publicKey', 'unsubscriptions']).exec()

    if (!user) {
      log.warn('Not found')
      res.status(404).send('Not found')
      return
    }

    res.status(200).json(user.unsubscriptions || {})
  } catch (error) {
    log.error(error.stack || error, { error: error })
    res.status(500).send('Error getting subscriptions.')
  }
})
// PUT EMAIL UNSUBSCRIPTIONS
router.open.route('/unsubscriptions/:email/:token').put(async function (req, res) {
  const log = logger.child({ method: routeName(req) })
  try {
    const { email, token } = req.params
    log.info(`email: ${email}`)

    // get user to update and currentUser (logged in)
    const user = await User.findOne({ email: email, publicKey: token }).select('unsubscriptions').exec()

    if (!user) {
      log.warn('Not found')
      res.status(404).send('Not found')
      return
    }

    const categories = ['news', 'event', 'tips']
    user.unsubscriptions = {
      all: Boolean(req.body.all),
      categories: categories.filter(c => req.body.categories.includes(c))
    }
    const logstr = user.unsubscriptions.all
      ? 'all'
      : (
          user.unsubscriptions.categories.length
            ? user.unsubscriptions.categories.join(', ')
            : 'none'
        )
    log.info(`Unsubscribed from ${logstr}.`)
    await user.save()

    res.status(200).send('Email subscriptions updated')
  } catch (error) {
    log.error(error.stack || error, { error: error })
    res.status(500).send('Error updating subscriptions.')
  }
})

module.exports = router
