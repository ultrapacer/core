// publicRoutes.js
var express = require('express')
var publicRoutes = express.Router()
var Course = require('../models/Course')
var Plan = require('../models/Plan')

// GET COURSE
publicRoutes.route(['/course/:_id', '/course/link/:link']).get(async function (req, res) {
  try {
    let q = { public: true }
    if (req.params._id) {
      q._id = req.params._id
    } else {
      q.link = req.params.link
    }
    var course = await Course.findOne(q).select(['-points', '-raw']).exec()
    await course.addData()
    res.json(course)
  } catch (err) {
    console.log(err)
    res.status(400).send(err)
  }
})

// GET COURSE BY PLAN
publicRoutes.route('/course/plan/:_id').get(async function (req, res) {
  try {
    let plan = await Plan.findById(req.params._id)
      .populate(['_user', {path: '_course', select: '-points -raw'}])
      .exec()
    if (plan._course.public) {
      await plan._course.addData(plan._user, req.params._id)
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
    let q = {
      _id: req.params.course,
      public: true
    }
    let course = await Course.findOne(q)
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
    let q = { public: true }
    if (req.params._id) {
      q._id = req.params._id
    } else {
      q.link = req.params.link
    }
    var course = await Course.findOne(q).select(req.body).exec()
    res.json(course)
  } catch (err) {
    console.log(err)
    res.status(400).send(err)
  }
})

// GET RACES
publicRoutes.route('/races').get(async function (req, res) {
  try {
    let q = {
      public: true,
      link: { '$nin': [ null, '' ] },
      eventStart: { '$nin': [ null, '' ] }
    }
    var races = await Course.find(q).select(['name', 'distance', 'gain', 'loss', 'link', 'eventStart', 'eventTimezone']).sort('eventStart').exec()
    res.json(races)
  } catch (err) {
    console.log(err)
    res.status(400).send(err)
  }
})

// SITEMAP
publicRoutes.route('/sitemap.xml').get(async function (req, res) {
  try {
    let q = {
      public: true,
      link: { '$nin': [ null, '' ] },
      eventStart: { '$nin': [ null, '' ] }
    }
    var races = await Course.find(q).select('link').exec()
    let textarr = [
      '<?xml version="1.0" encoding="utf-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">'
    ]
    races.forEach(r => {
      textarr.push(`  <url>`)
      textarr.push(`    <loc>https://ultrapacer.com/race/${r.link}</loc>`)
      textarr.push(`    <changefreq>daily</changefreq>`)
      textarr.push('    <priority>1</priority>')
      textarr.push('  </url>')
    })
    textarr.push('</urlset>')
    var data = textarr.join('\r')
    res.type('text')
    res.send(data)
  } catch (err) {
    console.log(err)
    res.status(400).send(err)
  }
})

module.exports = publicRoutes
