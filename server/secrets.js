const logger = require('winston').child({ file: 'secrets.js' })

try {
  const keys = require('../config/keys')
  // hack to get rid of double+single quote format in keys.js file
  Object.keys(keys).forEach(k => {
    keys[k] = keys[k].replace(/'/g, '')
    process.env[k] = keys[k]
    logger.info(`Read secret ${k} from config file.`)
  })
} catch (error) {
  logger.info('No local secret file')
}

const { SecretManagerServiceClient } = require('@google-cloud/secret-manager')
const client = new SecretManagerServiceClient()

async function getSecret (name) {
  if (Array.isArray(name)) {
    const vals = await Promise.all(
      name.map(n => { return lookUp(n) })
    )
    const res = {}
    name.forEach((n, i) => { res[n] = vals[i] })
    return res
  } else {
    return lookUp(name)
  }
}

async function lookUp (name) {
  // if secret already exists, just return it
  if (process.env[name]) return process.env[name]

  // get it from secret manager:
  const res = await client.accessSecretVersion({
    name: `projects/409830855103/secrets/${name}/versions/latest`
  })

  // parse from response:
  const val = res[0].payload.data.toString()

  // store in env:
  process.env[name] = val

  // log
  logger.child({ method: 'lookUp' }).info(`Read secret ${name} from config Secret Manager.`)

  // and return it
  return val
}

module.exports.getSecret = getSecret
