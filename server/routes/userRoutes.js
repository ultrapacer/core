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
        console.log('creating new')
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

module.exports = userRoutes
