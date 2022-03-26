const express = require('express')
const router = express.Router()
const Course = require('../models/Course')
const xml2js = require('xml2js')
const logger = require('winston').child({ file: 'sitemap.js' })

router.route('/').get(async function (req, res) {
  try {
    // select only courses from the last two years
    const oldest = new Date()
    oldest.setFullYear(oldest.getFullYear() - 2)
    const q = {
      public: true,
      link: { $nin: [null, ''] },
      eventStart: { $gte: oldest }
    }

    const races = await Course.find(q).select('link').exec()
    const arr = races.map(r => {
      return {
        loc: `https://ultrapacer.com/race/${r.link}`,
        changefreq: 'daily',
        priority: 1
      }
    })
    const obj = {
      urlset: {
        $: {
          xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9',
          'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
          'xsi:schemaLocation': 'http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd'
        },
        url: arr
      }
    }
    const builder = new xml2js.Builder({
      xmldec: { version: '1.0', encoding: 'UTF-8', standalone: null }
    })
    const xml = builder.buildObject(obj)
    res.type('text/plain')
    res.send(xml)
  } catch (e) {
    logger.error(e)
    res.status(500).send('Error getting sitemap')
  }
})

module.exports = router
