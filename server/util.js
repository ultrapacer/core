const ObjectId = require('mongoose').Types.ObjectId
const User = require('./models/User')
const logger = require('winston').child({ file: 'util.js' })

function getCurrentUserQuery (req) {
  return { auth0ID: req.auth.payload.sub }
}

function isValidObjectId (id) {
  if (ObjectId.isValid(id)) {
    if ((String)(new ObjectId(id)) === id) { return true }
    return false
  }
  return false
}

async function getCurrentUser (req, fields) {
  const query = getCurrentUserQuery(req)
  const q = User.findOne(query)
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

// utility funciton to check course existence and respond 404 if needed
function checkExists (res, log, item) {
  if (!item) {
    log.warn('Not found')
    res.status(404).send('Not found')
    return false
  }
  return true
}

// utility function to check permission and respond if needed
function checkCoursePermission (res, log, course, user, perm) {
  if (!course.isPermitted(perm, user)) {
    log.warn('No permission')
    res.status(403).send('No permission')
    return false
  }
  return true
}

module.exports.isValidObjectId = isValidObjectId
module.exports.getCurrentUser = getCurrentUser
module.exports.getCurrentUserQuery = getCurrentUserQuery
module.exports.getUser = getUser
module.exports.routeName = routeName
module.exports.checkExists = checkExists
module.exports.checkCoursePermission = checkCoursePermission
