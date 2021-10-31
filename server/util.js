const ObjectId = require('mongoose').Types.ObjectId
const User = require('./models/User')
const logger = require('winston').child({ file: 'util.js' })

function isValidObjectId (id) {
  if (ObjectId.isValid(id)) {
    if ((String)(new ObjectId(id)) === id) { return true }
    return false
  }
  return false
}

async function getCurrentUser (req, fields) {
  const q = User.findOne({ auth0ID: req.user.sub })
  if (fields) q.select(fields)
  return await q.exec()
}

async function getUser (id, fields) {
  // id can be either _id or email
  // fields is string (single field) or array of strings

  const query = isValidObjectId(id) ? { _id: id } : { email: id }
  const db = User.findOne(query)
  if (fields) db.select(fields)
  return await db.exec()
}

function routeName (req) {
  try {
    return `${req.baseUrl}${req.route.path}.${Object.keys(req.route.methods)[0]}`
  } catch (error) {
    logger.child({ method: 'routeName' }).error(error)
    return 'routeNameError'
  }
}

module.exports.isValidObjectId = isValidObjectId
module.exports.getCurrentUser = getCurrentUser
module.exports.getUser = getUser
module.exports.routeName = routeName
