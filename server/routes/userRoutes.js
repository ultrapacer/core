// userRoutes.js
var express = require('express')
var userRoutes = express.Router()
var User = require('../models/User')

// Defined get data(index or listing) route
userRoutes.route('/').get(function (req, res) {
  console.log(req.user.sub)
  var query = { auth0ID: req.user.sub }
  User.findOne(query).exec(function(err, user) {
    if(err){
      console.log(err)
    }
    else {
      console.log(user)
      if (user == null) {
        console.log('CREATING NEW USER')
        user = new User({auth0ID: req.user.sub})
        user.save(function(err,record){
          res.json(record)
        })
      } else {
        res.json(user)
      }
    }
  })
})

userRoutes.route('/:id').put(function (req, res) {
  User.findById(req.params.id, function(err, user) {
    if (!user)
      return next(new Error('Could not load Document'));
    else {
      user.distUnits = req.body.distUnits
      user.elevUnits = req.body.elevUnits
      user.save().then(post => {
        res.json('Update complete');
      })
      .catch(err => {
        res.status(400).send("unable to update the database");
      })
    }
  })
})

module.exports = userRoutes
