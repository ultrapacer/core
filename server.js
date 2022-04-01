'use strict'
const express = require('express')
const path = require('path')
const logger = require('./log').child({ file: 'server.js' })

async function startUp () {
  const app = express()
  const DIST_DIR = path.join(__dirname, '/dist')
  const HTML_FILE = path.join(DIST_DIR, 'index.html')
  const STATIC_FOLDER = path.join(DIST_DIR, '/static')

  // REDIRECT STATIC FILES:
  app.get('/robots.txt', function (req, res) {
    res.sendFile(path.join(DIST_DIR, '/public/robots.txt'))
  })
  app.get('/sitemap.xml', function (req, res) {
    res.sendFile(path.join(DIST_DIR, '/public/sitemap.xml'))
  })

  //  this allows web components to be pathed in development
  if (process.argv.includes('development')) {
    app.get('/public/components/js/*', (req, res) => {
      const a = req.url.split('/').slice(-1)[0]
      res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate')
      res.header('Expires', '-1')
      res.header('Pragma', 'no-cache')
      res.sendFile(path.join(DIST_DIR, `../temp/js/${a}`))
    })
    app.get('/public/components/*.html', (req, res) => {
      const a = req.url.split('/').slice(-1)[0]
      res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate')
      res.header('Expires', '-1')
      res.header('Pragma', 'no-cache')
      res.sendFile(path.join(DIST_DIR, `../static/components/${a}`))
    })
  }

  // following should be handled by app.yaml handler in production
  if (process.argv.includes('development')) {
    app.use('/public', express.static(path.join(DIST_DIR, '/public')))
  }

  app.get('/*', (req, res) => {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate')
    res.header('Expires', '-1')
    res.header('Pragma', 'no-cache')
    res.sendFile(HTML_FILE)
  })

  const PORT = process.env.PORT || 3000
  app.listen(PORT, () => {
    logger.info(`DIST_DIR: ${DIST_DIR}`)
    logger.info(`HTML_FILE: ${HTML_FILE}`)
    logger.info(`STATIC_FOLDER: ${STATIC_FOLDER}`)
    logger.info(`App listening on port ${PORT}`)
    logger.info('Press Ctrl+C to quit.')
  })
}

startUp()
