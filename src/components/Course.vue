<template>
  <div class="container-fluid mt-4">
    <b-row>
      <b-col class="d-none d-md-block">
        <h1 class="h1">{{ course.name }}</h1>
<!--         <p v-if="event.start">{{ event.start }}</p>
        <p v-if="course.description">{{ course.description }}</p> -->
      </b-col>
      <b-col v-if="!initializing" style="text-align:right">
        <b-row v-if="plansSelect.length">
          <b-col v-if="plansSelect.length" >
            <b-form-group label-size="sm" label="Plan" label-cols="4"  label-cols-lg="2">
              <b-form-select
                  type="number"
                  v-model="plan"
                  :options="plansSelect"
                  @change="calcPlan"
                  size="sm"
                ></b-form-select>
            </b-form-group>
          </b-col>
          <b-col cols="4" md="3" lg="3" xl="2" class="pl-n3 pr-n5" style="text-align:left">
            <b-btn @click="editPlan()" class="ml-n4 mr-1" size="sm" v-if="planOwner"
                v-b-popover.hover.blur.bottomright.d250.v-info="
                'Edit the selected pacing plan.'
              "
            >
              <v-icon name="edit"></v-icon>
            </b-btn>
            <b-btn
                v-if="isAuthenticated"
                variant="success"
                @click.prevent="newPlan()"
                size="sm"
                v-b-popover.hover.blur.bottomright.d250.v-info="
                'Create a new pacing plan for this course.'
              "
            >
              <v-icon name="plus"></v-icon>
              <span v-if="!plansSelect.length" >New Plan</span>
            </b-btn>
          </b-col>
        </b-row>
        <b-row v-if="!plansSelect.length">
          <b-col>
            <b-btn variant="success" @click.prevent="newPlan()" size="sm"
                v-b-popover.hover.bottomright.d250.v-info="
                'Create a new pacing plan for this course.'
              "
            >
              <v-icon name="plus"></v-icon>
              New Pacing Plan
            </b-btn>
          </b-col>
        </b-row>
      </b-col>
      <b-col cols=2 md=1 class="ml-n3" style="text-align:right">
        <b-btn v-if="!initializing" @click="$refs.download.generateFile()" class="mr-1" size="sm" v-b-popover.hover.blur.bottomright.d250.v-info="
                'Download GPX file.'
              ">
          <v-icon name="download"></v-icon>
        </b-btn>
      </b-col>
    </b-row>
    <div v-if="initializing" class="d-flex justify-content-center mb-3">
      <b-spinner label="Loading..." ></b-spinner>
    </div>
    <b-row v-if="!initializing">
      <b-col order="2">
        <b-tabs v-model="tableTabIndex" content-class="mt-3" small>
          <b-tab title="Segments" active>
            <segment-table
                v-if="segments.length"
                ref="segmentTable"
                :course="course"
                :segments="segments"
                :units="units"
                :pacing="pacing"
                :busy="busy"
                :mode="'segments'"
                @select="updateFocus"
                @show="waypointShow"
                @hide="waypointHide"
              ></segment-table>
            <div v-else class="d-flex justify-content-center mt-3 mb-3">
              <b-spinner label="Loading..." ></b-spinner>
            </div>
          </b-tab>
          <b-tab title="Splits">
            <segment-table
                v-if="splits.length"
                ref="splitTable"
                :course="course"
                :segments="splits"
                :units="units"
                :pacing="pacing"
                :busy="busy"
                :mode="'splits'"
                @select="updateFocus"
              ></segment-table>
            <div v-else class="d-flex justify-content-center mt-3 mb-3">
              <b-spinner label="Loading..." ></b-spinner>
            </div>
          </b-tab>
          <b-tab title="Waypoints">
            <waypoint-table
                ref="waypointTable"
                :course="course"
                :points="points"
                :units="units"
                :editing="editing"
                :editFn="editWaypoint"
                :delFn="deleteWaypoint"
                @setUpdateFlag="setUpdateFlag"
              ></waypoint-table>
            <div v-if="editing">
              <b-btn variant="success" @click.prevent="newWaypoint()">
                <v-icon name="plus"></v-icon><span>New Waypoint</span>
              </b-btn>
              <b-btn
                  variant="outline-primary"
                  @click.prevent="editing=false"
                  style="float:right"
                >
                <v-icon name="edit"></v-icon><span>editing: on</span>
              </b-btn>
            </div>
            <div v-if="owner && !editing">
              <b-btn
                  @click.prevent="editing=true"
                  style="float:right"
                >
                <v-icon name="lock"></v-icon><span>editing: off</span>
              </b-btn>
            </div>
          </b-tab>
          <b-tab v-if="pacing.factors" title="Details">
            <plan-details
                :course="course"
                :points="points"
                :event="event"
                :plan="plan"
                :pacing="pacing"
                :units="units"
                :busy="busy"
              ></plan-details>
          </b-tab>
        </b-tabs>
      </b-col>
      <b-col lg="5" order="1">
        <div v-if="this.points.length" class="sticky-top mt-1">
          <course-profile
              ref="profile"
              :course="course"
              :points="points"
              :sunEvents="pacing.sunEventsByLoc"
              :units="units"
              :waypointShowMode="waypointShowMode"
              @waypointClick="waypointClick"
            ></course-profile>
          <course-map
              ref="map"
              :course="course"
              :points="points"
              :focus="mapFocus"
              :units="units"
              :waypointShowMode="waypointShowMode"
            ></course-map>
        </div>
        <div v-else class="d-flex justify-content-center mt-3 mb-3">
          <b-spinner label="Loading..." ></b-spinner>
        </div>
      </b-col>
    </b-row>
    <plan-edit
      ref="planEdit"
      :course="course"
      :event="event"
      :units="units"
      @refresh="refreshPlans"
      @delete="deletePlan"
    ></plan-edit>
    <waypoint-edit
      v-if="editing"
      ref="wpEdit"
      :course="course"
      :points="points"
      :units="units"
      :terrainFactors="terrainFactors"
      @refresh="refreshWaypoints"
      @delete="deleteWaypoint"
      @setUpdateFlag="setUpdateFlag"
    ></waypoint-edit>
    <delete-modal
      ref="delModal"
    ></delete-modal>
    <download-gpx
      ref="download"
      :id="course._id"
    ></download-gpx>
  </div>
</template>

<script>
import api from '@/api'
import geo from '@/util/geo'
import nF from '@/util/normFactor'
import {round} from '../util/math'
import {string2sec} from '../util/time'
import CourseMap from './CourseMap'
import CourseProfile from './CourseProfile'
import DeleteModal from './DeleteModal'
import DownloadGpx from './DownloadGPX'
import SegmentTable from './SegmentTable'
import WaypointTable from './WaypointTable'
import PlanDetails from './PlanDetails'
import PlanEdit from './PlanEdit'
import WaypointEdit from './WaypointEdit'
import SunCalc from 'suncalc'
import moment from 'moment-timezone'
var JSURL = require('@yaska-eu/jsurl2')

export default {
  title: 'Course',
  props: ['isAuthenticated', 'user'],
  components: {
    CourseMap,
    CourseProfile,
    DeleteModal,
    DownloadGpx,
    SegmentTable,
    WaypointTable,
    PlanDetails,
    PlanEdit,
    WaypointEdit
  },
  data () {
    return {
      initializing: true,
      busy: true,
      editing: false,
      saving: false,
      course: {},
      plan: null,
      plans: [],
      points: [],
      segments: [],
      miles: [],
      kilometers: [],
      scales: {},
      waypoint: {},
      pacing: {},
      mapFocus: [],
      tableTabIndex: 0,
      updateFlag: false
    }
  },
  computed: {
    event: function () {
      let t = this.$logger()
      let e = {
        start: null,
        startTime: null,
        timezone: moment.tz.guess()
      }
      if (this.plan && this.plan.eventStart) {
        e.start = this.plan.eventStart
        e.timezone = this.plan.eventTimezone
      } else if (this.course.eventStart) {
        e.start = this.course.eventStart
        e.timezone = this.course.eventTimezone
      } else {
        return e
      }
      let m = moment(e.start).tz(e.timezone)
      e.timeString = m.format('kk:mm')
      e.startTime = string2sec(`${e.timeString}:00`)
      if (this.points.length) {
        let times = SunCalc.getTimes(
          m.toDate(),
          this.points[0].lat,
          this.points[0].lon
        )
        e.sun = {
          dawn: string2sec(moment(times.dawn).tz(e.timezone).format('HH:mm:ss')),
          rise: string2sec(moment(times.sunrise).tz(e.timezone).format('HH:mm:ss')),
          set: string2sec(moment(times.sunset).tz(e.timezone).format('HH:mm:ss')),
          dusk: string2sec(moment(times.dusk).tz(e.timezone).format('HH:mm:ss'))
        }
      }
      this.$logger('Course|compute-event', t)
      return e
    },
    heatModel: function () {
      if (
        !this.event.sun ||
        !this.planAssigned ||
        !this.plan.heatModel
      ) { return null }
      let hM = {...this.plan.heatModel}
      hM.start = this.event.sun.rise + 1800
      hM.stop = this.event.sun.set + 3600
      return hM
    },
    plansSelect: function () {
      var p = []
      for (var i = 0, il = this.plans.length; i < il; i++) {
        p.push({
          value: this.plans[i],
          text: this.plans[i].name
        })
      }
      return p
    },
    owner: function () {
      if (
        this.isAuthenticated &&
        String(this.user._id) === String(this.course._user)
      ) {
        return true
      } else {
        return false
      }
    },
    planAssigned: function () {
      return Boolean(this.plan)
    },
    planOwner: function () {
      return this.plan && (
        (
          this.plan._id &&
          this.isAuthenticated &&
          String(this.user._id) === String(this.plan._user)
        ) ||
        !this.plan._id
      )
    },
    splits: function () {
      if (this.units.dist === 'km') {
        return this.kilometers
      } else {
        return this.miles
      }
    },
    terrainFactors: function () {
      let l = this.$logger()
      if (!this.course.waypoints) { return [] }
      if (!this.course.waypoints.length) { return [] }
      let wps = this.course.waypoints
      let tF = wps[0].terrainFactor
      let tFs = wps.map((x, i) => {
        if (i < wps.length - 1) {
          if (x.terrainFactor !== null) { tF = x.terrainFactor }
          return {
            start: x.location,
            end: wps[i + 1].location,
            tF: tF
          }
        }
      })
      tFs.pop()
      this.$logger('terrainFactors', l)
      return tFs
    },
    delays: function () {
      let t = this.$logger()
      if (!this.course.waypoints) { return [] }
      if (!this.course.waypoints.length) { return [] }
      if (!this.planAssigned) { return [] }
      let wps = this.course.waypoints
      let wpdelay = (this.planAssigned) ? this.plan.waypointDelay : 0
      let d = []
      wps.forEach((x, i) => {
        if (x.type === 'aid' || x.type === 'water') {
          wps[i].delay = wpdelay
          d.push({
            loc: x.location,
            delay: x.delay
          })
        } else {
          wps[i].delay = 0
        }
      })
      this.$logger('compute-delays', t)
      return d
    },
    publicName: function () {
      return this.course.public ? this.course.name : 'private'
    },
    units: function () {
      var u = {
        dist: (this.isAuthenticated) ? this.user.distUnits : 'mi',
        alt: (this.isAuthenticated) ? this.user.elevUnits : 'ft'
      }
      u.distScale = (u.dist === 'mi') ? 0.621371 : 1
      u.altScale = (u.alt === 'ft') ? 3.28084 : 1
      return u
    },
    waypointShowMode: function () {
      if (this.editing && this.tableTabIndex === 2) {
        return 3
      } else if (this.tableTabIndex === 2) {
        return 2
      } else {
        return null
      }
    }
  },
  async created () {
    this.$calculating.setCalculating(true)
    let t = this.$logger()
    try {
      await this.$auth.getAccessToken()
    } catch (err) {}
    t = this.$logger('Course|created - auth initiated', t)
    try {
      if (this.$route.params.plan) {
        this.course = await api.getCourse(this.$route.params.plan, 'plan')
      } else {
        this.course = await api.getCourse(this.$route.params.course, 'course')
      }
      t = this.$logger('Course|api.getCourse', t)
      this.getPoints()
      this.$ga.event('Course', 'view', this.publicName)
      this.plans = this.course.plans
      this.syncCache(this.course)
      this.syncCache(this.plans)
      this.resetWaypointShow()
      if (this.$route.params.plan) {
        this.plan = this.plans.find(
          x => x._id === this.$route.params.plan
        )
        this.$ga.event('Plan', 'view', this.publicName)
      }
    } catch (err) {
      console.log(err)
      this.$router.push({path: '/'})
      return
    }
    this.$title = this.course.name
    this.useCache()
    this.initializing = false
    this.busy = false
    this.$calculating.setCalculating(false)
    setTimeout(() => {
      if (!this.isAuthenticated) {
        this.$bvToast.toast(
          'ultraPacer is a web app for creating courses and pacing plans for ultramarathons and trail adventures that factor in grade, terrain, altitude, heat, nighttime, and fatigue. To create a pace plan for this course, select the "New Pacing Plan" button on the top right. Happy running!',
          {
            title: 'Welcome to ultraPacer!',
            toaster: 'b-toaster-bottom-right',
            solid: true,
            variant: 'info',
            autoHideDelay: 10000
          }
        )
      } else if (screen.width < 992) {
        this.$bvToast.toast(
          'Much of the data on this page is hidden on small screens. Select rows in tables to expand. Use a desktop or tablet for a better experience.',
          {
            title: 'Small/mobile screen',
            toaster: 'b-toaster-bottom-center',
            solid: true,
            variant: 'info',
            autoHideDelay: 6000
          }
        )
      }
    }, 1000)
    if (this.$route.query.plan) {
      let p = JSURL.tryParse(this.$route.query.plan, null)
      if (p) {
        this.$logger('Course|created: showing plan from URL')
        this.$refs.planEdit.show(p)
      }
    }
    this.$logger('Course|created', t)
  },
  methods: {
    async getPoints () {
      let t = this.$logger()
      let pnts = await api.getCourseField(
        this.course._id,
        'points'
      )
      t = this.$logger(`Course|getPoints: downloaded (${pnts.length} points)`, t)
      if (pnts[0].lat) {
        this.points = geo.reduce(pnts)
        if (this.owner) {
          let update = {
            raw: pnts.map(x => {
              return [x.lat, x.lon, x.alt]
            }),
            points: this.points.map(x => {
              return [
                x.loc,
                round(x.lat, 6),
                round(x.lon, 6),
                round(x.alt, 2),
                round(x.grade, 4)
              ]
            })
          }
          await api.updateCourse(this.course._id, update)
          this.$logger(`Course|getPoints: uploading reformatted points)`)
        }
        t = this.$logger(`Course|getPoints: reduced to (${this.points.length} points)`, t)
      } else {
        this.points = pnts.map((x, i) => {
          return {
            loc: x[0],
            dloc: (i > 0) ? x[0] - pnts[i - 1][0] : 0,
            lat: x[1],
            lon: x[2],
            alt: x[3],
            grade: x[4]
          }
        })
      }
      let stats = geo.calcStats(this.points)
      this.scales = {
        gain: this.course.gain / stats.gain,
        loss: this.course.loss / stats.loss,
        grade: (this.course.gain - this.course.loss) / (stats.gain - stats.loss)
      }
      this.points.forEach((x, i) => {
        this.points[i].grade = this.points[i].grade * this.scales.grade
      })
      if (!this.pacing.factors) {
        await this.updatePacing()
      }
      this.$logger('Course|getPoints: complete', t)
    },
    async newWaypoint () {
      this.$refs.wpEdit.show({})
    },
    async editWaypoint (waypoint) {
      this.$refs.wpEdit.show(waypoint)
    },
    async deleteWaypoint (waypoint, cb) {
      this.$refs.delModal.show(
        'Waypoint',
        waypoint,
        async () => {
          // if we are editing a waypoint we deleted, remove it from the form
          if (this.waypoint._id === waypoint._id) {
            this.waypoint = {}
          }
          await api.deleteWaypoint(waypoint._id)
          var index = this.course.waypoints.findIndex(
            x => x._id === waypoint._id
          )
          if (index > -1) {
            this.course.waypoints.splice(index, 1)
          }
        },
        (err) => {
          if (typeof (cb) === 'function') {
            if (err) cb(err)
            else cb()
          }
        }
      )
    },
    async refreshWaypoints (callback) {
      this.course.waypoints = await api.getWaypoints(this.course._id)
      this.resetWaypointShow()
      this.setUpdateFlag()
      if (typeof callback === 'function') callback()
    },
    resetWaypointShow () {
      this.course.waypoints.forEach((x, i) => {
        x.show = x.type === 'start' || x.tier === 1
      })
    },
    async newPlan () {
      this.$ga.event('Plan', 'add', this.publicName)
      if (
        this.isAuthenticated &&
        !this.owner &&
        !this.user._courses.find(x => x === this.course._id)
      ) {
        this.user._courses.push(this.course._id)
      }
      if (this.planAssigned) {
        let p = this.plan
        this.$refs.planEdit.show({
          heatModel: p.heatModel ? {...p.heatModel} : null,
          eventStart: p.eventStart,
          eventTimezone: p.eventTimezone,
          pacingMethod: p.pacingMethod,
          waypointDelay: p.waypointDelay,
          drift: p.drift
        })
      } else {
        this.$refs.planEdit.show()
      }
    },
    async editPlan () {
      this.$refs.planEdit.show(this.plan)
    },
    async deletePlan (plan, cb) {
      this.$refs.delModal.show(
        'Plan',
        plan,
        async () => {
          await api.deletePlan(plan._id)
          this.$ga.event('Plan', 'delete', this.publicName)
          this.plans = await api.getPlans(this.course._id, this.user._id)
          if (this.plan._id === plan._id) {
            if (this.plans.length) {
              this.plan = this.plans[0]
              await this.calcPlan()
            } else {
              this.plan = null
              this.pacing = {}
              this.$router.push({
                name: 'Course',
                params: {
                  'course': this.course._id
                }
              })
            }
          }
        },
        (err) => {
          if (typeof (cb) === 'function') {
            if (err) cb(err)
            else cb()
          }
        }
      )
    },
    async refreshPlans (plan, callback) {
      if (this.$auth.isAuthenticated()) {
        this.plans = await api.getPlans(this.course._id, this.user._id)
        this.syncCache(this.plans)
        this.plan = this.plans.find(p => p._id === plan._id)
      } else {
        this.plan = {...plan}
        this.plans = [this.plan]
      }
      delete this.plan.cache
      await this.calcPlan()
      if (typeof callback === 'function') callback()
    },
    async calcPlan () {
      let t = this.$logger()
      if (!this.planAssigned) { return }
      if (this.plan._id) {
        this.$router.push({
          name: 'Plan',
          params: {
            'plan': this.plan._id
          }
        })
        if (this.owner) {
          api.selectCoursePlan(this.course._id, {plan: this.plan._id})
        }
      } else {
        this.$router.push({
          name: 'Course',
          params: {
            course: this.course._id
          },
          query: {
            plan: JSURL.stringify(this.plan)
          }
        })
      }
      this.$ga.event('Plan', 'view', this.publicName)
      if (!this.useCache()) {
        this.busy = true
        this.$calculating.setCalculating(true)
        setTimeout(() => { this.updatePacing() }, 10)
      } else {
        this.$refs.profile.update()
      }
      this.$logger('Course|calcPlan', t)
    },
    async clearPlan () {
      // deselect the current plan
      if (!this.planAssigned) { return }
      this.plan = {}
      this.$router.push({
        name: 'Course',
        params: {
          'course': this.course._id
        }
      })
      this.$logger('Course|clearPlan')
    },
    async updatePacing () {
      let t = this.$logger()
      // update splits, segments, and pacing
      this.busy = true
      this.updateFlag = false
      this.$calculating.setCalculating(true)

      // clear out time data if not applicable to this plan:
      if (!this.planAssigned) {
        this.points.forEach(x => {
          delete x.time
          delete x.dtime
          delete x.tod
        })
      } else if (this.event.startTime === null) {
        this.points.forEach(x => {
          delete x.tod
        })
      }

      await this.iteratePaceCalc()
      this.updateSplits()

      // iterate solution:
      if (this.planAssigned && this.event.startTime !== null) {
        let lastSplits = this.kilometers.map(x => { return x.time })
        let elapsed = this.kilometers[this.kilometers.length - 1].elapsed
        let t = this.$logger()
        for (var i = 0; i < 10; i++) {
          await this.iteratePaceCalc()
          this.updateSplits()
          let hasChanged = false
          let newSplits = this.kilometers.map(x => { return x.time })
          for (let j = 0; j < newSplits.length; j++) {
            if (Math.abs(newSplits[j] - lastSplits[j]) >= 1) {
              hasChanged = true
              break
            }
          }
          if (
            !hasChanged &&
            Math.abs(elapsed - this.kilometers[this.kilometers.length - 1].elapsed) < 1
          ) { break }
          lastSplits = this.kilometers.map(x => { return x.time })
          elapsed = this.kilometers[this.kilometers.length - 1].elapsed
        }
        this.$logger(`iteratePaceCalc: ${i + 2} iterations`, t)
        this.updateSunTime()
      }
      this.updateSplits('miles')
      this.updateSegments()

      // save cached data:
      if (this.isAuthenticated) {
        let cacheFields = ['pacing', 'segments', 'miles', 'kilometers']
        if (this.planAssigned) {
          this.plan.cache = {}
          cacheFields.forEach(f => {
            this.plan.cache[f] = this[f]
          })
          if (this.planOwner) {
            this.$logger('Course|updatePacing: saving plan cache')
            api.updatePlanCache(
              this.plan._id,
              { cache: this.plan.cache }
            )
          }
        } else {
          this.course.cache = {}
          cacheFields.forEach(f => {
            this.course.cache[f] = this[f]
          })
          if (this.owner) {
            this.$logger('Course|updatePacing: saving course cache')
            api.updateCourseCache(
              this.course._id,
              { cache: this.course.cache }
            )
          }
        }
      }

      // update profile chart
      if (this.$refs.profile) {
        this.$refs.profile.update()
      }

      this.busy = false
      this.$calculating.setCalculating(false)
      this.$logger('Course|updatePacing', t)
    },
    async iteratePaceCalc () {
      let t = this.$logger()
      var plan = false
      if (this.planAssigned) { plan = true }

      // calculate course normalizing factor:
      var tot = 0
      var factors = {gF: 0, aF: 0, tF: 0, hF: 0, dark: 0, dF: 0}
      let fstats = {
        max: {gF: 0, aF: 0, tF: 0, hF: 0, dark: 0, dF: 0},
        min: {gF: 100, aF: 100, tF: 100, hF: 100, dark: 100, dF: 100}
      }
      var p = this.points
      let hasTOD = p[0].hasOwnProperty('tod')
      let fs = {}
      let elapsed = 0
      if (plan && this.pacing.np) {
        p[0].time = 0
        p[0].dtime = 0
        if (this.event.startTime !== null) {
          p[0].tod = this.event.startTime
        }
      }

      // variables & function for adding in delays:
      let delay = 0
      let delays = [...this.delays]
      function getDelay (a, b) {
        if (!delays.length) { return 0 }
        while (delays.length && delays[0].loc < a) {
          delays.shift()
        }
        if (delays.length && delays[0].loc < b) {
          return delays[0].delay
        }
        return 0
      }

      for (let j = 1, jl = p.length; j < jl; j++) {
        // determine pacing factor for point
        fs = {
          gF: nF.gF((p[j - 1].grade + p[j].grade) / 2),
          aF: nF.aF([p[j - 1].alt, p[j].alt], this.course.altModel),
          tF: nF.tF([p[j - 1].loc, p[j].loc], this.terrainFactors),
          hF: (plan && p[1].tod) ? nF.hF([p[j - 1].tod, p[j].tod], this.heatModel) : 1,
          dF: nF.dF(
            [p[j - 1].loc, p[j].loc],
            plan ? this.plan.drift : 0,
            this.course.distance
          ),
          dark: 1
        }
        if (hasTOD) {
          fs.dark = nF.dark([p[j - 1].tod, p[j].tod], fs.tF, this.event.sun)
        }
        let len = p[j].loc - p[j - 1].loc
        let f = 1 // combined segment factor
        Object.keys(fs).forEach(k => {
          factors[k] += fs[k] * len
          f = f * fs[k]
          fstats.max[k] = Math.max(fstats.max[k], fs[k])
          fstats.min[k] = Math.min(fstats.min[k], fs[k])
        })
        tot += f * len
        if (plan && this.pacing.np) {
          p[j].dtime = this.pacing.np * f * p[j].dloc
          delay = getDelay(p[j - 1].loc, p[j].loc)
          elapsed += p[j].dtime + delay
          p[j].elapsed = elapsed
          if (this.event.startTime !== null) {
            p[j].tod = (elapsed + this.event.startTime) % 86400
          }
        }
      }
      Object.keys(factors).forEach(k => {
        factors[k] = factors[k] / this.course.distance
      })
      this.course.norm = (tot / this.course.distance)

      delay = 0
      let time = 0
      let pace = 0
      let np = 0

      if (plan) {
        // calculate delay:
        this.delays.forEach((x, i) => {
          delay += x.delay
        })

        // calculate time, pace, and normalized pace:
        if (this.plan.pacingMethod === 'time') {
          time = this.plan.pacingTarget
          pace = (time - delay) / this.course.distance
          np = pace / this.course.norm
        } else if (this.plan.pacingMethod === 'pace') {
          pace = this.plan.pacingTarget
          time = pace * this.course.distance + delay
          np = pace / this.course.norm
        } else if (this.plan.pacingMethod === 'np') {
          np = this.plan.pacingTarget
          pace = np * this.course.norm
          time = pace * this.course.distance + delay
        }
      }

      this.pacing = {
        scales: this.scales,
        time: time,
        delay: delay,
        factors: factors,
        fstats: fstats,
        moving: time - delay,
        pace: pace,
        nF: this.course.norm,
        np: np,
        drift: plan ? this.plan.drift : 0,
        altModel: this.course.altModel,
        heatModel: this.heatModel,
        tFs: this.terrainFactors,
        delays: this.delays,
        sun: this.event.sun || null
      }

      this.$logger('iteratePaceCalc', t)
    },
    updateSunTime: function () {
      // time in sun zones:
      let sunType0 = ''
      let sunType = ''
      this.pacing.sunEventsByLoc = []
      this.pacing.sunTime = {day: 0, twilight: 0, dark: 0}
      this.pacing.sunDist = {day: 0, twilight: 0, dark: 0}
      this.points.forEach((x, i) => {
        if (
          x.tod <= this.event.sun.dawn ||
          x.tod >= this.event.sun.dusk
        ) {
          sunType = 'dark'
          this.pacing.sunTime.dark += x.dtime
          this.pacing.sunDist.dark += x.dloc
        } else if (
          x.tod < this.event.sun.rise ||
          x.tod > this.event.sun.set
        ) {
          sunType = 'twilight'
          this.pacing.sunTime.twilight += x.dtime
          this.pacing.sunDist.twilight += x.dloc
        } else {
          sunType = 'day'
          this.pacing.sunTime.day += x.dtime
          this.pacing.sunDist.day += x.dloc
        }
        if (sunType !== sunType0) {
          this.pacing.sunEventsByLoc.push({
            'sunType': sunType,
            loc: x.loc
          })
        }
        sunType0 = sunType
      })
    },
    updateSegments: function () {
      let t = this.$logger()
      var breaks = []
      let wps = []
      this.course.waypoints.forEach(x => {
        if (x.tier < 3) {
          breaks.push(x.location)
          wps.push(x)
        }
      })
      let arr = geo.calcSegments(this.points, breaks, this.pacing)
      arr.forEach((x, i) => {
        arr[i].waypoint1 = wps[i]
        arr[i].waypoint2 = wps[i + 1]
        if (this.planAssigned && this.event.startTime !== null) {
          arr[i].tod = (x.elapsed + this.event.startTime)
        }
      })
      this.segments = arr
      this.$logger('Course|updateSegments', t)
    },
    updateSplits: function (unit = 'kilometers') {
      let t = this.$logger()
      // eslint-disable-next-line
      this.updateTrigger // hack for force recompute
      let distScale = (unit === 'kilometers') ? 1 : 0.621371
      let p = this.points
      var tot = p[p.length - 1].loc * distScale
      let breaks = [0]
      var i = 1
      while (i < tot) {
        breaks.push(i / distScale)
        i++
      }
      if (tot / distScale > breaks[breaks.length - 1]) {
        breaks.push(tot / distScale)
      }
      let arr = geo.calcSegments(p, breaks, this.pacing)
      if (this.planAssigned && this.event.startTime !== null) {
        arr.forEach((x, i) => {
          arr[i].tod = (x.elapsed + this.event.startTime)
        })
      }
      this[unit] = arr
      this.$logger(`Course|updateSplits: ${unit}`, t)
    },
    updateFocus: function (type, focus) {
      if (type === 'segments') this.$refs.splitTable.clear()
      if (type === 'splits') this.$refs.segmentTable.clear()
      this.mapFocus = focus
      this.$refs.profile.focus(focus)
    },
    waypointClick: function (id) {
      this.tableTabIndex = 2
      this.$refs.waypointTable.selectWaypoint(id)
    },
    waypointShow: function (arr) {
      let wps = this.course.waypoints.filter(x => arr.includes(x._id))
      wps.forEach((x, i) => {
        wps[i].show = true
      })
      this.$refs.profile.forceWaypointsUpdate()
      this.$refs.map.forceUpdate()
    },
    waypointHide: function (arr) {
      let wps = this.course.waypoints.filter(x => arr.includes(x._id))
      wps.forEach((x, i) => {
        wps[i].show = false
      })
      this.$refs.profile.forceWaypointsUpdate()
      this.$refs.map.forceUpdate()
    },
    clearCache: function () {
      this.plans.forEach(p => {
        p.cache = null
      })
      this.$logger('Course|clearCache')
    },
    syncCache: function (obj) {
      // makes the waypoints in the cached data the same objects as waypoints
      if (!Array.isArray(obj)) { obj = [obj] }
      obj.forEach(x => {
        if (x.cache) {
          x.cache.segments.forEach(s => {
            s.waypoint1 = this.course.waypoints.find(
              wp => wp._id === s.waypoint1._id
            )
            s.waypoint2 = this.course.waypoints.find(
              wp => wp._id === s.waypoint2._id
            )
          })
        }
      })
    },
    useCache: function () {
      let type = (this.planAssigned) ? 'plan' : 'course'
      // if cache data is stored, assign it
      let cacheFields = ['pacing', 'segments', 'miles', 'kilometers']
      if (
        this[type].cache &&
        this[type].cache.pacing.hasOwnProperty('scales')) {
        this.$logger(`Course|useCache: using cached ${type} data`)
        cacheFields.forEach(f => {
          this[f] = this[type].cache[f]
        })
        return true
      } else {
        this.$logger(`Course|useCache: no cached ${type} data`)
        return false
      }
    },
    setUpdateFlag: function () {
      this.updateFlag = true
    }
  },
  watch: {
    editing: function (val) {
      // update after disabling editing
      if (!val && this.updateFlag) {
        this.updatePacing()
      }
    },
    tableTabIndex: function (val) {
      // if editing and navigating away from waypoint table, recalc
      if (this.updateFlag && this.tableTabIndex !== 2) {
        this.updatePacing()
      }
    },
    updateFlag: function (val) {
      // when update flag transitions to true, clear cached data
      if (val) {
        this.clearCache()
      }
    }
  }
}
</script>
