![My image](https://ultrapacer.com/public/favicon-96x96.png)

# using ultraPacer
Go to [https://ultrapacer.com](https://ultrapacer.com)

# development

## A. Build Setup
Install dependencies:
``` bash
npm install
```

## B. Starting up

### Webpack Dev Server, just the front-end (using official api)
``` bash
npm run dev
```

###  Webpack Dev Server, with your own api host
To do this, you need to modify your hosts file to forward api.local.com to local IP
``` bash
npm run dev -- --env api-host="http://localhost:8080"
```

### Build and run
``` bash
npm run build
nodemon start server.js development
```

## C. Accessing local site
Navigate to **localhost:3000** in your browser

## No License / Copyright
The source code herin is copyright to Danny Murphy.
This code may be forked, downloaded, and/or modified for the purposes of
contributing to this project only. There is no license for any other use or
distribution.
