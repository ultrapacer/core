// publicRoutes.js
const express = require('express')
const publicRoutes = express.Router()
const Course = require('../models/Course')
const Plan = require('../models/Plan')
const Sponsor = require('../models/Sponsor')
const xml2js = require('xml2js')
const logger = require('winston').child({ file: 'publicRoutes.js' })
const { routeName } = require('../util')

// GET COURSE USER COUNT
publicRoutes.route('/course/:course/countusers').get(async function (req, res) {
  try {
    const q = {
      _course: req.params.course
    }
    const plans = await Plan.find(q).distinct('_user').exec()
    res.json(plans.length)
  } catch (error) {
    logger.child({ method: routeName(req) }).error(error)
    res.status(500).send('Error retrieving course user count')
  }
})

// GET PLAN
publicRoutes.route('/plan/:id').get(async function (req, res) {
  const log = logger.child({ method: routeName(req) })
  try {
    log.info('run')
    const plan = await Plan.findById(req.params.id)
      .populate([{ path: '_course', select: 'public' }])
      .exec()
    if (plan._course.public) {
      res.status(200).json(plan)
    } else {
      log.warn('No permission')
      res.status(403).send('No permission')
    }
  } catch (error) {
    logger.child({ method: routeName(req) }).error(error)
    res.status(500).send('Error getting plan')
  }
})

// GET RACES
publicRoutes.route('/races').get(async function (req, res) {
  try {
    const q = {
      public: true,
      link: { $nin: [null, ''] },
      eventStart: { $nin: [null, ''] }
    }
    const races = await Course.find(q).select(['name', 'distance', 'gain', 'loss', 'loops', 'override', 'link', 'eventStart', 'eventTimezone']).sort('eventStart').exec()
    res.json(races)
  } catch (error) {
    logger.child({ method: routeName(req) }).error(error)
    res.status(500).send('Error getting races')
  }
})

// SITEMAP
publicRoutes.route('/sitemap.xml').get(async function (req, res) {
  try {
    const q = {
      public: true,
      link: { $nin: [null, ''] },
      eventStart: { $nin: [null, ''] }
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
  } catch (error) {
    logger.child({ method: routeName(req) }).error(error)
    res.status(500).send('Error getting sitemap')
  }
})

// GET A SPONSOR
publicRoutes.route('/sponsor').get(async function (req, res) {
  try {
    const sponsors = await Sponsor.find({ enabled: true }).exec()
    if (sponsors.length) {
      const i = Math.floor(Math.random() * sponsors.length)
      res.json(sponsors[i])
    } else {
      res.json(null)
    }
  } catch (error) {
    logger.child({ method: routeName(req) }).error(error)
    res.status(500).send('Error getting sponsor')
  }
})

module.exports = publicRoutes
