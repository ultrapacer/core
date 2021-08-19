const express = require('express')
const router = express.Router()
const fetch = require('node-fetch')

const config = {
  google: {
    size: 500,
    method: 'GET',
    results: function (data) {
      return data.results.map(r => { return r.elevation })
    },
    url: function (lls) {
      const locs = lls.map(ll => { return `${ll[0]},${ll[1]}` }).join('|')
      const url = `https://maps.googleapis.com/maps/api/elevation/json?locations=${locs}&key=${process.env.GOOGLE_API_KEY}`
      return url
    }
  },
  'elevation-api': {
    body: function (lls) {
      return JSON.stringify({
        dataSetName: 'NASADEM',
        points: {
          type: 'MultiPoint',
          coordinates: lls.map(x => { return [x[1], x[0]] })
        }
      })
    },
    size: 5000,
    method: 'POST',
    results: function (data) {
      return data.geoPoints.map(a => { return a.elevation })
    },
    url: function (lls) {
      return 'https://api.elevationapi.com/api/Elevation/points'
    }
  }
}

router.route(['/', '/:source']).post(async function (req, res) {
  const source = req.params.source || 'google' // api source
  const size = config[source].size // batch size
  try {
    const alts = []
    const lls = req.body
    const packets = Math.ceil(lls.length / size)
    console.log(`Getting elevation data for ${lls.length} points in ${packets} batch${packets > 1 ? 'es' : ''}`)
    const options = {
      method: config[source].method,
      mode: 'cors',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json'
      }
    }
    for (let i = 0; i < packets; i++) {
      const batch = lls.slice(size * i, size * (i + 1))
      const url = config[source].url(batch)
      if (config[source].method === 'POST') {
        options.body = config[source].body(batch)
      }
      const a = await fetch(url, options)
      const data = await a.json()
      const results = config[source].results(data)
      alts.push(...results)
    }
    console.log(`${packets} packet${packets > 1 ? 'es' : ''} received.`)
    res.json({
      source: source,
      alts: alts
    })
  } catch (err) {
    console.log(err)
    res.status(500).send(err)
  }
})

module.exports = router
