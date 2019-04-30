var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
  distUnits: {
    type: String,
    default: 'mi'
  },
  elevUnits: {
    type: String,
    default: 'ft'
  }
},{
    collection: 'users'
});

module.exports = mongoose.model('User', UserSchema);
