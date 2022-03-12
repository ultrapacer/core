const express = require('express')
const Course = require('../models/Course')
const Track = require('../models/Track')
const { getCurrentUser } = require('../util')
const logger = require('winston').child({ file: 'trackRoutes.js' })

const router = {
  auth: express.Router(), // authenticated
  open: express.Router() // unauthenticated
}

// GET TRACK
// RETURNS database track object with points populated
router.auth.route('/:id').get(async function (req, res) {
  getTrack(true, req, res, req.params.id)
})
router.open.route('/:id').get(async function (req, res) {
  getTrack(false, req, res, req.params.id)
})
async function getTrack (auth, req, res, id, user = {}) {
  const log = logger.child({ method: `getTrack-${auth ? 'auth' : 'open'}` })
  try {
    log.info(id)

    const queries = [
      Track.findOne({ _id: id }).populate('points').exec(),
      Course.find({ track: id }).select(['_users', 'public']).exec()
    ]

    // if auth, also get user, otherwise empty user
    queries.push(auth ? getCurrentUser(req) : {})

    // execute database functions
    const [track, courses, user] = await Promise.all(queries)

    if (!track) {
      log.warn(`${id} not found.`)
      res.status(404).send('Not found')
      return
    }

    // check permission. If any courses using track are public, it is considered public
    if (!courses.filter(c => c.isPermitted('view', user)).length) {
      log.warn('No permission')
      res.status(403).send('No permission')
      return
    }

    // return json
    res.status(200).json(track)
  } catch (error) {
    log.error(error)
    res.status(500).send('Error retrieving track.')
  }
}

module.exports = router
