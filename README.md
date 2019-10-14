![My image](https://ultrapacer.com/public/favicon-96x96.png)

# using ultraPacer
Go to [https://ultrapacer.com](https://ultrapacer.com)

# development

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

# serve with hot reload at localhost:3000
npm run dev
```

  
## No License / Copyright
The source code herin is copyright Amokrunner, LLC.
This code may be forked, downloaded, and/or modified for the purposes of contributing to this project only. There is no license for any other use or distribution.
