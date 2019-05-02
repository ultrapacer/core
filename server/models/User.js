var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const Course = require('./Course')

var UserSchema = new Schema({
  auth0ID: {
    type: String
  },
  distUnits: {
    type: String,
    default: 'mi'
  },
  elevUnits: {
    type: String,
    default: 'ft'
  },
  courses: [{ type : mongoose.Schema.Types.ObjectId, ref: 'Course' }]
},{
    collection: 'users'
})

module.exports = mongoose.model('User', UserSchema);
