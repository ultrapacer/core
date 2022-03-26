const express = require('express')
const router = express.Router()
const Sponsor = require('../models/Sponsor')
const logger = require('winston').child({ file: 'sponsor.js' })
const { routeName } = require('../util')

// GET A SPONSOR
router.route('/').get(async function (req, res) {
  const log = logger.child({ method: routeName(req) })
  try {
    log.debug('run')

    const sponsors = await Sponsor.find({ enabled: true }).exec()

    if (!sponsors.length) return res.status(200).json(null)

    const i = Math.floor(Math.random() * sponsors.length)
    res.status(200).json(sponsors[i])
  } catch (error) {
    log.error(error)
    res.status(500).send('Error getting sponsor')
  }
})

module.exports = router
