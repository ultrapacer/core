'use strict'
const express = require('express')
const path = require('path')
const dbconfig = require('./config/DB')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cors = require('cors')
const userRoutes = require('./server/routes/userRoutes')
const courseRoutes = require('./server/routes/courseRoutes')
const waypointRoutes = require('./server/routes/waypointRoutes')
const planRoutes = require('./server/routes/planRoutes')
const publicRoutes = require('./server/routes/publicRoutes')
const jwt = require('express-jwt')
const jwksRsa = require('jwks-rsa')
const authConfig = require('./config/auth_config.json')

const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${authConfig.domain}/.well-known/jwks.json`
  }),

  audience: authConfig.audience,
  issuer: `https://${authConfig.domain}/`,
  algorithm: ['RS256']
})

const app = express()
const DIST_DIR = path.join(__dirname, '/dist')
const HTML_FILE = path.join(DIST_DIR, 'index.html')
const STATIC_FOLDER = path.join(DIST_DIR, '/static')

mongoose.Promise = global.Promise
mongoose.connect(dbconfig.DB).then(
  () => { console.log('Database is connected') },
  err => { console.log('Can not connect to the database' + err) }
)

app.use(cors())
app.use(bodyParser.json({ limit: "50mb" }))

// authenticated api routes:
app.use('/api/user', checkJwt, userRoutes)
app.use(['/api/course', '/api/courses'], checkJwt, courseRoutes)
app.use('/api/waypoint', checkJwt, waypointRoutes)
app.use('/api/plan', checkJwt, planRoutes)

// unauthenticated api routes:
app.use('/api-public', publicRoutes)

app.get('/*', (req, res) => {
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
