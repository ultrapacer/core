const mongoose = require('mongoose')
const Schema = mongoose.Schema
const logger = require('winston').child({ file: 'Points.js' })
const { round } = require('../../core/math')

const schema = new Schema({
  lat: [{
    type: Number,
    set: v => round(v, 6)
  }],
  lon: [{
    type: Number,
    set: v => round(v, 6)
  }],
  alt: [{
    type: Number,
    set: v => round(v, 2)
  }]
}, {
  collection: 'points'
})

schema.pre('save', async function (next) {
  this.wasNew = this.isNew
  next()
})

schema.post('save', async function () {
  logger.child({ method: 'post-save' })
    .info(`Points ${this._id} ${this.wasNew ? 'created' : 'updated'} successfully.`)
})

schema.post('remove', async function () {
  logger.child({ method: 'post-remove' })
    .info(`Points ${this._id} removed successfully.`)
})

module.exports = mongoose.model('Points', schema)
