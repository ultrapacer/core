'use strict';

const express = require('express');
const jwt = require("express-jwt");
const jwksRsa = require("jwks-rsa");
const path = require('path');

const app = express(),
            DIST_DIR = path.join(__dirname + '/dist'),
            HTML_FILE = path.join(DIST_DIR, 'index.html'),
            STATIC_FOLDER = path.join(DIST_DIR, '/static')
//app.use('/static', express.static('public'));

// Set up Auth0 configuration
const authConfig = require("./config/auth_config.json");

// Define middleware that validates incoming bearer tokens
// using JWKS from YOUR_TENANT
const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${authConfig.domain}/.well-known/jwks.json`
  }),

  audience: authConfig.audience,
  issuer: `https://${authConfig.domain}/`,
  algorithm: ["RS256"]
});

// Define an endpoint that must be called with an access token
app.get("/api/external", checkJwt, (req, res) => {
  res.send({
    msg: "Your Access Token was successfully validated!"
  });
});

app.get('/*', (req, res) => {
    res.sendFile(HTML_FILE)
})

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`DIST_DIR: ${DIST_DIR}`);
  console.log(`HTML_FILE: ${HTML_FILE}`);
  console.log(`STATIC_FOLDER: ${STATIC_FOLDER}`);
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});