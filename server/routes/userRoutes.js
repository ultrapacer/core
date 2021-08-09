// userRoutes.js
const express = require('express')
const userRoutes = express.Router()
const User = require('../models/User')
const Course = require('../models/Course')
const Plan = require('../models/Plan')
const ObjectId = require('mongoose').Types.ObjectId

function isValidObjectId (id) {
  if (ObjectId.isValid(id)) {
    if ((String)(new ObjectId(id)) === id) { return true }
    return false
  }
  return false
}

// GET
userRoutes.route('/').get(async function (req, res) {
  try {
    let user = await User.findOneAndUpdate(
      { auth0ID: req.user.sub },
      { last_login: new Date() }
    ).exec()
    if (user == null) {
      user = new User({
        auth0ID: req.user.sub
      })
      await user.save()
    }
    res.json(user)
  } catch (err) {
    console.log(err)
    res.status(400).send(err)
  }
})

// GET STATS
userRoutes.route('/stats').get(async function (req, res) {
  try {
    const user = await User.findOne({ auth0ID: req.user.sub }).exec()
    const q = {
      $or: [
        {
          _user: user
        },
        {
          $and: [
            {
              _id: {
                $in: user._courses
              }
            },
            {
              public: true
            }
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
    console.log(err)
    res.status(400).send(err)
  }
})

// UPDATE
userRoutes.route('/:id').put(async function (req, res) {
  try {
    // search by id or email:
    const q = isValidObjectId(req.params.id) ? { _id: req.params.id } : { email: req.params.id }

    // get user to update and currentUser (logged in)
    const [user, currentUser] = await Promise.all([
      User.findOne(q).exec(),
      User.findOne({ auth0ID: req.user.sub }).select(['admin']).exec()
    ])

    if (currentUser.admin || user.equals(currentUser)) {
      const fields = [
        'distUnits', 'elevUnits', 'altModel', 'email',
        'membership.patreon', 'membership.last_annoyed', 'membership.next_annoy'
      ]
      if (currentUser.admin) {
        fields.push('membership.active', 'membership.method')
      }

      // loop through available fields and assign applicable ones to update
      const update = {}
      fields.forEach(f => {
        if (req.body[f] !== undefined) {
          update[f] = req.body[f]
        }
      })

      await user.updateOne(update)
      res.json('Update complete')
    } else {
      res.status(403).send('No permission')
    }
  } catch (err) {
    console.log(err)
    res.status(400).send(err)
  }
})

module.exports = userRoutes
