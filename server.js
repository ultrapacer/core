'use strict'
const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cors = require('cors')
const userRoutes = require('./server/routes/userRoutes')
const courseRoutes = require('./server/routes/courseRoutes')
const waypointRoutes = require('./server/routes/waypointRoutes')
const planRoutes = require('./server/routes/planRoutes')
const publicRoutes = require('./server/routes/publicRoutes')
const external = require('./server/routes/external')
const jwt = require('express-jwt')
const jwksRsa = require('jwks-rsa')
const geoTz = require('geo-tz')
const patreon = require('./server/routes/patreon')

// load keys from either ./config/keys.js file or from google cloud secrets:
let keys = {}
const keynames = [
  'MONGODB',
  'AUTH0_DOMAIN',
  'AUTH0_AUDIENCE',
  'GOOGLE_API_KEY',
  'PATREON_CLIENT_ID',
  'PATREON_CLIENT_SECRET',
  'PATREON_CAMPAIGN',
  'PATREON_CREATOR_ID',
  'STRAVA_CLIENT_ID',
  'STRAVA_CLIENT_SECRET',
  'STRAVA_REFRESH_TOKEN',
  'SMTP_USERNAME',
  'SMTP_PASSWORD'
]
try {
  keys = require('./config/keys')
  // hack to get rid of double+single quote format in keys.js file
  Object.keys(keys).forEach(k => {
    keys[k] = keys[k].replace(/'/g, '')
  })
  // store keys in env:
  keynames.forEach(k => { process.env[k] = keys[k] })
  startUp()
} catch (err) {
  const { SecretManagerServiceClient } = require('@google-cloud/secret-manager')
  const client = new SecretManagerServiceClient()
  Promise.all(keynames.map(n => {
    return client.accessSecretVersion({
      name: `projects/409830855103/secrets/${n}/versions/1`
    })
  })).then(res => {
    keynames.forEach((n, i) => {
      keys[n] = res[i][0].payload.data.toString()
    })
    // store keys in env:
    keynames.forEach(k => { process.env[k] = keys[k] })
    startUp()
  })
}

function startUp () {
  const elevation = require('./server/routes/elevation')
  const email = require('./server/routes/email')
  const strava = require('./server/routes/strava')
  const mailer = require('./server/tasks/mailer')
  // connect to the database:
  mongoose.Promise = global.Promise
  mongoose.set('useFindAndModify', false)
  mongoose.connect(keys.MONGODB).then(
    () => { console.log('Database is connected') },
    err => { console.log('Can not connect to the database' + err) }
  )

  const app = express()
  const DIST_DIR = path.join(__dirname, '/dist')
  const HTML_FILE = path.join(DIST_DIR, 'index.html')
  const STATIC_FOLDER = path.join(DIST_DIR, '/static')

  app.use(cors())
  app.use(bodyParser.json({ limit: '50mb' }))

  const checkJwt = jwt({
    secret: jwksRsa.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: `https://${keys.AUTH0_DOMAIN}/.well-known/jwks.json`
    }),

    audience: keys.AUTH0_AUDIENCE,
    issuer: `https://${keys.AUTH0_DOMAIN}/`,
    algorithm: ['RS256']
  })

  app.use('/api/user', checkJwt, userRoutes)
  app.use(['/api/course', '/api/courses'], checkJwt, courseRoutes)
  app.use('/api/waypoint', checkJwt, waypointRoutes)
  app.use('/api/plan', checkJwt, planRoutes)
  app.use('/api/elevation', elevation)
  app.use('/api/email', checkJwt, email)
  app.use('/api/patreon', checkJwt, patreon.auth) // authenticated patreon routes
  app.use('/api/open/patreon', patreon.open) // unauthenticated patreon routes
  app.use('/api/strava', strava)
  app.use('/api/external', external)

  app.use('/tasks/mailer', mailer)

  // unauthenticated api routes:
  app.use('/api-public', publicRoutes)

  // redirect static files:
  app.get('/robots.txt', function (req, res) {
    res.sendFile(path.join(DIST_DIR, '/public/robots.txt'))
  })
  app.get('/sitemap.xml', function (req, res) {
    res.sendFile(path.join(DIST_DIR, '/public/sitemap.xml'))
  })

  // get timezone
  app.get('/api/timezone', function (req, res) {
    const tz = geoTz(req.query.lat, req.query.lon)
    res.send(tz[0])
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
  // end temporary

  app.get('/*', (req, res) => {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate')
    res.header('Expires', '-1')
    res.header('Pragma', 'no-cache')
    res.sendFile(HTML_FILE)
  })

  const PORT = process.env.PORT || 8080
  app.listen(PORT, () => {
    console.log(`DIST_DIR: ${DIST_DIR}`)
    console.log(`HTML_FILE: ${HTML_FILE}`)
    console.log(`STATIC_FOLDER: ${STATIC_FOLDER}`)
    console.log(`App listening on port ${PORT}`)
    console.log('Press Ctrl+C to quit.')
  })
}
