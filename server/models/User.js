var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
  auth0UserID: {
    type: String
  },
  unitSystem: {
    type: String,
    default: 'english'
  }
},{
    collection: 'users'
});

module.exports = mongoose.model('User', UserSchema);
