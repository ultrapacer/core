const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Plan = require('./Plan')
const logger = require('winston').child({ file: 'User.js' })

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
      lastAnnoyed: {
        type: Date
      },
      nextAnnoy: {
        type: Date
      },
      buymeacoffee: {
        id: {
          type: 'String'
        }
      },
      patreon: {
        id: {
          type: 'String'
        }
      },
      expiration: {
        type: Date
      }
    },
    default: {
      active: false
    }
  },
  notifications: {
    type: 'Object',
    default: {}
  },
  last_login: {
    type: Date,
    default: null
  },
  _courses: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    }],
    default: []
  }
}, {
  collection: 'users'
})

UserSchema.methods.removeCourse = async function (course) {
  const log = logger.child({ method: 'removeCourse' })
  log.info(`user:${this._id}, course:${course._id || course}`)
  const i = this._courses.findIndex(c => c.equals(course))
  if (i >= 0) {
    this._courses.splice(i, 1)
    await this.save()
  }
  const p = await Plan.deleteMany({ _course: course, _user: this }).exec()
  log.log(p.deletedCount ? 'warn' : 'info', `${p.deletedCount} plans deleted.`)
}

module.exports = mongoose.model('User', UserSchema)
