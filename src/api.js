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
  selectCoursePlan (id, data) {
    return this.execute('put', `/api/course/${id}/plan`, data)
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
  },
  getPlans (courseID) {
    return this.execute('get', `/api/plan/list/${courseID}`)
  },
  createPlan (data) {
    return this.execute('post', `/api/plan`, data)
  },
  updatePlan (id, data) {
    return this.execute('put', `/api/plan/${id}`, data)
  },
  deletePlan (id) {
    return this.execute('delete', `/api/plan/${id}`)
  }
}
