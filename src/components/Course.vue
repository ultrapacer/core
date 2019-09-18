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
                  v-model="plan"
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
            <b-btn variant="success" @click.prevent="newPlan()" size="sm"
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
    </b-row>
    <div v-if="initializing" class="d-flex justify-content-center mb-3">
      <b-spinner label="Loading..." ></b-spinner>
    </div>
    <b-row v-if="!initializing">
      <b-col order="2">
        <b-tabs v-model="tableTabIndex" content-class="mt-3" small>
          <b-tab title="Segments" active>
            <segment-table
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
          </b-tab>
          <b-tab title="Splits">
            <segment-table
                ref="splitTable"
                :course="course"
                :segments="splits"
                :units="units"
                :pacing="pacing"
                :busy="busy"
                :mode="'splits'"
                @select="updateFocus"
              ></segment-table>
          </b-tab>
          <b-tab title="Waypoints">
            <waypoint-table
                ref="waypointTable"
                :course="course"
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
          <b-tab v-if="plan" title="Plan">
            <plan-details
                :course="course"
                :plan="plan"
                :pacing="pacing"
                :units="units"
                :busy="busy"
              ></plan-details>
          </b-tab>
        </b-tabs>
      </b-col>
      <b-col lg="5" order="1">
        <div v-if="!initializing" class="sticky-top mt-3">
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
        </div>
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
      @setUpdateFlag="setUpdateFlag"
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
      plans: [],
      segments: [],
      miles: [],
      kilometers: [],
      waypoint: {},
      pacing: {},
      mapFocus: [],
      showMap: false,
      tableTabIndex: 0,
      updateFlag: false
    }
  },
  computed: {
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
    planOwner: function () {
      if (
        this.isAuthenticated &&
        this.plan &&
        String(this.user._id) === String(this.plan._user)
      ) {
        return true
      } else {
        return false
      }
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
      if (!this.plan) { return [] }
      let wps = this.course.waypoints
      let wpdelay = (this.plan) ? this.plan.waypointDelay : 0
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
  async created () {
    if (screen.width < 992) {
      this.$bvToast.toast('Page not optimized for small/mobile screens', {
        title: 'Warning',
        toaster: 'b-toaster-bottom-center',
        solid: true,
        variant: 'warning',
        'auto-hide-delay': 4000
      })
    }
    this.$calculating.setCalculating(true)
    let t = this.$logger()
    try {
      if (this.$route.params.plan) {
        this.course = await api.getCourse(this.$route.params.plan, 'plan')
      } else {
        this.course = await api.getCourse(this.$route.params.course)
      }
      this.plans = this.course.plans
      this.syncCache()
      if (this.$route.params.plan) {
        this.plan = this.plans.find(
          x => x._id === this.$route.params.plan
        )
      }
    } catch (err) {
      console.log(err)
      this.$router.push({path: '/'})
      return
    }
    this.$logger(`Course: downloaded course (${this.course.points.length} points)`, t)

    this.$title = this.course.name
    t = this.$logger()
    util.addLoc(this.course.points)
    t = this.$logger('Added locations')
    let pmax = util.round(Math.min(7500, this.course.points[this.course.points.length - 1].loc / 0.025), 0)
    if (this.course.points.length > pmax) {
      let t = this.$logger()
      let stats = util.calcStats(this.course.points)
      let len = this.course.points[this.course.points.length - 1].loc
      let xs = Array(pmax).fill(0).map((e, i) => i++ * len / (pmax - 1))
      let adj = util.pointWLSQ(
        this.course.points,
        xs,
        0.05
      )
      let p2 = []
      let llas = util.getLatLonAltFromDistance(this.course.points, xs, 0)
      xs.forEach((x, i) => {
        p2.push({
          alt: adj[i].alt,
          lat: llas[i].lat,
          lon: llas[i].lon,
          loc: x,
          grade: adj[i].grade,
          dloc: (i === 0) ? 0 : xs[i] - xs[i - 1]
        })
      })
      let stats2 = util.calcStats(p2)
      this.course.scales = {
        gain: stats.gain / stats2.gain,
        loss: stats.loss / stats2.loss,
        grade: (stats.gain - stats.loss) / (stats2.gain - stats2.loss)
      }
      p2.forEach((x, i) => {
        p2[i].grade = p2[i].grade * this.course.scales.grade
      })
      this.course.points = p2
      this.$logger(`Scaled course to ${pmax} points`, t)
    }
    this.course.len = this.course.points[this.course.points.length - 1].loc
    this.checkWaypoints()
    if (!this.useCache()) {
      await this.updatePacing()
    }
    this.initializing = false
    setTimeout(() => {
      this.showMap = true
      if (this.$route.query.method) {
        this[this.$route.query.method]()
        this.$router.push({query: {}})
      }
    }, 500)
    this.busy = false
    this.$calculating.setCalculating(false)
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
      this.setUpdateFlag()
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
        if (this.plan) {
          let p = this.plan
          this.$refs.planEdit.show({
            heatModel: p.heatModel ? {...p.heatModel} : null,
            startTime: p.startTime || null,
            pacingMethod: p.pacingMethod,
            waypointDelay: p.waypointDelay,
            drift: p.drift
          })
        } else {
          this.$refs.planEdit.show()
        }
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
      this.$refs.planEdit.show(this.plan)
    },
    async deletePlan (plan, cb) {
      this.$refs.delModal.show(
        'Plan',
        plan,
        async () => {
          await api.deletePlan(plan._id)
          this.plans = await api.getPlans(this.course._id, this.user._id)
          if (this.plan._id === plan._id) {
            if (this.plans.length) {
              this.plan = this.plans[0]
              await this.calcPlan()
            } else {
              this.plan = {}
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
      this.plans = await api.getPlans(this.course._id, this.user._id)
      this.syncCache()
      for (var i = 0, il = this.plans.length; i < il; i++) {
        if (this.plans[i]._id === plan._id) {
          this.plan = this.plans[i]
        }
      }
      delete this.plan.cache
      await this.calcPlan()
      if (typeof callback === 'function') callback()
    },
    async calcPlan () {
      if (!this.plan) { return }
      this.$router.push({
        name: 'Plan',
        params: {
          'plan': this.plan._id
        }
      })
      if (this.owner) {
        api.selectCoursePlan(this.course._id, {plan: this.plan._id})
      }
      if (!this.useCache()) {
        this.busy = true
        this.$calculating.setCalculating(true)
        setTimeout(() => { this.updatePacing() }, 10)
      }
    },
    async clearPlan () {
      // deselect the current plan
      if (!this.plan) { return }
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
      // update splits, segments, and pacing
      this.busy = true
      this.updateFlag = false
      this.$calculating.setCalculating(true)
      await this.iteratePaceCalc()
      this.updateSplits()
      // if factors are time-based (eg heat), iterate solution:
      if (this.plan && this.plan.heatModel && this.plan.startTime) {
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
      }
      this.updateSplits('miles')
      this.updateSegments()
      let cacheFields = ['pacing', 'segments', 'miles', 'kilometers']
      if (this.plan && this.plan._id) {
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
        console.log(this.owner)
        if (this.owner) {
          this.$logger('Course|updatePacing: saving course cache')
          api.updateCourseCache(
            this.course._id,
            { cache: this.course.cache }
          )
        }
      }
      this.busy = false
      this.$calculating.setCalculating(false)
    },
    async iteratePaceCalc () {
      let t = this.$logger()
      var plan = false
      if (this.plan && this.plan.name) { plan = true }

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
          hF: (plan && p[1].tod) ? nF.hF([p[j - 1].tod, p[j].tod], this.plan.heatModel) : 1,
          dF: nF.dF(
            [p[j - 1].loc, p[j].loc],
            plan ? this.plan.drift : 0,
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
        if (this.plan.pacingMethod === 'time') {
          time = this.plan.pacingTarget
          pace = (time - delay) / this.course.len
          np = pace / this.course.norm
        } else if (this.plan.pacingMethod === 'pace') {
          pace = this.plan.pacingTarget
          time = pace * this.course.len + delay
          np = pace / this.course.norm
        } else if (this.plan.pacingMethod === 'np') {
          np = this.plan.pacingTarget
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
        drift: plan ? this.plan.drift : 0,
        altModel: this.course.altModel,
        heatModel: plan ? this.plan.heatModel : null,
        tFs: this.terrainFactors,
        delays: this.delays
      }

      // Add time to points
      if (plan) {
        let breaks = this.course.points.map(x => x.loc)
        p[0].time = 0
        let arr = util.calcSegments(p, breaks, this.pacing)
        arr.forEach((x, i) => {
          p[i + 1].time = x.elapsed
        })
        if (this.plan.startTime !== null) {
          p.forEach((x, i) => {
            // tod: time of day in seconds from local midnight
            p[i].tod = (x.time + this.plan.startTime) % 86400
          })
        } else {
          p.forEach((x, i) => {
            delete p[i].tod
          })
        }
      } else {
        p.forEach((x, i) => {
          delete p[i].time
          delete p[i].tod
        })
      }
      this.$logger('iteratePaceCalc', t)
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
      let arr = util.calcSegments(this.course.points, breaks, this.pacing)
      arr.forEach((x, i) => {
        arr[i].waypoint1 = wps[i]
        arr[i].waypoint2 = wps[i + 1]
        if (this.plan && this.plan.startTime !== null) {
          arr[i].tod = (x.elapsed + this.plan.startTime)
        }
      })
      this.segments = arr
      this.$logger('Course|updateSegments', t)
    },
    updateSplits: function (unit = 'kilometers') {
      let t = this.$logger()
      // eslint-disable-next-line
      this.updateTrigger // hack for force recompute
      let distScale = (unit === 'kilometers') ? 0.621371 : 1
      let p = this.course.points
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
      let arr = util.calcSegments(p, breaks, this.pacing)
      if (this.plan && this.plan.startTime !== null) {
        arr.forEach((x, i) => {
          arr[i].tod = (x.elapsed + this.plan.startTime)
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
    syncCache: function () {
      // makes the waypoints in the cached data the same objects as waypoints
      this.plans.forEach(p => {
        if (p.cache) {
          p.cache.segments.forEach(s => {
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
    useCache: function (cache) {
      // if cache data is stored, assign it
      let cacheFields = ['pacing', 'segments', 'miles', 'kilometers']
      if (this.plan && this.plan._id) {
        if (this.plan.cache) {
          this.$logger('Course|useCache: using cached plan data')
          cacheFields.forEach(f => {
            this[f] = this.plan.cache[f]
          })
          return true
        } else {
          this.$logger('Course|useCache: no cached plan data')
          return false
        }
      } else if (this.course.cache) {
        this.$logger('Course|useCache: using cached course data')
        cacheFields.forEach(f => {
          this[f] = this.course.cache[f]
        })
        return true
      } else {
        this.$logger('Course|useCache: no cached course data')
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
