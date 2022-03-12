const express = require('express')
const router = express.Router()
const fetch = require('node-fetch')
const { getSecret } = require('../secrets')
const logger = require('winston').child({ file: 'timezone.js' })
const { routeName } = require('../util')

router.route('/').get(async function (req, res) {
  try {
    const { lat, lon } = req.query
    const key = await getSecret('TIMEZONEDB_API_KEY')
    const link = `http://api.timezonedb.com/v2.1/get-time-zone?key=${key}&format=json&by=position&lat=${lat}&lng=${lon}`
    const data = await fetch(link)
    if (data.status > 200) {
      res.status(data.status).send('error')
    } else {
      const json = await data.json()
      res.status(200).send(json.zoneName)
    }
  } catch (error) {
    logger.child({ method: routeName(req) }).error(error)
    res.status(500).send('Error getting timezone')
  }
})

module.exports = router
