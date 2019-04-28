// postRoutes.js
var express = require('express');
var postRoutes = express.Router();

// Require Post model in our routes module
var Post = require('../models/Post');

// Defined store route
postRoutes.route('/').post(function (req, res) {
  var post = new Post(req.body);
      post.save()
    .then(post => {
    res.status(200).json({'post': 'Post added successfully'});
    })
    .catch(err => {
    res.status(400).send("unable to save to database");
    });
});

// Defined get data(index or listing) route
postRoutes.route('/').get(function (req, res) {
  Post.find(function (err, posts){
    if(err){
      console.log(err);
    }
    else {
      res.json(posts);
    }
  });
});

// Defined edit route
postRoutes.route('/edit/:id').get(function (req, res) {
  var id = req.params.id;
  Post.findById(id, function (err, post){
      res.json(post);
  });
});

//  Defined update route
postRoutes.route('/:id').put(function (req, res) {
  Post.findById(req.params.id, function(err, post) {
    if (!post)
      return next(new Error('Could not load Document'));
    else {
      post.title = req.body.title;
      post.body = req.body.body;

      post.save().then(post => {
          res.json('Update complete');
      })
      .catch(err => {
            res.status(400).send("unable to update the database");
      });
    }
  });
});

// Defined delete | remove | destroy route
postRoutes.route('/:id').delete(function (req, res) {
  console.log('delete ' + req.params.id)
  Post.findByIdAndRemove({_id: req.params.id}, function(err, post){
        if(err) res.json(err);
        else res.json('Successfully removed');
    });
});

module.exports = postRoutes;