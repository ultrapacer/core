// courseRoutes.js
var express = require('express')
var courseRoutes = express.Router()
const multer = require('multer')
const gpxParse = require('gpx-parse')
const fs = require('fs')
const utilities = require('../../shared/utilities')

const upload = multer()
// Require Course model in our routes module
var Course = require('../models/Course')
var GPX = require('../models/GPX')
var Waypoint = require('../models/Waypoint')

// Defined store route
courseRoutes.route('/').post(upload.single('file'), function (req, res) {
  gpxParse.parseGpx(req.file.buffer.toString(), function(error, data) {
    if (error) throw error 

    var course = new Course(JSON.parse(req.body.model))
    course._user = req.user.sub.substring(req.user.sub.indexOf('|')+1,req.user.sub.length)
    console.log(course._user)
    var gpx = new GPX()
    
    gpx.filename = req.file.path
    gpx.points = utilities.cleanPoints(data.tracks[0].segments[0])
    var stats = utilities.calcStats(gpx.points)
    course.distance = stats.distance
    course.gain = stats.gain
    course.loss = stats.loss
      
    gpx.save(function(err,record){
      course._gpx = record
      course.save()
        .then(post => {
        res.status(200).json({'post': 'Course added successfully'})
        })
        .catch(err => {
          console.log(err)
          res.status(400).send("unable to save to database")
        });
    })
  })    
});

// Defined upload route
courseRoutes.route('/upload').post(upload.single('file'), function (req, res) {
  console.log(req.file)
});

// Defined get data(index or listing) route
courseRoutes.route('/').get(function (req, res) {
  var query = { _user: req.user.sub.substring(req.user.sub.indexOf('|')+1,req.user.sub.length) }
  //var query = { _user: { $in: { 'auth0UserID': req.user.sub } }  }
  console.log(query)
  Course.find(query).sort('name').exec(function(err, courses) {
    if(err){
      console.log(err);
    }
    else {
      res.json(courses);
    }
  });
});

// Defined edit route
courseRoutes.route('/edit/:id').get(function (req, res) {
  var id = req.params.id;
  Course.findById(id, function (err, course){
      res.json(course);
  });
});

//  Defined update route
courseRoutes.route('/:id').put(function (req, res) {
  Course.findById(req.params.id, function(err, course) {
    if (!course)
      return next(new Error('Could not load Document'));
    else {
      course.name = req.body.name;
      course.description = req.body.description;

      course.save().then(post => {
          res.json('Update complete');
      })
      .catch(err => {
            res.status(400).send("unable to update the database");
      });
    }
  });
})

// Defined delete | remove | destroy route
courseRoutes.route('/:id').delete(function (req, res) {
  console.log('delete ' + req.params.id)
  Course.findByIdAndRemove({_id: req.params.id}, function(err, course){
        if(err) res.json(err);
        else res.json('Successfully removed');
    })
})

// GE COURSE
courseRoutes.route('/:id').get(function (req, res) {
  var id = req.params.id;
  Course.findById(id).populate('_gpx').exec(function (err, course){
      res.json(course);
  })
})

module.exports = courseRoutes;
