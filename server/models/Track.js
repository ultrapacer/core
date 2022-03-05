const mongoose = require('mongoose')
const Schema = mongoose.Schema
const logger = require('winston').child({ file: 'Track.js' })

const schema = new Schema({
  source: {},
  points: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Points'
  }
}, {
  collection: 'tracks'
})

schema.pre('save', async function (next) {
  this.wasNew = this.isNew
  next()
})

schema.post('save', async function () {
  const log = logger.child({ method: 'post-save' })
  log.info(`Track ${this._id} ${this.wasNew ? 'created' : 'updated'} successfully.`)

  const courses = await mongoose.model('Course').find({ track: this }).exec()
  courses.forEach(course => {
    course.clearCache()
  })
})

schema.pre('remove', async function () {
  this.points.remove()
})

schema.post('remove', async function () {
  logger.child({ method: 'post-remove' }).info(`Track ${this._id} removed successfully.`)
})

module.exports = mongoose.model('Track', schema)
