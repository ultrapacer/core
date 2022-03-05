const mongoose = require('mongoose')
const Schema = mongoose.Schema

const schema = new Schema({}, {
  collection: 'coursegroups'
})

schema.virtual('courses', {
  ref: 'Course',
  localField: '_id',
  foreignField: 'group'
})

schema.set('toJSON', { virtuals: true })
schema.set('toObject', { virtuals: true })

module.exports = mongoose.model('CourseGroup', schema)
