import axios from 'axios'
const logger = require('winston').child({ file: 'api-external.js' })

const client = axios.create({
  json: true
})
const host = window.location.origin.includes('localhost') ? '' : 'https://ultrapacer.com'
export default {
  async execute (method, resource, data) {
    const log = logger.child({ method: 'execute' })
    log.info(`${method}|${resource} initiated`)
    return client({
      method,
      url: resource,
      data
    }).then(req => {
      log.info(`${method}|${resource} completed`)
      return req.data
    })
  },
  async getUpTable (id, type) {
    return this.execute('get', `${host}/api/external/up-table/${id}/${type}`)
  }
}
