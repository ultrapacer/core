// userRoutes.js
const express = require('express')
const userRoutes = express.Router()
const User = require('../models/User')

// GET
userRoutes.route('/').get(async function (req, res) {
  try {
    let user = await User.findOne({ auth0ID: req.user.sub }).exec()
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

// UPDATE
userRoutes.route('/:id').put(async function (req, res) {
  try {
    const user = await User.findOne({ auth0ID: req.user.sub }).exec()
    const fields = ['distUnits', 'elevUnits', 'altModel', 'email']
    fields.forEach((f) => {
      if (req.body[f] !== undefined) {
        user[f] = req.body[f]
      }
    })
    await user.save()
    res.json('Update complete')
  } catch (err) {
    console.log(err)
    res.status(400).send(err)
  }
})

module.exports = userRoutes
