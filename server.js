'use strict'
const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cors = require('cors')
const userRoutes = require('./server/routes/userRoutes')
const courseRoutes = require('./server/routes/courseRoutes')
const trackRoutes = require('./server/routes/trackRoutes')
const waypointRoutes = require('./server/routes/waypointRoutes')
const planRoutes = require('./server/routes/planRoutes')
const external = require('./server/routes/external')
const { auth } = require('express-oauth2-jwt-bearer')
const membership = require('./server/routes/membership')
const { getSecret } = require('./server/secrets')
const logger = require('./server/log').child({ file: 'server.js' })

async function startUp () {
  const elevation = require('./server/routes/elevation')
  const email = require('./server/routes/email')
  const strava = require('./server/routes/strava')
  // connect to the database:
  mongoose.Promise = global.Promise
  mongoose.set('useFindAndModify', false)

  const keys = await getSecret(['MONGODB', 'AUTH0_DOMAIN', 'AUTH0_AUDIENCE'])

  mongoose.connect(keys.MONGODB).then(
    () => { logger.info('Database is connected') },
    err => { logger.error('Can not connect to the database' + err) }
  )

  const app = express()
  const DIST_DIR = path.join(__dirname, '/dist')
  const HTML_FILE = path.join(DIST_DIR, 'index.html')
  const STATIC_FOLDER = path.join(DIST_DIR, '/static')

  app.use(cors())
  app.use(bodyParser.json({ limit: '50mb' }))

  const checkJwt = auth({
    audience: keys.AUTH0_AUDIENCE,
    issuerBaseURL: `https://${keys.AUTH0_DOMAIN}/`
  })

  app.use('/api/user', checkJwt, userRoutes.auth)

  app.use('/api/open/user', userRoutes.open)

  app.use(['/api/course', '/api/courses'], checkJwt, courseRoutes.auth) // authenticated
  app.use(['/api/open/course', '/api/open/courses'], courseRoutes.open) // unauthenticated

  app.use('/api/track', checkJwt, trackRoutes.auth) // authenticated
  app.use('/api/open/track', trackRoutes.open) // unauthenticated

  app.use('/api/waypoint', checkJwt, waypointRoutes) // unauthenticated

  app.use('/api/plan', checkJwt, planRoutes.auth) // authenticated
  app.use('/api/open/plan', planRoutes.open) // unauthenticated

  app.use('/api/elevation', elevation)

  app.use('/api/email', checkJwt, email)

  app.use('/api/membership', checkJwt, membership.auth) // authenticated
  app.use('/api/open/membership', membership.open) // unauthenticated

  app.use('/api/strava', strava)

  app.use('/api/error', require('./server/routes/error'))

  app.use('/api/sponsor', require('./server/routes/sponsor'))

  app.use('/api/batch', checkJwt, require('./server/routes/batch'))

  // get timezone
  app.use('/api/timezone', checkJwt, require('./server/routes/timezone'))

  app.use('/api/external', external)

  // serve the database-generated sitemap of races:
  app.use('/sitemap.database.xml', require('./server/routes/sitemap'))

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

  app.get('/*', (req, res) => {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate')
    res.header('Expires', '-1')
    res.header('Pragma', 'no-cache')
    res.sendFile(HTML_FILE)
  })

  const PORT = process.env.PORT || 8080
  app.listen(PORT, () => {
    logger.info(`DIST_DIR: ${DIST_DIR}`)
    logger.info(`HTML_FILE: ${HTML_FILE}`)
    logger.info(`STATIC_FOLDER: ${STATIC_FOLDER}`)
    logger.info(`App listening on port ${PORT}`)
    logger.info('Press Ctrl+C to quit.')
  })
}

startUp()
