// publicRoutes.js
const express = require('express')
const publicRoutes = express.Router()
const Course = require('../models/Course')
const Sponsor = require('../models/Sponsor')
const Plan = require('../models/Plan')
const xml2js = require('xml2js')

// GET COURSE
publicRoutes.route(['/course/:_id', '/course/link/:link']).get(async function (req, res) {
  try {
    const q = { public: true }
    if (req.params._id) {
      q._id = req.params._id
    } else {
      q.link = req.params.link
    }
    const course = await Course.findOne(q).select(['-points', '-raw']).exec()
    await course.addData()
    if (!course.hasCache()) { await course.updateCache() }
    res.json(course)
  } catch (err) {
    console.log(err)
    res.status(400).send(err)
  }
})

// GET COURSE BY PLAN
publicRoutes.route('/course/plan/:_id').get(async function (req, res) {
  try {
    const plan = await Plan.findById(req.params._id)
      .populate(['_user', { path: '_course', select: '-points -raw' }])
      .exec()
    if (plan._course.public) {
      await plan._course.addData(plan._user, req.params._id)
      if (!plan._course.hasCache()) { await plan._course.updateCache() }
      res.json(plan._course)
    } else {
      res.status(403).send('No permission')
    }
  } catch (err) {
    console.log(err)
    res.status(400).send(err)
  }
})

// GET COURSE FIELD
publicRoutes.route('/course/:course/field/:field').get(async function (req, res) {
  try {
    const q = {
      _id: req.params.course,
      public: true
    }
    const course = await Course.findOne(q)
      .select(['_user', req.params.field])
      .exec()
    res.json(course[req.params.field])
  } catch (err) {
    console.log(err)
    res.status(400).send(err)
  }
})

// GET COURSE FIELDS
publicRoutes.route(['/course/:_id/fields', '/course/link/:link/fields']).put(async function (req, res) {
  try {
    const q = { public: true }
    if (req.params._id) {
      q._id = req.params._id
    } else {
      q.link = req.params.link
    }
    const course = await Course.findOne(q).select(req.body).exec()
    res.json(course)
  } catch (err) {
    console.log(err)
    res.status(400).send(err)
  }
})

// GET COURSE USER COUNT
publicRoutes.route('/course/:course/countusers').get(async function (req, res) {
  try {
    const q = {
      _course: req.params.course
    }
    const plans = await Plan.find(q).distinct('_user').exec()
    res.json(plans.length)
  } catch (err) {
    console.log(err)
    res.status(400).send(err)
  }
})

// GET COURSE PUBLIC
publicRoutes.route('/ispublic/:type/:id').get(async function (req, res) {
  try {
    let course = {}
    if (req.params.type === 'course') {
      course = await Course.findById(req.params.id)
        .select(['public'])
        .exec()
    } else {
      const plan = await Plan.findById(req.params.id)
        .populate([{ path: '_course', select: 'public' }])
        .exec()
      course = plan._course
    }
    res.json(course.public)
  } catch (err) {
    console.log(err)
    res.status(400).send(err)
  }
})

// GET PLAN
publicRoutes.route('/plan/:id').get(async function (req, res) {
  try {
    const plan = await Plan.findById(req.params.id)
      .populate([{ path: '_course', select: 'public' }])
      .exec()
    if (plan._course.public) {
      res.json(plan)
    } else {
      res.status(403).send('No permission')
    }
  } catch (err) {
    console.log(err)
    res.status(400).send(err)
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
    const races = await Course.find(q).select(['name', 'distance', 'gain', 'loss', 'link', 'eventStart', 'eventTimezone']).sort('eventStart').exec()
    res.json(races)
  } catch (err) {
    console.log(err)
    res.status(400).send(err)
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
  } catch (err) {
    console.log(err)
    res.status(400).send(err)
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
  } catch (err) {
    console.log(err)
    res.status(400).send(err)
  }
})

module.exports = publicRoutes
