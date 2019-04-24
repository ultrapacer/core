var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Define collection and schema for Posts
var Course = new Schema({
  name: {
    type: String
  },
  description: {
    type: String
  },
  gpx: {
    type: mongoose.Schema.Types.ObjectId
  },
  distance: {
    type: Number
  },
  gain: {
    type: Number
  },
  loss: {
    type: Number
  }
},{
    collection: 'courses'
});

module.exports = mongoose.model('Course', Course);