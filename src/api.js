import Vue from 'vue'
import axios from 'axios'

const client = axios.create({
  baseURL: 'http://localhost:3000',
  json: true
})

export default {
  async execute (method, resource, data) {
    // inject the accessToken for each request
    let accessToken = await Vue.prototype.$auth.getAccessToken()
    return client({
      method,
      url: resource,
      data,
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }).then(req => {
      return req.data
    })
  },
  getPosts () {
    return this.execute('get', '/api/posts')
  },
  getPost (id) {
    return this.execute('get', `/api/posts/${id}`)
  },
  createPost (data) {
    return this.execute('post', '/api/posts', data)
  },
  updatePost (id, data) {
    return this.execute('put', `/api/posts/${id}`, data)
  },
  deletePost (id) {
    return this.execute('delete', `/api/posts/${id}`)
  },
  callApi () {
    return this.execute('get', '/api/external')
  }
}