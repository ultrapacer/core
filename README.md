![My image](https://ultrapacer.com/public/favicon-96x96.png)

# using ultraPacer
Go to [https://ultrapacer.com](https://ultrapacer.com)

# development

## A. Config Files
The following is required to start a dev instance of the server. If
you just want just the front end (and do not need user
authentication), skip this.
``` bash
# add a file /config/keys.js with:
module.exports = {
  AUTH0_DOMAIN: "'XXXXXXXXXX'", // Auth0 domain address
  AUTH0_CLIENT_ID: "'XXXXXXXXXX'", // Auth0 Client ID
  AUTH0_AUDIENCE: "'XXXXXXXXXX'", // Auth0 audience address
  MONGODB: "'mongodb+srv://XXXXXXXXXX'" // credentials and path to database
}
```

## B. Build Setup
Install dependencies:
``` bash
npm install
```

## C. Starting up
### To serve both front-end and back-end
Start server in one console:
``` bash
nodemon server
```

Start front end in another console:
``` bash
npm run dev
```

### Webpack Dev Server, just the front-end (using official api)
``` bash
npm run dev
```

###  Webpack Dev Server, with your own api host
To do this, you need to modify your hosts file to forward api.local.com to local IP
``` bash
npm run dev -- --env api-host="http://api.local.com:8080"
```

### Build and run
``` bash
npm run build
nodemon start server development
```

## D. Accessing local site
Navigate to **localhost:3000** in your browser

## No License / Copyright
The source code herin is copyright to Danny Murphy.
This code may be forked, downloaded, and/or modified for the purposes of
contributing to this project only. There is no license for any other use or
distribution.
