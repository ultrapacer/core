const mongoose = require('mongoose')
const Schema = mongoose.Schema

const CourseGroupSchema = new Schema({}, {
  collection: 'coursegroups'
})
module.exports = mongoose.model('CourseGroup', CourseGroupSchema)
