import Vue from 'vue'
import axios from 'axios'
import { logger } from './plugins/logger'

const client = axios.create({
  json: true
})

export default {
  async executeAuth (method, resource, data) {
    const t = logger(`api|executeAuth|${method}|${resource} initiated`)
    const accessToken = await Vue.prototype.$auth.getAccessToken()
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
    const t = logger(`api|execute|${method}|${resource} initiated`)
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
    return this.executeAuth('get', '/api/user')
  },
  updateSettings (id, data) {
    return this.executeAuth('put', `/api/user/${id}`, data)
  },
  getCourses () {
    return this.executeAuth('get', '/api/courses')
  },
  getRaces () {
    return this.execute('get', '/api-public/races')
  },
  async getCourse (id, key = 'course') {
    const sub = (key === 'course') ? '' : key + '/'
    if (Vue.prototype.$auth.isAuthenticated()) {
      return this.executeAuth('get', `/api/course/${sub}${id}`)
    } else {
      return this.execute('get', `/api-public/course/${sub}${id}`)
    }
  },
  async getCourseField (id, field, tryAuth = true) {
    if (tryAuth && Vue.prototype.$auth.isAuthenticated()) {
      return this.executeAuth('get', `/api/course/${id}/field/${field}`)
    } else {
      return this.execute('get', `/api-public/course/${id}/field/${field}`)
    }
  },
  async getCourseFields (id, key = 'course', fields, tryAuth = true) {
    const sub = (key === 'course') ? '' : key + '/'
    if (tryAuth && Vue.prototype.$auth.isAuthenticated()) {
      return this.executeAuth('put', `/api/course/${sub}${id}/fields`, fields)
    } else {
      return this.execute('put', `/api-public/course/${sub}${id}/fields`, fields)
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
  copyCourse (id) {
    return this.executeAuth('put', `/api/course/${id}/copy`)
  },
  updateCourseCache (id, data) {
    return this.executeAuth('put', `/api/course/${id}/cache`, data)
  },
  getWaypoints (courseID) {
    return this.executeAuth('get', `/api/course/${courseID}/waypoints`)
  },
  createWaypoint (data) {
    return this.executeAuth('post', '/api/waypoint', data)
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
    return this.executeAuth('post', '/api/plan', data)
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
  getTimeZone (lat, lon) {
    return this.execute('get', `/api/timezone?lat=${lat}&lon=${lon}`)
  }
}
