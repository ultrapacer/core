var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Define collection and schema for Posts
var Post = new Schema({
  title: {
    type: String
  },
  body: {
    type: String
  }
},{
    collection: 'posts'
});

module.exports = mongoose.model('Post', Post);