import Vue from 'vue'
import axios from 'axios'

const client = axios.create({
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
  getUser () {
    return this.execute('get', `/api/user`)
  },
  updateSettings (id, data) {
    return this.execute('put', `/api/user/${id}`, data)
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
  getCourses () {
    return this.execute('get', '/api/courses')
  },
  getCourse (id) {
    return this.execute('get', `/api/course/${id}`)
  },
  createCourse (data) {
    return this.execute('post', '/api/courses', data)
  },
  updateCourse (id, data) {
    return this.execute('put', `/api/courses/${id}`, data)
  },
  deleteCourse (id) {
    return this.execute('delete', `/api/courses/${id}`)
  },
  getWaypoints (courseID) {
    return this.execute('get', `/api/waypoint/list/${courseID}`)
  },
  createWaypoint (data) {
    return this.execute('post', `/api/waypoint`, data)
  },
  updateWaypoint (id, data) {
    return this.execute('put', `/api/waypoint/${id}`, data)
  },
  updateSegment (id, data) {
    return this.execute('put', `/api/waypoint/${id}/segment`, data)
  },
  deleteWaypoint (id) {
    return this.execute('delete', `/api/waypoint/${id}`)
  }
}
