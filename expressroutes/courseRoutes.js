// coursesRoutes.js
var express = require('express')
var coursesRoutes = express.Router()
const multer = require('multer')
const gpxParse = require('gpx-parse')
const fs = require('fs')
const utilities = require('../src/utilities')

const upload = multer()
// Require Course model in our routes module
var Course = require('../models/Course')
var GPX = require('../models/GPX')

// Defined store route
coursesRoutes.route('/').post(upload.single('file'), function (req, res) {
  gpxParse.parseGpx(req.file.buffer.toString(), function(error, data) {
    if (error) throw error 

  var course = new Course(JSON.parse(req.body.model));
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
      res.status(400).send("unable to save to database")
      });
      })
  })    
});

// Defined upload route
coursesRoutes.route('/upload').post(upload.single('file'), function (req, res) {
  console.log(req.file)
});

// Defined get data(index or listing) route
coursesRoutes.route('/').get(function (req, res) {
  Course.find(function (err, courses){
    if(err){
      console.log(err);
    }
    else {
      res.json(courses);
    }
  });
});

// Defined edit route
coursesRoutes.route('/edit/:id').get(function (req, res) {
  var id = req.params.id;
  Course.findById(id, function (err, course){
      res.json(course);
  });
});

//  Defined update route
coursesRoutes.route('/:id').put(function (req, res) {
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
});

// Defined delete | remove | destroy route
coursesRoutes.route('/:id').delete(function (req, res) {
  console.log('delete ' + req.params.id)
  Course.findByIdAndRemove({_id: req.params.id}, function(err, course){
        if(err) res.json(err);
        else res.json('Successfully removed');
    });
});

// Defined edit route
coursesRoutes.route('/:id').get(function (req, res) {
  var id = req.params.id;
  Course.findById(id).populate('_gpx').exec(function (err, course){
      res.json(course);
  });
});

module.exports = coursesRoutes;