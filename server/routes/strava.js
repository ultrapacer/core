const express = require('express')
const router = express.Router()
const fetch = require('node-fetch')
const { getSecret } = require('../secrets')

// GET STRAVA ROUTE DETAILS
router.route('/route/:id').get(async function (req, res) {
  const token = await getAccessToken()
  const link = `https://www.strava.com/api/v3/routes/${req.params.id}?access_token=${token}`
  const data = await fetch(link)
  if (data.status > 200) {
    res.status(data.status).send('error')
  } else {
    const j = await data.json()
    const fields = [
      'id', 'name', 'updated_at', 'description',
      'distance', 'elevation_gain'
    ]
    const d = {}
    fields.forEach(f => { d[f] = j[f] })
    res.send(d)
  }
})

// GET STRAVA ROUTE GPX
router.route('/route/:id/gpx').get(async function (req, res) {
  const token = await getAccessToken()
  const link = `https://www.strava.com/api/v3/routes/${req.params.id}/export_gpx?access_token=${token}`
  const data = await fetch(link)
  if (data.status > 200) {
    res.status(data.status).send('error')
  } else {
    const blob = await data.blob()
    res.type(blob.type)
    blob.arrayBuffer().then((buf) => {
      res.send(Buffer.from(buf))
    })
  }
})

// GET ACCESS TOKEN FOR STRAVA API V3
async function getAccessToken () {
  // get keys
  const keys = await getSecret(['STRAVA_CLIENT_ID', 'STRAVA_CLIENT_SECRET', 'STRAVA_REFRESH_TOKEN'])

  const res = await fetch('https://www.strava.com/oauth/token', {
    method: 'post',
    headers: {
      Accept: 'application/json, tetplan, */*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      client_id: keys.STRAVA_CLIENT_ID,
      client_secret: keys.STRAVA_CLIENT_SECRET,
      refresh_token: keys.STRAVA_REFRESH_TOKEN,
      grant_type: 'refresh_token'
    })
  })
  const json = await res.json()
  return json.access_token
}

module.exports = router
