const express = require('express')
const router = express.Router()
const fetch = require('node-fetch')

router.route('/').post(async function (req, res) {
  const size = 500
  try {
    const alts = []
    const lls = req.body
    const packets = Math.ceil(lls.length / size)
    console.log(`Getting elevation data for ${lls.length} points in ${packets} batch${packets > 1 ? 'es' : ''}`)
    for (let i = 0; i < packets; i++) {
      const batch = lls.slice(size * i, size * (i + 1))
      const locs = batch.map(ll => { return `${ll[0]},${ll[1]}` }).join('|')
      const url = `https://maps.googleapis.com/maps/api/elevation/json?locations=${locs}&key=${process.env.GOOGLE_API_KEY}`
      const a = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      const data = await a.json()
      alts.push(...data.results.map(r => { return r.elevation }))
    }
    res.json(alts)

    /*  let response = await fetch('https://api.elevationapi.com/api/Elevation/points', {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        dataSetName: 'SRTM_GL1',
        boundingBoxes: [
          0
        ],
        points: {
          type: 'MultiPoint',
          coordinates: req.body
        }
      })
    })
    let data = await response.json()
    let alts = data.geoPoints.map(a=>{return a.elevation})
    res.json(alts) */
  } catch (err) {
    console.log(err)
    res.status(500).send(err)
  }
})

module.exports = router
