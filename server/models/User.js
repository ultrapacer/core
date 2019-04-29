var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
  unitSystem: {
    type: String,
    default: 'english'
  }
},{
    collection: 'users'
});

module.exports = mongoose.model('User', UserSchema);
