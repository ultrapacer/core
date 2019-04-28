var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Define collection and schema for Posts
var GPX = new Schema({
  filename: {
    type: String
  },
  points: {
    type: Array
  }
},{
    collection: 'gpx'
});

module.exports = mongoose.model('GPX', GPX);