const express = require('express')
const router = express.Router()
const nodemailer = require('nodemailer')
const User = require('../models/User')
const { getSecret } = require('../secrets')
const Vue = require('vue')
const fs = require('fs')
const path = require('path')
const renderer = require('vue-server-renderer').createRenderer({
  template: fs.readFileSync(path.join(__dirname, '../templates/email.html'), 'utf-8')
})
const logger = require('winston').child({ file: 'email.js' })
const { routeName } = require('../util')

router.route('/').post(async function (req, res) {
  const log = logger.child({ method: routeName(req) })
  try {
    const users = await User.find({ _id: { $in: req.body.toUserIds } }).select('email').exec()

    // get keys:
    const keys = await getSecret(['SMTP_USERNAME', 'SMTP_PASSWORD'])

    // create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
      service: 'SendinBlue',
      auth: {
        user: keys.SMTP_USERNAME,
        pass: keys.SMTP_PASSWORD
      }
    })

    // render html content:
    const html = await renderEmail(
      req.body.subject,
      'email.vue',
      {
        course: req.body.course,
        name: req.body.name,
        type: req.body.type,
        message: req.body.message,
        replyTo: req.body.replyTo,
        url: req.body.url
      }
    )

    // send email:
    await transporter.sendMail({
      from: '"ultraPacer" <no-reply@ultrapacer.com>',
      to: users.map(u => { return u.email }),
      subject: 'ultraPacer | ' + req.body.course,
      text: req.body.message,
      html: html,
      replyTo: req.body.replyTo
    })

    log.info(`Email sent for course: ${req.body.course}`)
    res.status(200).json('Message Sent')
  } catch (error) {
    log.error(error)
    res.status(500).send('Error sending email')
  }
})

async function renderEmail (title, template, data) {
  const context = {
    title: title
  }
  const app = new Vue({
    data: data,
    template: fs.readFileSync(path.join(__dirname, `../templates/${template}`), 'utf-8')
  })
  const res = await renderer.renderToString(app, context)
  return res
}

module.exports = router
