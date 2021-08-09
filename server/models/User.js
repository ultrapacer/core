const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserSchema = new Schema({
  auth0ID: {
    type: String
  },
  email: {
    type: String
  },
  admin: {
    type: Boolean,
    default: false
  },
  distUnits: {
    type: String,
    default: 'mi'
  },
  elevUnits: {
    type: String,
    default: 'ft'
  },
  altModel: {
    type: Object,
    default: null
  },
  membership: {
    type: {
      active: {
        type: 'Boolean',
        default: false
      },
      status: { type: 'String' }, // temporary until updated
      method: {
        // eg, patreon, paypal, lifetime, etc
        type: 'String'
      },
      last_annoyed: {
        type: Date
      },
      next_annoy: {
        type: Date
      },
      patreon: {
        email: {
          type: 'String'
        }
      }
    },
    default: {
      active: false
    }
  },
  last_login: {
    type: Date,
    default: null
  },
  _courses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }]
}, {
  collection: 'users'
})

module.exports = mongoose.model('User', UserSchema)
