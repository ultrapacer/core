# pacer

> A Vue.js project

## Config Files
``` bash
# add a file /config/DB.js with:
module.exports = {
  DB: 'path_to_your_mongodb'
}

# add a file /config/auth_config.json with AUTH0 credentials:
{
  "domain": "XXXXXXXXXX",
  "clientId": "XXXXXXXXXXXX",
  "audience": "XXXXXXXXXXXX"
}
```
  
## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report

# run unit tests
npm run unit

# run e2e tests
npm run e2e

# run all tests
npm test
```

For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).
