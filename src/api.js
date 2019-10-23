import Vue from 'vue'
import axios from 'axios'
import { logger } from './plugins/logger'

const client = axios.create({
  json: true
})

export default {
  async executeAuth (method, resource, data) {
    var t = logger()
    let accessToken = await Vue.prototype.$auth.getAccessToken()
    return client({
      method,
      url: resource,
      data,
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }).then(req => {
      logger(`api|executeAuth|${method}|${resource}`, t)
      return req.data
    })
  },
  async execute (method, resource, data) {
    var t = logger()
    return client({
      method,
      url: resource,
      data
    }).then(req => {
      logger(`api|execute|${method}|${resource}`, t)
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
  async getCourse (id, authenticated, key = 'course') {
    let sub = (key === 'plan') ? 'plan/' : ''
    try {
      await Vue.prototype.$auth.getAccessToken()
      return this.executeAuth('get', `/api/course/${sub}${id}`)
    } catch (err) {
      return this.execute('get', `/api-public/course/${sub}${id}`)
    }
  },
  async getCourseField (id, field) {
    try {
      await Vue.prototype.$auth.getAccessToken()
      return this.executeAuth('get', `/api/course/${id}/field/${field}`)
    } catch (err) {
      return this.execute('get', `/api-public/course/${id}/field/${field}`)
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
  }
}
