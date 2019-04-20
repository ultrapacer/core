var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Define collection and schema for Posts
var Course = new Schema({
  name: {
    type: String
  },
  description: {
    type: String
  }
},{
    collection: 'courses'
});

module.exports = mongoose.model('Course', Course);