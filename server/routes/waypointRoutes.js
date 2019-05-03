// waypointRoutes.js
var express = require('express')
var waypointRoutes = express.Router()
var Waypoint = require('../models/Waypoint')
var Course = require('../models/Course')

// GET LIST
waypointRoutes.route('/list/:courseID').get(function (req, res) {
  Waypoint.find({ _course: req.params.courseID }).sort('location').exec(function(err, waypoints) {
    res.json(waypoints)
  });
});

// SAVE NEW
waypointRoutes.route('/').post(function (req, res) {
  var waypoint = new Waypoint(req.body)
  console.log(waypoint)
  console.log(req.body.waypoint)
  waypoint.save().then(function() {
    Course.update(
      { _id: waypoint._course },
      { $push: { waypoints: waypoint } }
    ).then(post => {
      res.json('Update complete');
    })
  })
});

//  UPDATE
waypointRoutes.route('/:id').put(function (req, res) {
  Waypoint.findById(req.params.id, function(err, waypoint) {
    if (!waypoint)
      return next(new Error('Could not load Document'));
    else {
      waypoint.name = req.body.name;
      waypoint.location = req.body.location;
      waypoint.description = req.body.description;
      waypoint.elevation = req.body.elevation;

      waypoint.save().then(post => {
          res.json('Update complete');
      })
      .catch(err => {
            res.status(400).send("unable to update the database");
      });
    }
  });
});

// DELETE
waypointRoutes.route('/:id').delete(function (req, res) {
  console.log('delete ' + req.params.id)
  Waypoint.findByIdAndRemove({_id: req.params.id}, function(err, waypoint){
        if(err) res.json(err);
        else res.json('Successfully removed');
    });
});

module.exports = waypointRoutes;