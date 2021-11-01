const express = require('express')
const logger = require('winston').child({ file: 'FRONT-END' })

const routes = express.Router()

// REPORT ERROR
routes.route('/').post(async function (req, res) {
  try {
    const { error } = req.body
    logger.error(error)
  } catch (err) {
    logger.error(err)
  }
  res.status(200).send('error reported')
})

module.exports = routes
