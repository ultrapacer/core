<template>
  <div class="container-fluid mt-4">
    <b-row>
      <b-col
        class="d-none d-md-block"
        md="12"
        lg="6"
      >
        <h2
          class="h2"
          style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"
        >
          {{ course.name }}
        </h2>
      </b-col>
      <b-col
        v-if="!initializing"
        cols="12"
        lg="6"
        data-nosnippet
      >
        <b-row no-gutters>
          <b-col
            v-if="plansSelect.length"
            cols="7"
            sm="9"
            md="7"
            style="text-align:right"
          >
            <b-form-group
              label-size="sm"
              label="Plan"
              label-cols="3"
              label-cols-lg="2"
            >
              <b-form-select
                v-model="plan"
                type="number"
                :options="plansSelect"
                size="sm"
                @change="calcPlan"
              />
            </b-form-group>
          </b-col>
          <b-col
            :cols="plansSelect.length ? '3': '10'"
            :sm="plansSelect.length ? '2': '11'"
            :md="plansSelect.length ? '2': '9'"
            class="pl-2"
          >
            <b-button
              v-if="plansSelect.length && planOwner"
              v-b-popover.hover.blur.bottomright.d250.v-info="
                'Edit the selected pacing plan.'
              "

              size="sm"
              @click="editPlan()"
            >
              <v-icon name="edit" />
            </b-button>
            <b-button
              v-b-popover.hover.blur.bottomright.d250.v-info="
                'Create a new pacing plan for this course.'
              "
              variant="success"
              size="sm"
              class="mr-n2"
              @click.prevent="newPlan()"
            >
              <v-icon name="plus" />
              <span v-if="!plansSelect.length">New Pacing Plan</span>
            </b-button>
          </b-col>
          <b-col
            cols="2"
            sm="1"
            md="3"
            style="text-align:right"
          >
            <b-button
              id="menu-button"
              variant="primary"
              class="mr-1"
              size="sm"
              @click="showMenu = !showMenu"
            >
              <v-icon name="caret-square-down" />
              <span class="d-none d-md-inline">
                Options
              </span>
            </b-button>
            <b-popover
              :show.sync="showMenu"
              target="menu-button"
              title="More options"
              placement="bottomleft"
              :triggers="['click','blur']"
              variant="primary"
            >
              <b-button-group vertical>
                <b-button
                  v-if="owner"
                  variant="outline-primary"
                  @click="editCourse()"
                >
                  <v-icon name="edit" />
                  Modify Course
                </b-button>
                <b-button
                  variant="outline-primary"
                  @click="download()"
                >
                  <v-icon name="download" />
                  Download GPX/TCX Files
                </b-button>
                <b-button
                  v-if="planAssigned"
                  variant="outline-primary"
                  @click="loadCompare()"
                >
                  <v-icon name="running" />
                  Compare to Activity (Beta)
                </b-button>
              </b-button-group>
            </b-popover>
          </b-col>
        </b-row>
      </b-col>
    </b-row>
    <div
      v-if="initializing"
      class="d-flex justify-content-center mb-3"
      data-nosnippet
    >
      <span v-if="course.description">
        {{ course.description }}
      </span>
      <span v-else-if="course.name">
        The {{ course.name }} course covers <b>{{ $units.distf(course.distance, 1) }} {{ $units.dist }}</b> with <b>{{ $units.altf(course.gain, 0) | commas }} {{ $units.alt }}</b> of climbing.
      </span>
    </div>
    <b-row
      v-if="!initializing"
      data-nosnippet
    >
      <b-col
        order="2"
        lg="6"
        xl="7"
      >
        <b-tabs
          ref="tables"
          v-model="tableTabIndex"
          content-class="mt-1"
          small
        >
          <b-tab
            title="Segments"
            active
          >
            <segment-table
              v-if="segments.length"
              ref="segmentTable"
              :course="course"
              :segments="segments"
              :pacing="pacing"
              :busy="busy"
              :mode="'segments'"
              :show-actual="comparing"
              :table-height="tableHeight"
              :visible="tableTabIndex===0"
              @select="updateFocus"
              @show="waypointShow"
              @hide="waypointHide"
            />
          </b-tab>
          <b-tab title="Splits">
            <segment-table
              v-if="splits.length"
              ref="splitTable"
              :course="course"
              :segments="splits"
              :pacing="pacing"
              :busy="busy"
              :mode="'splits'"
              :show-actual="comparing"
              :table-height="tableHeight"
              :visible="tableTabIndex===1"
              @select="updateFocus"
            />
          </b-tab>
          <b-tab title="Waypoints">
            <waypoint-table
              ref="waypointTable"
              :course="course"
              :editing="editing"
              :edit-fn="editWaypoint"
              :del-fn="deleteWaypoint"
              :table-height="tableHeight ? tableHeight - (owner ? 42 : 0) : 0"
              @updateWaypointLocation="updateWaypointLocation"
            />
            <b-row
              v-if="owner"
              class="m-1"
            >
              <div style="flex: 1 1 auto">
                <b-button
                  v-if="editing"
                  variant="success"
                  @click.prevent="newWaypoint()"
                >
                  <v-icon name="plus" /><span>New Waypoint</span>
                </b-button>
              </div>
              <b-button
                :variant="editing ? 'outline-primary' : 'secondary'"
                @click.prevent="editing=!editing"
              >
                <v-icon :name="editing ? 'edit' : 'lock'" />
                <span>editing: {{ editing ? 'on' : 'off' }}</span>
              </b-button>
            </b-row>
          </b-tab>
          <b-tab
            v-if="pacing.factors"
            title="Details"
            :style="tableHeight ? {maxHeight: tableHeight + 'px', overflowY: 'auto'} : {}"
          >
            <plan-details
              :course="course"
              :points="points"
              :kilometers="kilometers"
              :event="event"
              :plan="plan"
              :pacing="pacing"
              :busy="busy"
              :visible="tableTabIndex===3"
            />
          </b-tab>
        </b-tabs>
      </b-col>
      <b-col
        v-if="points.length"
        lg="6"
        xl="5"
        order="1"
        class="chart-map-container"
      >
        <course-profile
          v-if="points.length"
          ref="profile"
          :course="course"
          :waypoints="course.waypoints.filter(wp=>waypointShowMode(wp))"
          :points="points"
          :sun-events="pacing.sunEventsByLoc"
          :show-actual="comparing"
          :focus="focus"
          @waypointClick="waypointClick"
        />
        <course-map
          v-if="points.length"
          ref="map"
          :course="course"
          :waypoints="course.waypoints.filter(wp=>waypointShowMode(wp))"
          :points="points"
          :focus="focus"
        />
      </b-col>
    </b-row>
    <course-edit
      ref="courseEdit"
      @refresh="reloadCourse"
      @delete="deleteCourse"
    />
    <plan-edit
      ref="planEdit"
      :course="course"
      :event="event"
      @refresh="refreshPlans"
      @delete="deletePlan"
    />
    <waypoint-edit
      v-if="editing"
      ref="wpEdit"
      :course="course"
      :points="points"
      :terrain-factors="terrainFactors"
      @refresh="refreshWaypoints"
      @delete="deleteWaypoint"
      @setUpdateFlag="setUpdateFlag"
    />
    <delete-modal
      ref="delModal"
    />
    <download-track
      ref="download"
      :course="course"
      :plan="plan"
      :event="event"
      :points="points"
      :segments="segments"
      :update-fn="updatePacing"
    />
    <course-compare
      ref="courseCompare"
      :comparing="comparing"
      @stop="stopCompare"
    />
    <vue-headful
      v-if="course.name"
      :description="description"
      :title="title"
    />
    <b-toast
      ref="toast-welcome"
      title="Welcome to ultraPacer!"
      toaster="b-toaster-bottom-right"
      solid
      variant="info"
      auto-hide-delay="10000"
    >
      ultraPacer is a web app for creating courses and pacing plans for ultramarathons and trail adventures that factor in grade, terrain, altitude, heat, nighttime, and fatigue. To create a pace plan for this course, select the "New Pacing Plan" button on the top right. Happy running!
    </b-toast>
    <b-toast
      ref="toast-small-screen"
      title="Small/mobile screen"
      toaster="b-toaster-bottom-center"
      solid
      variant="info"
      auto-hide-delay="6000"
    >
      Much of the data on this page is hidden on small screens. Select rows in tables to expand. Use a desktop or tablet for a better experience.
    </b-toast>
  </div>
</template>

<script>
import api from '@/api'
import geo from '@/util/geo'
import { string2sec } from '../util/time'
import wputil from '../util/waypoints'
import CourseEdit from './CourseEdit'
import CourseCompare from './CourseCompare'
import DeleteModal from './DeleteModal'
import DownloadTrack from './DownloadTrack'
import SegmentTable from './SegmentTable'
import WaypointTable from './WaypointTable'
import PlanDetails from './PlanDetails'
import PlanEdit from './PlanEdit'
import WaypointEdit from './WaypointEdit'
import SunCalc from 'suncalc'
import moment from 'moment-timezone'
const JSURL = require('@yaska-eu/jsurl2')

export default {
  title: 'Course',
  components: {
    CourseEdit,
    CourseCompare,
    CourseMap: () => import(/* webpackPrefetch: true */ './CourseMap.vue'),
    CourseProfile: () => import(/* webpackPrefetch: true */ './CourseProfile.vue'),
    DeleteModal,
    DownloadTrack,
    SegmentTable,
    WaypointTable,
    PlanDetails,
    PlanEdit,
    WaypointEdit
  },
  filters: {
    commas (val) {
      return val.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    }
  },
  data () {
    return {
      initializing: true,
      busy: true,
      editing: false,
      saving: false,
      comparing: false,
      course: {},
      plan: {},
      plans: [],
      points: [],
      segments: [],
      miles: [],
      kilometers: [],
      scales: {},
      waypoint: {},
      pacing: {},
      focus: [],
      tableTabIndex: 0,
      updateFlag: false,
      visibleWaypoints: [],
      showMenu: false,
      updatingWaypointTimeout: null,
      updatingWaypointTimeoutID: null
    }
  },
  computed: {
    tableHeight: function () {
      if (this.$window.width < 992) return 0
      return (this.$window.height - 173)
    },
    description: function () {
      if (this.course.description) {
        return this.course.description
      } else {
        return `The ${this.$title} course covers ${this.$units.distf(this.course.distance, 1)} ${this.$units.dist} with ${this.$units.altf(this.course.gain, 0)} ${this.$units.alt} of climbing. Ready?`
      }
    },
    title: function () {
      return this.$title + ' - ultraPacer'
    },
    event: function () {
      const t = this.$logger()
      const e = {
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
      const m = moment(e.start).tz(e.timezone)
      e.timeString = m.format('kk:mm')
      e.startTime = string2sec(`${e.timeString}:00`)
      if (this.points.length) {
        const times = SunCalc.getTimes(
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
      const hM = { ...this.plan.heatModel }
      hM.start = this.event.sun.rise + 1800
      hM.stop = this.event.sun.set + 3600
      return hM
    },
    plansSelect: function () {
      const p = []
      for (let i = 0, il = this.plans.length; i < il; i++) {
        p.push({
          value: this.plans[i],
          text: this.plans[i].name
        })
      }
      return p
    },
    owner: function () {
      return (
        this.$user.isAuthenticated &&
        String(this.$user._id) === String(this.course._user)
      )
    },
    planAssigned: function () {
      return Boolean(Object.entries(this.plan).length)
    },
    planOwner: function () {
      return this.planAssigned && (
        (
          this.plan._id &&
          this.$user.isAuthenticated &&
          String(this.$user._id) === String(this.plan._user)
        ) ||
        !this.plan._id
      )
    },
    splits: function () {
      if (this.$units.dist === 'km') {
        return this.kilometers
      } else {
        return this.miles
      }
    },
    terrainFactors: function () {
      const l = this.$logger()
      if (!this.course.waypoints) { return [] }
      if (!this.course.waypoints.length) { return [] }
      const wps = this.course.waypoints
      let tF = wps[0].terrainFactor
      const tFs = wps.filter((x, i) => i < wps.length - 1).map((x, i) => {
        if (x.terrainFactor !== null) { tF = x.terrainFactor }
        return {
          start: x.location,
          end: wps[i + 1].location,
          tF: tF
        }
      })
      this.$logger('terrainFactors', l)
      return tFs
    },
    delays: function () {
      const t = this.$logger()
      if (!this.course.waypoints) { return [] }
      if (!this.course.waypoints.length) { return [] }
      if (!this.planAssigned) { return [] }
      const wps = this.course.waypoints
      const wpdelay = (this.planAssigned) ? this.plan.waypointDelay : 0
      const d = []
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
      this.focus = []
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
  },
  async created () {
    this.initialize()
  },
  methods: {
    async initialize () {
      this.initializing = true
      this.$status.processing = true
      this.$status.loading = true
      let t = this.$logger()
      try {
        await this.$auth.getAccessToken()
      } catch (err) {}
      t = this.$logger('Course|initialize - auth initiated', t)
      try {
        if (this.$route.params.plan) {
          this.course = await api.getCourse(this.$route.params.plan, 'plan')
        } else if (this.$route.params.permalink) {
          this.course = await api.getCourseFields(
            this.$route.params.permalink,
            'link',
            ['name', 'distance', 'gain'],
            false
          )
          this.$title = this.course.name
          this.course = await api.getCourse(this.$route.params.permalink, 'link')
        } else {
          this.course = await api.getCourse(this.$route.params.course, 'course')
        }
        t = this.$logger('Course|api.getCourse', t)
        this.refreshVisibleWaypoints()
        await this.getPoints()
        this.$ga.event('Course', 'view', this.publicName)
        this.plans = this.course.plans
        this.syncCache(this.course)
        this.syncCache(this.plans)
        if (this.$route.params.plan) {
          this.plan = this.plans.find(
            x => x._id === this.$route.params.plan
          )
          this.$ga.event('Plan', 'view', this.publicName)
        }
      } catch (err) {
        console.log(err)
        this.$router.push({ path: '/' })
        return
      }
      this.$title = this.course.name
      this.useCache()
      this.initializing = false
      this.busy = false
      this.$status.processing = false
      setTimeout(() => {
        if (!this.$user.isAuthenticated) {
          this.$refs['toast-welcome'].show()
        } else if (screen.width < 992) {
          this.$refs['toast-small-screen'].show()
        }
      }, 1000)
      if (this.$route.query.plan) {
        const p = JSURL.tryParse(this.$route.query.plan, null)
        if (p) {
          this.$logger('Course|created: showing plan from URL')
          this.$refs.planEdit.show(p)
        }
      }
      this.$logger('Course|initialize', t)
    },
    async getPoints () {
      let t = this.$logger()
      const pnts = await api.getCourseField(
        this.course._id,
        'points'
      )
      t = this.$logger(`Course|getPoints: downloaded (${pnts.length} points)`, t)
      this.points = geo.arraysToObjects(pnts)
      geo.addLoc(this.points, this.course.distance)
      this.points = geo.cleanUp(this.points)
      geo.addGrades(this.points)
      const stats = geo.calcStats(this.points, false)
      this.scales = {
        gain: this.course.gain / stats.gain,
        loss: this.course.loss / stats.loss,
        grade: (this.course.gain - this.course.loss) / (stats.gain - stats.loss)
      }
      this.points.forEach((x, i) => {
        this.points[i].grade = this.points[i].grade * this.scales.grade
      })
      // refresh LLA's from course points:
      this.course.waypoints.forEach(wp => {
        wputil.updateLLA(wp, this.points)
      })
      if (!this.pacing.factors) {
        await this.updatePacing()
      }
      this.$logger('Course|getPoints: complete', t)
      this.$status.loading = false
    },
    async editCourse () {
      this.$refs.courseEdit.show(this.course)
    },
    async reloadCourse () {
      this.focus = []
      await this.initialize()
      await this.updatePacing()
    },
    async deleteCourse (course, cb) {
      this.$refs.delModal.show(
        {
          type: 'course',
          object: course,
          verb: 'delete'
        },
        async () => {
          await api.deleteCourse(course._id)
          this.$router.push({ name: 'CoursesManager' })
        },
        (err) => {
          if (typeof (cb) === 'function') {
            if (err) cb(err)
            else cb()
          }
        }
      )
    },
    async newWaypoint () {
      this.$refs.wpEdit.show({})
    },
    async editWaypoint (waypoint) {
      this.$refs.wpEdit.show(waypoint)
    },
    async deleteWaypoint (waypoint, cb) {
      this.$refs.delModal.show(
        {
          type: 'waypoint',
          object: waypoint
        },
        async () => {
          this.$ga.event('Waypoint', 'delete', this.publicName)
          // if we are editing a waypoint we deleted, remove it from the form
          if (this.waypoint._id === waypoint._id) {
            this.waypoint = {}
          }
          await api.deleteWaypoint(waypoint._id)
          const index = this.course.waypoints.findIndex(
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
    updateWaypointLocation (_id, loc) {
      const waypoint = this.course.waypoints.find(wp => wp._id === _id)
      waypoint.location = loc
      wputil.updateLLA(waypoint, this.points)
      wputil.sortWaypointsByDistance(this.course.waypoints)
      if (String(waypoint._id) === this.updatingWaypointTimeoutID) {
        clearTimeout(this.updatingWaypointTimeout)
      }
      this.updatingWaypointTimeoutID = String(waypoint._id)
      this.updatingWaypointTimeout = setTimeout(() => {
        api.updateWaypoint(waypoint._id, waypoint)
      }, 2000)
      this.setUpdateFlag()
    },
    async refreshWaypoints (callback) {
      this.course.waypoints = await api.getWaypoints(this.course._id)
      this.refreshVisibleWaypoints()
      this.setUpdateFlag()
      if (typeof callback === 'function') callback()
    },
    async refreshVisibleWaypoints () {
      this.visibleWaypoints = this.course.waypoints
        .filter(x => x.type === 'start' || x.tier === 1)
        .map(x => { return x._id })
    },
    waypointShowMode (wp) {
      if (this.editing && this.tableTabIndex === 2) {
        return true
      } else if (this.tableTabIndex === 2) {
        return wp.tier <= 2
      } else {
        return this.visibleWaypoints.includes(wp._id)
      }
    },
    async newPlan () {
      this.$ga.event('Plan', 'add', this.publicName)
      if (this.planAssigned) {
        const p = this.plan
        this.$refs.planEdit.show({
          heatModel: p.heatModel ? { ...p.heatModel } : null,
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
        {
          type: 'plan',
          object: plan
        },
        async () => {
          await api.deletePlan(plan._id)
          this.$ga.event('Plan', 'delete', this.publicName)
          this.plans = await api.getPlans(this.course._id, this.$user._id)
          if (this.plan._id === plan._id) {
            if (this.plans.length) {
              this.plan = this.plans[0]
              await this.calcPlan()
            } else {
              this.clearPlan()
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
        this.plans = await api.getPlans(this.course._id, this.$user._id)
        this.syncCache(this.plans)
        this.plan = this.plans.find(p => p._id === plan._id)
      } else {
        this.plan = { ...plan }
        this.plans = [this.plan]
      }
      delete this.plan.cache
      await this.calcPlan()
      if (typeof callback === 'function') callback()
    },
    async calcPlan () {
      const t = this.$logger()
      if (!this.planAssigned) { return }
      if (this.plan._id) {
        if (
          this.$router.currentRoute.name !== 'Plan' ||
          this.$router.currentRoute.params.plan !== this.plan._id
        ) {
          this.$router.push({
            name: 'Plan',
            params: {
              plan: this.plan._id
            }
          })
        }
        if (this.owner) {
          api.selectCoursePlan(this.course._id, { plan: this.plan._id })
        }
      } else {
        const route = {
          name: 'Course',
          params: {
            course: this.course._id
          },
          query: {
            plan: JSURL.stringify(this.plan)
          }
        }
        if (this.course.link) {
          route.name = 'Race'
          route.params.permalink = this.course.link
        }
        this.$router.push(route)
      }
      this.$ga.event('Plan', 'view', this.publicName)
      if (!this.useCache()) {
        this.busy = true
        this.$status.processing = true
        setTimeout(() => { this.updatePacing() }, 10)
      } else {
        if (this.points[0].actual !== undefined) {
          await this.updatePacing()
        }
        this.$refs.profile.update()
      }
      this.$logger('Course|calcPlan', t)
    },
    async clearPlan () {
      // deselect the current plan
      if (!this.planAssigned) { return }
      this.plan = {}
      this.pacing = {}
      const route = {
        name: 'Course',
        params: {
          course: this.course._id
        }
      }
      if (this.course.link) {
        route.name = 'Race'
        route.params.permalink = this.course.link
      }
      this.$router.push(route)
      if (!this.useCache()) {
        this.busy = true
        this.$status.processing = true
        setTimeout(() => { this.updatePacing() }, 10)
      } else {
        this.$refs.profile.update()
      }
      this.$logger('Course|clearPlan')
    },
    async updatePacing () {
      const t = this.$logger()
      // update splits, segments, and pacing
      this.busy = true
      this.updateFlag = false
      this.$status.processing = true
      const result = geo.calcPacing({
        course: this.course,
        plan: this.plan,
        points: this.points,
        pacing: this.pacing,
        event: this.event,
        delays: this.delays,
        heatModel: this.heatModel,
        scales: this.scales,
        terrainFactors: this.terrainFactors
      })
      this.points = result.points
      this.pacing = result.pacing

      // update splits and segments
      this.kilometers = geo.calcSplits({
        points: this.points,
        pacing: this.pacing,
        event: this.event,
        unit: 'kilometers'
      })
      this.miles = geo.calcSplits({
        points: this.points,
        pacing: this.pacing,
        event: this.event,
        unit: 'miles'
      })
      this.updateSegments()

      // save cached data:
      if (this.$user.isAuthenticated) {
        const cacheFields = ['pacing', 'segments', 'miles', 'kilometers']
        if (this.planAssigned) {
          this.plan.cache = {}
          cacheFields.forEach(f => {
            this.plan.cache[f] = this[f]
          })
          if (this.planAssigned && this.planOwner) {
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
      this.$status.processing = false
      this.$logger('Course|updatePacing', t)
    },
    updateSegments: function () {
      const t = this.$logger()
      const breaks = []
      const wps = []
      this.course.waypoints.forEach(x => {
        if (x.tier < 3) {
          breaks.push(x.location)
          wps.push(x)
        }
      })
      const arr = geo.calcSegments(this.points, breaks, this.pacing)
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
    updateFocus: function (type, focus) {
      this.focus = focus
    },
    waypointClick: function (id) {
      this.tableTabIndex = 2
      this.$refs.waypointTable.selectWaypoint(id)
    },
    waypointShow: function (arr) {
      arr.forEach(_id => {
        if (!this.visibleWaypoints.includes(_id)) {
          this.visibleWaypoints.push(_id)
        }
      })
    },
    waypointHide: function (arr) {
      arr.forEach(_id => {
        const i = this.visibleWaypoints.findIndex(x => x === _id)
        if (i >= 0) {
          this.visibleWaypoints.splice(i, 1)
        }
      })
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
      const type = (this.planAssigned) ? 'plan' : 'course'
      // if cache data is stored, assign it
      const cacheFields = ['pacing', 'segments', 'miles', 'kilometers']
      if (
        this[type].cache &&
        this[type].cache.pacing.scales !== undefined &&
        this[type].cache.segments[0].factors.dark !== null // ignore caches before 2020-02-21
      ) {
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
    },
    async download () {
      await this.$refs.download.show()
    },
    async changeOwner (_user) {
      if (!this.$user.admin) { return }
      await api.updateCourse(this.course._id, { _user: _user })
    },
    async stopCompare (cb) {
      this.comparing = false
      if (typeof cb === 'function') cb()
    },
    async loadCompare () {
      this.$refs.courseCompare.show(
        async (actual) => {
          await new Promise(resolve => setTimeout(resolve, 100)) // sleep a bit
          if (this.points[0].elapsed === undefined) {
            await this.updatePacing()
          }
          this.$status.processing = true
          const res = await geo.addActuals(this.points, actual)
          if (res.match) {
            this.$ga.event('Course', 'compare', this.publicName, 1)
            this.comparing = true
            this.kilometers = geo.calcSplits({
              points: this.points,
              pacing: this.pacing,
              event: this.event,
              unit: 'kilometers'
            })
            this.miles = geo.calcSplits({
              points: this.points,
              pacing: this.pacing,
              event: this.event,
              unit: 'miles'
            })
            this.updateSegments()
          } else {
            this.$ga.event('Course', 'compare', this.publicName, 0)
            this.comparing = false
          }
          this.$status.processing = false
          return res
        }
      )
    }
  }
}
</script>
