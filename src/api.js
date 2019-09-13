import Vue from 'vue'
import axios from 'axios'

const client = axios.create({
  json: true
})

export default {
  async executeAuth (method, resource, data) {
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
  async executePublic (method, resource, data) {
    return client({
      method,
      url: resource,
      data
    }).then(req => {
      return req.data
    })
  },
  getUser () {
    return this.executeAuth('get', `/api/user`)
  },
  updateSettings (id, data) {
    return this.executeAuth('put', `/api/user/${id}`, data)
  },
  getCourses () {
    return this.executeAuth('get', '/api/courses')
  },
  async getCourse (id, key = 'course') {
    try {
      await Vue.prototype.$auth.getAccessToken()
      if (key === 'plan') {
        return this.executeAuth('get', `/api/course/plan/${id}`)
      } else {
        return this.executeAuth('get', `/api/course/${id}`)
      }
    } catch (err) {
      console.log('Not authenticated. Attempting public access.')
      if (key === 'plan') {
        return this.executePublic('get', `/api-public/course/plan/${id}`)
      } else {
        return this.executePublic('get', `/api-public/course/${id}`)
      }
    }
  },
  createCourse (data) {
    return this.executeAuth('post', '/api/courses', data)
  },
  updateCourse (id, data) {
    return this.executeAuth('put', `/api/courses/${id}`, data)
  },
  selectCoursePlan (id, data) {
    return this.executeAuth('put', `/api/course/${id}/plan`, data)
  },
  deleteCourse (id) {
    return this.executeAuth('delete', `/api/courses/${id}`)
  },
  useCourse (id) {
    return this.executeAuth('put', `/api/courses/${id}/use`)
  },
  updateCourseCache (id, data) {
    return this.executeAuth('put', `/api/course/${id}/cache`, data)
  },
  getWaypoints (courseID) {
    return this.executeAuth('get', `/api/course/${courseID}/waypoints`)
  },
  createWaypoint (data) {
    return this.executeAuth('post', `/api/waypoint`, data)
  },
  updateWaypoint (id, data) {
    return this.executeAuth('put', `/api/waypoint/${id}`, data)
  },
  deleteWaypoint (id) {
    return this.executeAuth('delete', `/api/waypoint/${id}`)
  },
  getPlans (courseID, userID) {
    return this.executeAuth('get', `/api/course/${courseID}/plans/${userID}`)
  },
  createPlan (data) {
    return this.executeAuth('post', `/api/plan`, data)
  },
  updatePlan (id, data) {
    return this.executeAuth('put', `/api/plan/${id}`, data)
  },
  deletePlan (id) {
    return this.executeAuth('delete', `/api/plan/${id}`)
  },
  updatePlanCache (id, data) {
    return this.executeAuth('put', `/api/plan/${id}/cache`, data)
  },
}
