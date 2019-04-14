'use strict';

const express = require('express');
const path = require('path');

const app = express(),
            DIST_DIR = path.join(__dirname + '/dist'),
            HTML_FILE = path.join(DIST_DIR, 'index.html'),
            STATIC_FOLDER = path.join(DIST_DIR, '/static')
//app.use('/static', express.static('public'));

app.get('/', (req, res) => {
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