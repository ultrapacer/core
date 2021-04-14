![My image](https://ultrapacer.com/public/favicon-96x96.png)

# using ultraPacer
Go to [https://ultrapacer.com](https://ultrapacer.com)

# development

## Config Files
``` bash
# add a file /config/keys.js with:
module.exports = {
  AUTH0_DOMAIN: "'XXXXXXXXXX'", // Auth0 domain address
  AUTH0_CLIENT_ID: "'XXXXXXXXXX'", // Auth0 Client ID
  AUTH0_AUDIENCE: "'XXXXXXXXXX'", // Auth0 audience address
  MONGODB: "'mongodb+srv://XXXXXXXXXX'" // credentials and path to database
}
```
  
## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:3000
start nodemon server
start npm run dev
```

  
## No License / Copyright
The source code herin is copyright to Danny Murphy.
This code may be forked, downloaded, and/or modified for the purposes of
contributing to this project only. There is no license for any other use or
distribution.
