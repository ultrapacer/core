const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Plan = require('./Plan')
const logger = require('winston').child({ file: 'User.js' })
const keygen = require('keygenerator')

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
  },

  // object with unsubcription information:
  unsubscriptions: {
    type: {
      all: Boolean,
      categories: ['String']
    }
  },

  // publicKey is used for association of email unsubscriptions without login
  publicKey: {
    type: 'String',
    default: null
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

UserSchema.post('init', async function () {
  const log = logger.child({ method: 'post-init' })
  try {
    log.verbose(`id: ${this._id}`)

    // add a public key if it doesn't already exist
    if (this.publicKey === null) {
      this.publicKey = keygen._({
        length: 24
      })
      this.save()
      log.info(`id: ${this._id}, created publicKey`)
    }
  } catch (error) {
    log.error(error.stack || error, { error: error })
  }
})

module.exports = mongoose.model('User', UserSchema)
