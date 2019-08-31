<template>
  <div class="container-fluid mt-4">
    <b-row>
      <b-col class="d-none d-md-block">
        <h1 class="h1">{{ course.name }}</h1>
      </b-col>
      <b-col v-if="!initializing" style="text-align:right">
        <b-row v-if="plansSelect.length">
          <b-col v-if="plansSelect.length" >
            <b-form-group label-size="sm" label="Plan" label-cols="4"  label-cols-lg="2">
              <b-form-select
                  type="number"
                  v-model="course._plan"
                  :options="plansSelect"
                  @change="calcPlan"
                  size="sm"
                ></b-form-select>
            </b-form-group>
          </b-col>
          <b-col cols="4" md="4" lg="3" xl="3" style="text-align:left">
            <b-btn @click="editPlan()" class="mr-1" size="sm"  v-if="planOwner">
              <v-icon name="edit"></v-icon>
            </b-btn>
            <b-btn variant="success" @click.prevent="newPlan()" size="sm">
              <v-icon name="plus"></v-icon>
              <span v-if="!plansSelect.length" >New Plan</span>
            </b-btn>
          </b-col>
        </b-row>
        <b-row v-if="!plansSelect.length">
          <b-col>
            <b-btn variant="success" @click.prevent="newPlan()" size="sm">
              <v-icon name="plus"></v-icon>
              New Pacing Plan
            </b-btn>
          </b-col>
        </b-row>
      </b-col>
    </b-row>
    <div v-if="initializing" class="d-flex justify-content-center mb-3">
      <b-spinner label="Loading..." ></b-spinner>
    </div>
    <b-row v-if="!initializing">
      <b-col order="2">
        <b-tabs v-model="tableTabIndex" content-class="mt-3">
          <b-tab title="Segments" active>
            <segment-table
                ref="segmentTable"
                :course="course"
                :units="units"
                :pacing="pacing"
                :busy="busy"
                @select="updateFocus"
                @show="waypointShow"
                @hide="waypointHide"
              ></segment-table>
          </b-tab>
          <b-tab title="Splits">
            <split-table
                ref="splitTable"
                :course="course"
                :plan="plan"
                :units="units"
                :pacing="pacing"
                :busy="busy"
                @select="updateFocus"
              ></split-table>
          </b-tab>
          <b-tab title="Waypoints">
            <waypoint-table
                ref="waypointTable"
                :course="course"
                :units="units"
                :editing="editing"
                :editFn="editWaypoint"
                :delFn="deleteWaypoint"
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
        </b-tabs>
      </b-col>
      <b-col lg="5" order="1">
        <b-tabs content-class="mt-3" v-if="!initializing" class="sticky-top mt-3">
          <b-tab title="Course">
            <div v-if="showMap">
              <course-profile
                  ref="profile"
                  :course="course"
                  :units="units"
                  :waypointShowMode="waypointShowMode"
                  @waypointClick="waypointClick"
                ></course-profile>
              <course-map
                  ref="map"
                  v-if="showMap"
                  :course="course"
                  :focus="mapFocus"
                  :units="units"
                  :waypointShowMode="waypointShowMode"
                ></course-map>
            </div>
          </b-tab>
          <b-tab v-if="course._plan && course._plan.name" title="Plan">
            <plan-details
                :course="course"
                :plan="course._plan"
                :pacing="pacing"
                :units="units"
              ></plan-details>
          </b-tab>
        </b-tabs>
      </b-col>
    </b-row>
    <plan-edit
      v-if="isAuthenticated"
      ref="planEdit"
      :course="course"
      :units="units"
      @refresh="refreshPlans"
      @delete="deletePlan"
    ></plan-edit>
    <waypoint-edit
      v-if="editing"
      ref="wpEdit"
      :course="course"
      :units="units"
      :terrainFactors="terrainFactors"
      @refresh="refreshWaypoints"
      @delete="deleteWaypoint"
    ></waypoint-edit>
    <delete-modal
      ref="delModal"
    ></delete-modal>
  </div>
</template>

<script>
import api from '@/api'
import util from '../../shared/utilities'
import nF from '../../shared/normFactor'
import CourseMap from './CourseMap'
import CourseProfile from './CourseProfile'
import DeleteModal from './DeleteModal'
import SplitTable from './SplitTable'
import SegmentTable from './SegmentTable'
import WaypointTable from './WaypointTable'
import PlanDetails from './PlanDetails'
import PlanEdit from './PlanEdit'
import WaypointEdit from './WaypointEdit'

export default {
  title: 'Loading',
  props: ['isAuthenticated', 'user'],
  components: {
    CourseMap,
    CourseProfile,
    DeleteModal,
    SplitTable,
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
      plan: {},
      segment: {},
      segmentDisplayTier: 1,
      waypoint: {},
      pacing: {},
      mapFocus: [],
      showMap: false,
      tableTabIndex: 0
    }
  },
  computed: {
    plansSelect: function () {
      var p = []
      for (var i = 0, il = this.course.plans.length; i < il; i++) {
        p.push({
          value: this.course.plans[i],
          text: this.course.plans[i].name
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
    planOwner: function () {
      if (
        this.isAuthenticated &&
        this.course._plan &&
        String(this.user._id) === String(this.course._plan._user)
      ) {
        return true
      } else {
        return false
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
      if (!this.course._plan) { return [] }
      let wps = this.course.waypoints
      let wpdelay = (this.course._plan) ? this.course._plan.waypointDelay : 0
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
  filters: {
    formatDist (val, distScale) {
      return (val * distScale).toFixed(2)
    },
    formatAlt (val, altScale) {
      return (val * altScale).toFixed(0)
    }
  },
  async created () {
    let t = this.$logger('Downloading Course')
    try {
      if (this.$route.params.plan) {
        this.course = await api.getCourse(this.$route.params.plan, 'plan')
        this.course._plan = this.course.plans.find(
          x => x._id === this.course._plan
        )
      } else {
        this.course = await api.getCourse(this.$route.params.course)
      }
    } catch (err) {
      console.log(err)
      this.$router.push({path: '/'})
      return
    }
    this.$logger('Complete', t)
    this.$title = this.course.name
    t = this.$logger('Adding locations')
    util.addLoc(this.course.points)
    this.$logger('Complete', t)
    this.course.len = this.course.points[this.course.points.length - 1].loc
    this.checkWaypoints()
    await this.updatePacing()
    this.initializing = false
    setTimeout(() => {
      this.showMap = true
      if (this.$route.query.method) {
        this[this.$route.query.method]()
        this.$router.push({query: {}})
      }
    }, 500)
    this.$logger('Finish')
  },
  methods: {
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
      this.checkWaypoints()
      await this.updatePacing()
      if (typeof callback === 'function') callback()
    },
    checkWaypoints () {
      let t = this.$logger()
      // function ensures start at 0, finish at length,
      // and all waypoints are within course
      let wps = this.course.waypoints
      let start = wps[wps.findIndex(x => x.type === 'start')]
      if (start.location !== 0) {
        console.log('Fixing waypoint: ' + start.name)
        start.location = 0
        api.updateWaypoint(start._id, start)
      }
      let max = (util.round(this.course.len * this.units.distScale, 2) - 0.01)
      max = max / this.units.distScale
      wps.filter(
        x =>
          x.type !== 'start' &&
          x.type !== 'finish' &&
          x.location > max
      ).forEach((x, i) => {
        console.log('Fixing waypoint: ' + x.name)
        wps[i].location = max
        api.updateWaypoint(wps[i]._id, wps[i])
      })
      let finish = wps[wps.findIndex(x => x.type === 'finish')]
      if (util.round(finish.location, 6) !== util.round(this.course.len, 6)) {
        console.log('Fixing waypoint: ' + finish.name)
        finish.location = this.course.len
        api.updateWaypoint(finish._id, finish)
      }
      wps.forEach((x, i) => {
        wps[i].show = x.type === 'start' || x.tier === 1
      })
      this.$logger('checkWaypoints', t)
    },
    async newPlan () {
      if (this.isAuthenticated) {
        if (!this.owner) {
          if (!this.user._courses.find(x => x === this.course._id)) {
            api.useCourse(this.course._id)
            this.user._courses.push(this.course._id)
          }
        }
        this.$refs.planEdit.show()
      } else {
        this.$auth.login({
          route: {
            name: 'Course',
            params: {
              'course': this.course._id
            },
            query: {
              method: 'newPlan'
            }
          }
        })
      }
    },
    async editPlan () {
      this.$refs.planEdit.show(this.course._plan)
    },
    async deletePlan (plan, cb) {
      this.$refs.delModal.show(
        'Plan',
        plan,
        async () => {
          await api.deletePlan(plan._id)
          this.course.plans = await api.getPlans(this.course._id, this.user._id)
          if (this.course._plan._id === plan._id) {
            if (this.course.plans.length) {
              this.course._plan = this.course.plans[0]
              await this.calcPlan()
            } else {
              this.course._plan = {}
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
      this.course.plans = await api.getPlans(this.course._id, this.user._id)
      for (var i = 0, il = this.course.plans.length; i < il; i++) {
        if (this.course.plans[i]._id === plan._id) {
          this.course._plan = this.course.plans[i]
        }
      }
      await this.calcPlan()
      if (typeof callback === 'function') callback()
    },
    async calcPlan () {
      if (!this.course._plan) { return }
      this.$router.push({
        name: 'Plan',
        params: {
          'plan': this.course._plan._id
        }
      })
      if (this.owner) {
        api.selectCoursePlan(this.course._id, {plan: this.course._plan._id})
      }
      this.busy = true
      setTimeout(() => { this.updatePacing() }, 10)
    },
    async updatePacing () {
      this.busy = true
      await this.iteratePaceCalc()
      if (this.course._plan && this.course._plan.heatModel && this.course._plan.startTime) {
        let t = this.$logger()
        let lnF = this.pacing.nF
        for (var i = 0; i < 10; i++) {
          await this.iteratePaceCalc()
          if (Math.abs(lnF - this.pacing.nF) < 0.0001) { break }
          lnF = this.pacing.nF
        }
        this.$logger(`iteratePaceCalc: ${i + 2} iterations`, t)
      }
      this.busy = false
    },
    async iteratePaceCalc () {
      let t = this.$logger()
      var plan = false
      if (this.course._plan && this.course._plan.name) { plan = true }

      // calculate course normalizing factor:
      var tot = 0
      var factors = {gF: 0, aF: 0, tF: 0, hF: 0, dF: 0}
      let fstats = {
        max: {gF: 0, aF: 0, tF: 0, hF: 0, dF: 0},
        min: {gF: 100, aF: 100, tF: 100, hF: 100, dF: 100}
      }
      var p = this.course.points
      for (let j = 1, jl = p.length; j < jl; j++) {
        // determine pacing factor for point
        let fs = {
          gF: nF.gF((p[j - 1].grade + p[j].grade) / 2),
          aF: nF.aF([p[j - 1].alt, p[j].alt], this.course.altModel),
          tF: nF.tF([p[j - 1].loc, p[j].loc], this.terrainFactors),
          hF: (plan && p[1].tod) ? nF.hF([p[j - 1].tod, p[j].tod], this.course._plan.heatModel) : 1,
          dF: nF.dF(
            [p[j - 1].loc, p[j].loc],
            plan ? this.course._plan.drift : 0,
            this.course.len
          )
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
      }
      Object.keys(factors).forEach(k => {
        factors[k] = factors[k] / this.course.len
      })
      this.course.norm = (tot / this.course.len)

      let delay = 0
      let time = 0
      let pace = 0
      let np = 0

      if (plan) {
        // calculate delay:
        this.delays.forEach((x, i) => {
          delay += x.delay
        })

        // calculate time, pace, and normalized pace:
        if (this.course._plan.pacingMethod === 'time') {
          time = this.course._plan.pacingTarget
          pace = (time - delay) / this.course.len
          np = pace / this.course.norm
        } else if (this.course._plan.pacingMethod === 'pace') {
          pace = this.course._plan.pacingTarget
          time = pace * this.course.len + delay
          np = pace / this.course.norm
        } else if (this.course._plan.pacingMethod === 'np') {
          np = this.course._plan.pacingTarget
          pace = np * this.course.norm
          time = pace * this.course.len + delay
        }
      }

      this.pacing = {
        time: time,
        delay: delay,
        factors: factors,
        fstats: fstats,
        moving: time - delay,
        pace: pace,
        nF: this.course.norm,
        np: np,
        drift: plan ? this.course._plan.drift : 0,
        altModel: this.course.altModel,
        heatModel: plan ? this.course._plan.heatModel : null,
        tFs: this.terrainFactors,
        delays: this.delays
      }

      // Add time to points
      if (plan) {
        let breaks = this.course.points.map(x => x.loc)
        p[0].time = 0
        p[0].tod = this.course._plan.startTime
        let arr = util.calcSegments(p, breaks, this.pacing)
        arr.forEach((x, i) => {
          p[i + 1].time = x.elapsed
          if (this.course._plan.startTime !== null) {
            // tod: time of day in seconds from local midnight
            p[i + 1].tod = x.elapsed + this.course._plan.startTime
          }
        })
      }
      this.$logger('iteratePaceCalc', t)
    },
    updateFocus: function (type, focus) {
      if (type === 'segment') this.$refs.splitTable.clear()
      if (type === 'split') this.$refs.segmentTable.clear()
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
      this.$refs.segmentTable.forceSegmentUpdate()
      this.$refs.profile.forceWaypointsUpdate()
      this.$refs.map.forceUpdate()
    },
    waypointHide: function (arr) {
      let wps = this.course.waypoints.filter(x => arr.includes(x._id))
      wps.forEach((x, i) => {
        wps[i].show = false
      })
      this.$refs.segmentTable.forceSegmentUpdate()
      this.$refs.profile.forceWaypointsUpdate()
      this.$refs.map.forceUpdate()
    }
  }
}
</script>
