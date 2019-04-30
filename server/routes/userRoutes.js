// userRoutes.js
var express = require('express')
var userRoutes = express.Router()

// Require Course model in our routes module
var User = require('../models/User')

// Defined get data(index or listing) route
userRoutes.route('/').get(function (req, res) {
  console.log(req.user.sub)
  var query = { _id: req.user.sub.substring(req.user.sub.indexOf('|')+1,req.user.sub.length) }
  User.findOne(query).exec(function(err, user) {
    if(err){
      console.log(err);
    }
    else {
      console.log(user)
      if (user == null) {
        console.log('creating new')
        user = new User({_id: req.user.sub.substring(req.user.sub.indexOf('|')+1,req.user.sub.length)})
        user.save(function(err,record){
          res.json(record)
        })
      } else {
        res.json(user)
      }
    }
  });
});

module.exports = userRoutes;
