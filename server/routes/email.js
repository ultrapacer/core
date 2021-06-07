const express = require('express')
const router = express.Router()
const nodemailer = require('nodemailer')
const User = require('../models/User')

// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  service: 'SendinBlue',
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD
  }
})

router.route('/user/:id').post(async function (req, res) {
  try {
    const user = await User.findById(req.params.id).exec()
    await transporter.sendMail({
      from: '"ultraPacer" <no-reply@ultrapacer.com>',
      to: user.email,
      subject: req.body.subject,
      text: req.body.text,
      html: req.body.html,
      replyTo: req.body.replyTo
    })
    res.json('Message Sent')
  } catch (err) {
    console.log(err)
    res.status(400).send(err)
  }
})

module.exports = router
