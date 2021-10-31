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

router.route('/').post(async function (req, res) {
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
    if (html) {
      await transporter.sendMail({
        from: '"ultraPacer" <no-reply@ultrapacer.com>',
        to: users.map(u => { return u.email }),
        subject: 'ultraPacer | ' + req.body.course,
        text: req.body.message,
        html: html,
        replyTo: req.body.replyTo
      })
      res.status(200).json('Message Sent')
    } else {
      res.status(400).send('Not sent')
    }
  } catch (err) {
    console.log(err)
    res.status(400).send('Error sending email')
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
  let res = ''
  await renderer.renderToString(app, context, (err, html) => {
    if (err) {
      console.log(err)
    } else {
      res = html
    }
  })
  return res
}

module.exports = router
