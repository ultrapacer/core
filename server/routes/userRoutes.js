// userRoutes.js
var express = require('express')
var userRoutes = express.Router()
var User = require('../models/User')

// GET
userRoutes.route('/').get(async function (req, res) {
  try {
    var user = await User.findOne({ auth0ID: req.user.sub }).exec()
    if (user == null) {
      console.log('CREATING NEW USER')
      user = new User({auth0ID: req.user.sub})
      await user.save()
      res.json(user)
    } else {
      res.json(user)
    }
  } catch (err) {
    console.log(err)
    res.status(400).send(err)
  }
})

// UPDATE
userRoutes.route('/:id').put(async function (req, res) {
  try {
    var user = await User.findOne({ auth0ID: req.user.sub }).exec()
    user.distUnits = req.body.distUnits
    user.elevUnits = req.body.elevUnits
    user.altModel = req.body.altModel
    await user.save()
    res.json('Update complete')
  } catch (err) {
    console.log(err)
    res.status(400).send(err)
  }
})

module.exports = userRoutes
