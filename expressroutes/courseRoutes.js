// courseRoutes.js
var express = require('express');
var courseRoutes = express.Router();

// Require Course model in our routes module
var Course = require('../models/Course');

// Defined store route
courseRoutes.route('/').post(function (req, res) {
  var course = new Course(req.body);
      course.save()
    .then(post => {
    res.status(200).json({'post': 'Course added successfully'});
    })
    .catch(err => {
    res.status(400).send("unable to save to database");
    });
});

// Defined get data(index or listing) route
courseRoutes.route('/').get(function (req, res) {
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
});

// Defined delete | remove | destroy route
courseRoutes.route('/:id').delete(function (req, res) {
  console.log('delete ' + req.params.id)
  Course.findByIdAndRemove({_id: req.params.id}, function(err, course){
        if(err) res.json(err);
        else res.json('Successfully removed');
    });
});

module.exports = courseRoutes;