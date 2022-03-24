const express = require('express')
const logger = require('winston').child({ file: 'FRONT-END' })

const routes = express.Router()

// REPORT ERROR
routes.route('/').post(async function (req, res) {
  try {
    const { error } = req.body
    logger.error(new Error(error))
  } catch (error) {
    logger.error(error)
  }
  res.status(200).send('error reported')
})

module.exports = routes
