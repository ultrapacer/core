<template>
  <div class="container-fluid mt-4">
    <b-row>
      <b-col
        class="d-none d-md-block"
        md="12"
        lg="6"
        xl="5"
      >
        <h3
          style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-align: center"
        >
          {{ course.name }}
        </h3>
      </b-col>
      <b-col
        v-if="!$status.loading"
        cols="12"
        lg="6"
        xl="7"
        data-nosnippet
      >
        <b-row no-gutters>
          <b-col
            cols="12"
            class="mb-1"
            style="align-items: flex-end; display: flex"
          >
            <!-- MODE SELECT --->
            <b-dropdown
              v-if="$course.mode !== 'edit' && views.filter(v=>!Boolean(v.disabled)).length>1"
              right
              variant="primary"
              class="mr-1"
            >
              <template #button-content>
                <v-icon :name="views.find(v=>v.view===$course.view).icon" />
                <span class="d-none d-sm-inline">{{ views.find(v=>v.view===$course.view).button }}</span>
              </template>
              <b-dropdown-item
                v-for="v in views.filter(v=>!Boolean(v.disabled))"
                :key="v.view"
                :variant="$course.view===v.view ? 'primary' : ''"
                @click="$course.view=v.view"
              >
                <span :style="$course.view===v.view ? 'font-weight:bold' : ''">
                  <v-icon :name="v.icon" />  {{ v.text }} View
                </span>
              </b-dropdown-item>
            </b-dropdown>

            <div
              style="flex-grow:1; display: flex; min-width: 0"
            >
              <div style="max-width: 100%; margin-left:auto">
                <!-- NEW PLAN BUTTON --->
                <b-button
                  v-if="$course.view==='plan' && $course.mode !=='edit' && !plans.length && !plansByOthers.length"
                  variant="primary"
                  class="mr-1"
                  @click.prevent="newPlan()"
                >
                  <v-icon name="plus" />  New Plan
                </b-button>

                <div
                  v-if="$course.view=='plan' && plan._id && planOwner"
                  class="btn-group"
                >
                  <b-button
                    v-if="$course.mode==='edit'"
                    class="mr-1"
                    variant="danger"
                    @click="updateCancel"
                  >
                    <v-icon name="times-circle" /> Cancel
                  </b-button>
                  <b-button
                    v-if="$course.mode==='edit' && (updates.count || saveButtonVisible)"
                    class="mr-1"
                    variant="success"
                    @click="updateBatch"
                  >
                    <v-icon name="save" /> Save
                  </b-button>
                  <b-button
                    v-else-if="$course.mode!=='edit' && tablesTab===0"
                    class="mr-1"
                    variant="warning"
                    @click="$course.mode='edit'"
                  >
                    <v-icon name="edit" /><span class="d-none d-sm-inline">Edit</span>
                  </b-button>
                </div>

                <!-- PLAN SELECT --->
                <course-plan-select
                  v-if="$course.view!=='edit'&& $course.mode !=='edit' && (plans.length || plansByOthers.length)"
                  :plan="plan"
                  :plans="plans"
                  :plans-by-others="plansByOthers"
                  class="mr-1"
                  @select="selectPlan"
                  @new="newPlan"
                />

                <!-- ACTIONS SELECT --->
                <b-dropdown
                  v-if="$course.mode !=='edit' "
                  right
                  variant="primary"
                  text="Actions"
                >
                  <b-dropdown-item
                    v-for="(action, i) in actions.filter(a=>!Boolean(a.disabled))"
                    :key="'action_'+i"
                    @click="action.click()"
                  >
                    <v-icon :name="action.icon" />  {{ action.text }}
                  </b-dropdown-item>
                </b-dropdown>
              </div>
            </div>
          </b-col>
        </b-row>
      </b-col>
    </b-row>
    <div
      v-if="$status.loading"
      class="d-flex justify-content-center mb-3"
      data-nosnippet
    >
      <span v-if="course.description">
        {{ course.description }}
      </span>
      <span v-else-if="course.name">
        The {{ course.name }} course covers <b>{{ $units.distf(course.scaledDist, 1) }} {{ $units.dist }}</b> with <b>{{ $units.altf(course.scaledGain, 0) | commas }} {{ $units.alt }}</b> of climbing.
      </span>
    </div>
    <b-row
      v-if="!$status.loading"
      data-nosnippet
    >
      <b-col
        order="2"
        :lg="$course.comparing ? 7 : 6"
        :xl="7"
      >
        <b-tabs
          ref="tables"
          v-model="tablesTab"
          content-class="mt-1"
        >
          <b-tab
            v-if="$course.view==='edit'"
            title="Waypoints"
          >
            <waypoint-table
              ref="waypointTable"
              active
              :event="event"
              :course="course"
              :waypoints="waypoints"
              :edit-fn="editWaypoint"
              :del-fn="deleteWaypoint"
              :table-height="printing==='Waypoints' ? 0 : tableHeight"
              :visible="tablesTab===0"
              :printing="printing==='Waypoints'"
              :class="printing==='Waypoints' ? 'pr-2' : ''"
              @newWaypoint="newWaypoint"
              @updateWaypointLocation="updateWaypointLocation"
              @addChange="update"
            />
          </b-tab>
          <b-tab
            v-else
            title="Plan"
          >
            <plan-table
              ref="planTable"
              active
              :event="event"
              :course="course"
              :waypoints="waypoints"
              :plan="plan"
              :segments="planAssigned && pacingSplitsReady ? plan.splits.segments : course.splits.segments"
              :table-height="printing==='Plan' ? 0 : tableHeight"
              :printing="printing==='Plan'"
              :class="printing==='Plan' ? 'pr-2' : ''"
              @change="update"
              @input="showSaveButton"
            />
          </b-tab>
          <b-tab
            title="Segments"
            :disabled="$course.mode === 'edit'"
          >
            <segment-table
              v-if="segments.length"
              ref="segmentTable"
              :event="event"
              :course="course"
              :segments="segments"
              :waypoints="waypoints"
              :plan="plan"
              :mode="'segments'"
              :table-height="printing==='Segments' ? 0 : tableHeight"
              :visible="tablesTab===1"
              :printing="printing==='Segments'"
              :class="printing==='Segments' ? 'pr-2' : ''"
              @select="updateFocus"
            />
          </b-tab>
          <b-tab
            title="Splits"
            :disabled="$course.mode === 'edit'"
          >
            <segment-table
              v-if="splits.length"
              ref="splitTable"
              :event="event"
              :course="course"
              :segments="splits"
              :waypoints="waypoints"
              :plan="plan"
              :mode="'splits'"
              :table-height="printing==='Splits' ? 0 : tableHeight"
              :class="printing==='Splits' ? 'pr-2' : ''"
              :visible="tablesTab===2"
              :printing="printing==='Splits'"
              @select="updateFocus"
            />
          </b-tab>
          <b-tab
            v-if="course.splits.kilometers"
            title="Details"
            :style="tableHeight ? {maxHeight: tableHeight + 'px', overflowY: 'auto'} : {}"
            :disabled="$course.mode === 'edit'"
          >
            <plan-details
              ref="planDetails"
              :course="course"
              :terrain-factors="terrainFactors"
              :event="event"
              :plan="plan"
              :visible="tablesTab===3"
            />
          </b-tab>
        </b-tabs>
      </b-col>
      <b-col
        v-if="pointsReady"
        :lg="$course.comparing ? 5 : 6"
        xl="5"
        order="1"
        class="chart-map-container"
      >
        <course-profile
          v-if="pointsReady"
          ref="profile"
          :printing="printing==='Profile'"
          :course="course"
          :waypoints="visibleWaypoints"
          :plan="plan"
          :focus="focus"
          @waypointClick="waypointClick"
          @setHighlightPoint="(p)=>{highlightPoint = p}"
        />
        <course-map
          v-if="pointsReady"
          ref="map"
          :course="course"
          :waypoints="visibleWaypoints"
          :focus="focus"
          :highlight-point="highlightPoint"
          @waypointClick="waypointClick"
        />
      </b-col>
    </b-row>
    <course-edit
      v-if="$course.owner"
      ref="courseEdit"
      @afterEdit="reloadCourse"
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
      v-if="$course.owner && $course.view==='edit'"
      ref="waypointEdit"
      :course="course"
      :waypoints="waypoints"
      :terrain-factors="terrainFactors"
      @refresh="refreshWaypoints"
      @delete="deleteWaypoint"
      @setUpdateFlag="setUpdateFlag"
    />
    <delete-modal
      ref="delModal"
    />
    <download-track
      v-if="pointsReady && course.splits"
      ref="download"
      :course="course"
      :plan="plan"
      :event="event"
      :segments="course.splits.segments"
      :update-fn="updatePacing"
    />
    <course-compare
      v-if="planAssigned"
      ref="courseCompare"
      @stop="stopCompare"
      @cancel="()=>{ if (!$course.comparing) { $course.view = 'plan'}}"
    />
    <course-share
      ref="courseShare"
      :course="course"
      :plan="plan"
      @setPublic="course.public=true"
    />
    <email-user
      v-if="$user.isAuthenticated && pointsReady"
      ref="emailOwner"
      :to-user-ids="course._users"
      type="course"
      :subject="course.name"
      :url="url"
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
  </div>
</template>

<script>
import api from '@/api'
import CourseShare from '../components/CourseShare'
import DeleteModal from '../components/DeleteModal'
import SegmentTable from '../components/SegmentTable'
import PlanTable from '../components/PlanTable'
import WaypointTable from '../components/WaypointTable'
import PlanDetails from '../components/PlanDetails'
import PlanEdit from '../components/PlanEdit'
import CoursePlanSelect from '../components/CoursePlanSelect'
import isbot from 'isbot'
import moment from 'moment-timezone'
const JSURL = require('@yaska-eu/jsurl2')
let html2pdf // will lazy load later

export default {
  title: 'Course',
  components: {
    CourseEdit: () => import(/* webpackPrefetch: true */ '../components/CourseEdit.vue'),
    CourseCompare: () => import(/* webpackPrefetch: true */ '../components/CourseCompare.vue'),
    CourseMap: () => import(/* webpackPrefetch: true */ '../components/CourseMap.vue'),
    CoursePlanSelect,
    CourseProfile: () => import(/* webpackPrefetch: true */ '../components/CourseProfile.vue'),
    CourseShare,
    DeleteModal,
    DownloadTrack: () => import(/* webpackPrefetch: true */ '../components/DownloadTrack.vue'),
    EmailUser: () => import(/* webpackPrefetch: true */ '../components/EmailUser.vue'),
    SegmentTable,
    WaypointTable,
    PlanTable,
    PlanDetails,
    PlanEdit,
    WaypointEdit: () => import(/* webpackPrefetch: true */ '../components/WaypointEdit.vue')
  },
  beforeRouteLeave (to, from, next) {
    this.logger.child({ method: 'beforeRouteLeave' }).verbose('run')
    const c = this.updates.count
    if (c) {
      return next(window.confirm(`${c} unsaved change${c > 1 ? 's' : ''}. Discard?`))
    }
    return next()
  },
  data () {
    return {
      saving: false,
      course: {},
      event: new this.$core.events.Event({}),
      logger: this.$log.child({ file: 'Course.vue' }),
      plan: {},
      plans: [],
      plansByOthers: [],
      printing: false,
      waypoint: {},
      focus: [],
      highlightPoint: null,
      tablesTab: 0,
      updateFlag: false,
      showMenu: false,
      saveButtonVisible: false,
      updates: { count: 0 },
      updatingWaypointTimeout: null,
      updatingWaypointTimeoutID: null,
      url: ''
    }
  },
  computed: {
    tableTabNames: function () {
      return [this.$course.view === 'edit' ? 'Waypoints' : 'Plan', 'Segments', 'Splits', 'Details']
    },
    actions: function () {
      return [
        {
          text: 'View/Modify Plans',
          disabled: this.$course.view !== 'edit',
          icon: 'clock',
          click: () => { this.$course.view = 'plan' }
        }, {
          text: 'Modify Plan',
          disabled: this.$course.view === 'edit' || !this.planAssigned || !this.planOwner,
          icon: 'edit',
          click: () => { this.editPlan() }
        }, {
          text: 'New Plan',
          disabled: this.$course.view === 'edit',
          icon: 'plus',
          click: () => { this.newPlan() }
        }, {
          text: 'Modify Course',
          disabled: !this.$course.owner,
          icon: 'edit',
          click: () => { this.editCourse() }
        }, {
          text: 'Share Course',
          icon: 'share-alt',
          click: () => { this.$refs.courseShare.init() }
        }, {
          text: 'Share Plan',
          disabled: !this.planAssigned || !this.plan._id,
          icon: 'share-alt',
          click: () => { this.$refs.courseShare.init('plan') }
        }, {
          text: `Email ${this.course.link ? 'Race' : 'Course'} Owner`,
          disabled: this.$course.owner,
          icon: 'envelope',
          click: () => { this.emailOwner() }
        }, {
          text: 'Download GPX/TCX Files',
          icon: 'download',
          click: () => { this.download() }
        }, {
          text: 'Compare to Activity',
          disabled: !this.planAssigned,
          icon: 'running',
          click: () => { this.loadCompare() }
        }, {
          text: `Print ${this.tableTabNames[this.tablesTab]}${this.tablesTab === 3 ? ' Page' : ' Table'}`,
          disabled: this.$course.view === 'edit',
          icon: 'print',
          click: () => { this.print(this.tableTabNames[this.tablesTab]) }
        }, {
          text: 'Print Profile Chart',
          disabled: this.$course.view === 'edit',
          icon: 'print',
          click: () => { this.print('Profile') }
        }
      ]
    },
    tableHeight: function () {
      if (this.$window.width < 992) return 0
      return (this.$window.height - 162)
    },
    description: function () {
      if (this.course.description) {
        return this.course.description
      } else {
        return `The ${this.$title} course covers ${this.$units.distf(this.course.scaledDist, 1)} ${this.$units.dist} with ${this.$units.altf(this.course.scaledGain, 0)} ${this.$units.alt} of climbing. Ready?`
      }
    },
    views: function () {
      return [
        {
          view: 'edit',
          text: 'Course Editing',
          button: 'Editing',
          disabled: !this.$course.owner,
          icon: 'edit'
        }, {
          view: 'plan',
          text: 'Pace Planning',
          button: 'Planning',
          icon: 'clock'
        }, {
          view: 'execute',
          text: 'Race Day',
          button: 'Race Day',
          disabled: true,
          icon: 'running'
        }, {
          view: 'analyze',
          text: 'Post-Race',
          button: 'Post-Race',
          disabled:
            (!this.plans.length && !this.plansByOthers.length) ||
            !this.event.startMoment ||
            (this.$course.view !== 'analyze' && moment().diff(this.event.startMoment) < 0),
          icon: 'chart-line'
        }
      ]
    },
    title: function () {
      return this.$title + ' - ultraPacer'
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
    segments: function () {
      const type = this.planAssigned && this.pacingSplitsReady ? 'plan' : 'course'
      return this[type].splits.segments
    },
    pacingSplitsReady: function () {
      return Boolean(
        this.plan &&
        this.plan.splits &&
        this.plan.splits.miles && this.plan.splits.miles.length &&
        this.plan.splits.kilometers && this.plan.splits.kilometers.length &&
        this.plan.splits.segments && this.plan.splits.segments.length
      )
    },
    splits: function () {
      const type = this.planAssigned && this.pacingSplitsReady ? 'plan' : 'course'
      if (this.$units.dist === 'km') {
        return this[type].splits.kilometers
      } else {
        return this[type].splits.miles
      }
    },
    terrainFactors: function () {
      if (!this.waypoints.length) { return [] }
      return this.$core.geo.createTerrainFactors(this.waypoints)
    },
    waypoints: function () {
      this.logger.child({ method: 'waypoints' }).info('run')
      if (!this.course.waypoints || !this.course.waypoints.length) return []
      return this.$core.waypoints.loopedWaypoints(
        this.course.waypoints,
        this.course
      )
    },
    visibleWaypoints: function () {
      this.logger.child({ method: 'visibleWaypoints' }).info('run')
      return this.waypoints.filter(wp =>
        this.$course.view === 'edit' ||
        (this.tablesTab === 0 && wp.tier <= 2) ||
        wp.visible
      )
    },
    publicName: function () {
      return this.course.public ? this.course.name : 'private'
    },
    pointsReady: function () {
      return Boolean(!this.$status.loading && this.course.points?.length)
    }
  },
  watch: {
    '$course.view': function (val) {
      if (this.$status.loading) return
      this.logger.child({ method: '$course.view watcher' }).info(`view changed to ${val}`)

      this.$course.comparing = false

      // update after disabling editing
      if (val !== 'edit' && this.updateFlag) {
        this.createSplits()
        if (this.planAssigned) {
          this.clearPlanSplits()
          this.updatePacing()
        }
        this.updateFlag = false
      }
      if (val === 'edit') {
        this.clearPlan()
        this.waypoints.filter(wp => !wp.visible).forEach(wp => { wp.show() })
        this.tablesTab = 0
      } else {
        this.waypoints.filter(wp => wp.tier > 1).forEach(wp => { wp.hide() })
        this.selectRecentPlan(() => { this.newPlan() })
      }
      if (val === 'analyze') {
        this.$nextTick(() => { this.loadCompare() })
      } else if (this.$course.comparing) {
        this.stopCompare()
      }
    },
    tablesTab: function (val) {
      this.focus = []
      // if editing and navigating away from waypoint table, recalc
      if (this.updateFlag && this.tablesTab > 0) {
        this.createSplits()
        if (this.planAssigned) {
          this.clearPlanSplits()
          this.updatePacing()
        }
        this.updateFlag = false
      }
    }
  },
  async created () {
    this.logger.child({ method: 'created' }).verbose('run')
    this.$course.view = 'plan'
    this.initialize()
  },
  beforeDestroy () {
    this.logger.child({ method: 'beforeDestroy' }).verbose('run')
    this.$course.comparing = false
    this.$course.mode = 'view'
  },
  methods: {
    async initialize () {
      const log = this.logger.child({ method: 'initialize' })
      log.info('run')
      this.$status.processing = true
      this.$status.loading = true
      try {
        await this.$auth.getAccessToken()
      } catch (err) {}
      try {
        // get course db by either link or course id:
        const coursedb = this.$route.params.permalink
          ? await api.getCourse(this.$route.params.permalink, 'link')
          : await api.getCourse(this.$route.params.course, 'course')

        // create a new course object from database:
        this.course = new this.$core.courses.Course(coursedb)

        // set ownership
        this.$course.owner = Boolean(
          this.$user.isAuthenticated &&
          this.course._users.includes(this.$user._id)
        )

        // reformat url
        const route = this.course.link
          ? { name: 'Race', params: { permalink: this.course.link } }
          : { name: 'Course', params: { course: this.course._id } }
        this.url = `https://ultrapacer.com${this.$router.resolve(route).href}`
        route.query = this.$route.query
        if (this.$route.params.plan && !route.query.plan) {
          route.query.plan = this.$route.params.plan
        }
        this.$router.replace(route)

        this.$gtage(this.$gtag, 'Course', 'view', this.publicName)
        this.plans = this.course.plans || []

        this.$title = this.course.name

        // if bot, stop here:
        if (isbot(navigator.userAgent)) {
          this.syncSegmentWaypoints()
          this.$status.processing = false
          this.$status.loading = false
          return
        }

        // download course track:
        const llas = await api.getCourseField(this.course._id, 'points')
        log.info(`downloaded (${llas.length} points)`)

        // if looped course, repeat points array
        const track = await this.$core.tracks.create(llas, { loops: this.course.loops })
        this.course.addTrack(track)

        // set waypoint lat/lon/alt from points:
        this.waypoints.filter(wp => wp.loop === 1 || wp.type === 'finish')
          .forEach(wp => { wp.refreshLLA(this.course.track) })

        this.syncSegmentWaypoints()

        // set lat/lon in event object:
        this.event.lat = this.course.track[0].lat
        this.event.lon = this.course.track[0].lon
        if (this.course.eventStart) {
          this.event.timezone = this.course.eventTimezone
          this.event.start = this.course.eventStart
        }
        this.course.event = this.event

        this.$status.loading = false

        if (this.$route.query.plan) {
          if (this.$route.query.plan.length <= 24) {
            let plan = this.plans.find(
              x => x._id === this.$route.query.plan
            )
            if (plan) {
              this.selectPlan(plan)
            } else {
              plan = await this.$api.getPlan(this.$route.query.plan)
              if (this.plan._user === this.$user._id) {
                this.plans.push(plan)
              } else {
                this.plansByOthers.push(plan)
              }
              this.selectPlan(plan)
            }
          } else {
            const p = JSURL.tryParse(this.$route.query.plan, null)
            if (p) {
              log.info('showing plan from URL')
              this.$refs.planEdit.show(p)
            }
          }
        } else {
          this.selectRecentPlan(() => {
            if (this.$course.owner) {
              this.$course.view = 'edit'
            } else {
              setTimeout(() => {
                if (this.$course.view !== 'edit' && !this.$refs.planEdit.$refs.modal.isShow) {
                  this.newPlan()
                }
              }, 2000)
            }
          })
        }
        this.$status.processing = false
        this.$status.loading = false
        setTimeout(() => {
          if (!this.$user.isAuthenticated) {
            this.$refs['toast-welcome'].show()
          }
        }, 1000)

        // if the url has an "after" action, strip it off and execute it
        if (this.$route.query.after) {
          const q = { ...this.$route.query }
          const after = this.$route.query.after
          delete q.after
          this.$router.replace({ query: q })
          setTimeout(() => {
            this[after]()
          }, 1000)
        }

        log.info('comlete')
      } catch (error) {
        this.$error.handle(error, 'Course|initialize', true)
        this.$status.processing = false
        this.$status.loading = false
        this.$router.push({ path: '/' })
      }
    },
    async editCourse () {
      if (this.$course.view !== 'edit') { this.$course.view = 'edit' }
      this.$refs.courseEdit.show(this.course._id)
    },
    async reloadCourse () {
      // reload current page
      this.$status.loading = true
      window.onbeforeunload = null
      this.$router.go()
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
      this.$refs.waypointEdit.show()
    },
    async editWaypoint (waypoint, loop = 1) {
      this.$refs.waypointEdit.show(waypoint, loop)
    },
    async deleteWaypoint (waypoint, cb) {
      this.$refs.delModal.show(
        {
          type: 'waypoint',
          object: waypoint
        },
        async () => {
          this.$gtage(this.$gtag, 'Waypoint', 'delete', this.publicName)
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
          this.setUpdateFlag()
        },
        (err) => {
          if (typeof (cb) === 'function') {
            if (err) cb(err)
            else cb()
          }
        }
      )
    },
    updateWaypointLocation (waypoint, loc) {
      try {
        waypoint.loc = loc
        waypoint.refreshLLA(this.course.track)
        if (String(waypoint.site._id) === this.updatingWaypointTimeoutID) {
          clearTimeout(this.updatingWaypointTimeout)
        }
        this.updatingWaypointTimeoutID = String(waypoint.site._id)
        this.updatingWaypointTimeout = setTimeout(() => {
          api.updateWaypoint(waypoint.site._id, waypoint.site)
        }, 2000)
        this.setUpdateFlag()
      } catch (error) {
        this.$error.handle(error)
      }
    },
    updateWaypointDelay (waypoint, delay) {
      this.logger.child({ method: 'updateWaypointDelay' }).info('run')
      try {
        if (!this.plan || !this.plan.waypointDelays) return

        // remove old record if it exists:
        this.plan.waypointDelays = this.plan.waypointDelays.filter(
          wpd => !(wpd.site === waypoint.site._id && wpd.loop === waypoint.loop)
        )

        // add in new one:
        if (delay !== null) {
          this.plan.waypointDelays.push({ site: waypoint.site._id, loop: waypoint.loop, delay: delay })
        }

        // update database
        this.$api.updatePlan(this.plan._id, { waypointDelays: this.plan.waypointDelays })
      } catch (error) {
        console.log(error)
        this.$gtag.exception({
          description: `Course|updateWaypointDelay: ${error.toString()}`,
          fatal: false
        })
      }
      this.$status.processing = true
      setTimeout(() => { this.updatePacing() }, 10)
    },
    async refreshWaypoints (callback) {
      this.course.waypoints = await api.getWaypoints(this.course._id)
      this.waypoints.filter(wp => wp.loop === 1 || wp.type === 'finish')
        .forEach(wp => { wp.refreshLLA(this.course.track) })
      this.setUpdateFlag()
      if (typeof callback === 'function') callback()
    },
    syncSegmentWaypoints () {
      // match waypoints in cached segments w/ actual objects
      this.course.splits.segments.forEach(s => {
        const wp = this.waypoints.find(
          wp => wp.site._id === s.waypoint.site && wp.loop === s.waypoint.loop
        )
        if (wp) s.waypoint = wp
      })
    },
    async newPlan () {
      this.$gtage(this.$gtag, 'Plan', 'add', this.publicName)
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
          this.$gtage(this.$gtag, 'Plan', 'delete', this.publicName)
          await this.clearPlan()
          this.plans = await api.getPlans(this.course._id)
          this.selectRecentPlan(() => { setTimeout(() => { this.newPlan() }, 1000) })
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
        this.plans = await api.getPlans(this.course._id)
        this.selectPlan(this.plans.find(p => p._id === plan._id))
      } else {
        this.plans = [plan]
        this.selectPlan({ ...plan })
      }
      await this.calcPlan()
      if (typeof callback === 'function') callback()
    },
    async selectPlan (plan) {
      this.logger.child({ method: 'selectPlan' }).info(`${plan.name} selected.`)
      this.$refs.waypointTable?.collapseAll()
      this.plan = new this.$core.plans.Plan(plan)
      if (!this.$course.comparing) {
        if (this.plan.eventStart) {
          this.event.timezone = this.plan.eventTimezone
          this.event.start = this.plan.eventStart
        } else if (
          this.course.eventStart &&
          this.event.startMoment &&
          this.event.startMoment.diff(moment(this.course.eventStart).tz(this.course.eventTimezone))
        ) {
          this.event.timezone = this.course.eventTimezone
          this.event.start = this.course.eventStart
        }
      }
      this.calcPlan()
    },
    async calcPlan () {
      this.logger.child({ method: 'calcPlan' }).info('run')
      if (!this.planAssigned) { return }
      if (this.plan._id) {
        if (this.$route.query.plan !== this.plan._id) {
          this.$router.push({ query: { plan: this.plan._id } })
        }
        if (this.$user._id === this.plan._user) {
          this.plan.last_viewed = new Date()
          this.$api.updatePlan(
            this.plan._id,
            {
              last_viewed: this.plan.last_viewed
            }
          )
        }
      } else {
        const temp = {}
        const fields = [
          '_id', 'name', 'description', 'pacingMethod', 'pacingTarget',
          'drift', 'heatModel', 'waypointDelay', 'eventStart', 'eventTimezone'
        ]
        fields.forEach(f => { if (this.plan[f]) temp[f] = this.plan[f] })
        this.$router.push({ query: { plan: JSURL.stringify(temp) } })
      }
      this.$gtage(this.$gtag, 'Plan', 'view', this.publicName)
      if (!this.pacingSplitsReady) {
        this.$status.processing = true
        setTimeout(() => { this.updatePacing() }, 10)
      } else {
        if (this.course.points[0].actual !== undefined) {
          await this.updatePacing()
        }
      }
    },
    async clearPlan () {
      this.logger.child({ method: 'clearPlan' }).info('run')
      // deselect the current plan
      if (!this.planAssigned) { return }
      this.plan = {}
      const q = { ...this.$route.query }
      delete q.plan
      this.$router.push({ query: q })
    },
    async selectRecentPlan (noPlanFunction) {
      if (this.planAssigned) return
      this.logger.child({ method: 'selectRecentPlan' }).info('run')
      if (this.plans.length) {
        const lastViewed = Math.max.apply(
          Math,
          this.plans.map(p => { return p.last_viewed ? moment(p.last_viewed).unix() : 0 })
        )
        if (lastViewed) {
          this.selectPlan(
            this.plans.find(
              p => p.last_viewed && lastViewed === moment(p.last_viewed).unix()
            )
          )
        } else {
          this.selectPlan(this.plans[0])
        }
      } else if (this.plansByOthers.length) {
        this.selectPlan(this.plansByOthers[0])
      } else {
        noPlanFunction()
      }
    },
    resetEventTime: function () {
      if (this.plan && this.plan.eventStart) {
        this.event.timezone = this.plan.eventTimezone
        this.event.start = this.plan.eventStart
        this.updatePacing()
      } else if (this.course.eventStart) {
        this.event.timezone = this.course.eventTimezone
        this.event.start = this.course.eventStart
        this.updatePacing()
      }
    },
    createSplits: async function () {
      this.logger.child({ method: 'createSplits' }).info('run')
      this.course.splits.segments = await this.$core.geo.createSegments(
        this.course.points,
        {
          waypoints: this.waypoints,
          tFs: this.terrainFactors,
          course: this.course
        }
      )
      const units = ['kilometers', 'miles']
      units.forEach(async (unit) => {
        this.course.splits[unit] = await this.$core.geo.createSplits(
          this.course.points,
          unit,
          {
            tFs: this.terrainFactors,
            course: this.course
          }
        )
      })
    },
    createPlanSplits: async function () {
      this.logger.child({ method: 'createPlanSplits' }).info('run')
      if (!this.plan.splits) { this.$set(this.plan, 'splits', {}) }
      const segments = await this.$core.geo.createSegments(
        this.course.points,
        {
          waypoints: this.waypoints,
          ...this.plan.pacing,
          startTime: this.event.startTime,
          course: this.course
        }
      )
      this.$set(this.plan.splits, 'segments', segments)
      const units = ['kilometers', 'miles']
      units.forEach(async (unit) => {
        const s = await this.$core.geo.createSplits(
          this.course.points,
          unit,
          {
            ...this.plan.pacing,
            startTime: this.event.startTime,
            course: this.course
          }
        )
        this.$set(this.plan.splits, unit, s)
      })
    },
    clearPlanSplits: function () {
      this.plans.forEach(p => {
        p.splits = {}
      })
    },
    async updatePacing () {
      const log = this.logger.child({ method: 'updatePacing' })
      log.info('run')
      // update splits, segments, and pacing
      this.updateFlag = false
      this.$status.processing = true
      try {
        // create delays array of loc/time objects
        const delays = this.waypoints.map(wp => {
          return {
            loc: wp.loc,
            delay: this.plan.getDelayAtWaypoint(wp).delay
          }
        })
          .filter(d => d.delay > 0)
          .sort((a, b) => a.loc - b.loc)

        const pacing = this.$core.geo.calcPacing({
          course: this.course,
          plan: this.plan,
          points: this.course.points,
          pacing: this.plan.pacing,
          event: this.event,
          delays: delays,
          heatModel: this.heatModel,
          terrainFactors: this.terrainFactors
        })
        this.$set(this.plan, 'pacing', pacing) // use $set to make reactive
        // update splits and segments
        await this.createPlanSplits()

        // check if any cutoffs were missed for races:
        if (this.course.race) {
          const cutoffwps = this.waypoints.filter(wp => wp.cutoff && wp.elapsed(this.segments) > wp.cutoff + 29)
          log.log(cutoffwps.length ? 'warn' : 'info', `missed ${cutoffwps.length} cutoffs.`)
          if (cutoffwps.length) {
            const msg = `Plan misses cutoff(s) at the following locations: ${cutoffwps.map(wp => { return wp.name }).join(', ')}`
            this.$alert.show(msg, { variant: 'danger', timer: 6 })
          }
        }
      } catch (error) {
        this.$error.handle(error)
      }
      this.$status.processing = false
    },
    updateFocus: function (type, focus) {
      this.focus = focus
    },
    waypointClick: function (waypoint) {
      this.tablesTab = 0
      this.$refs.waypointTable?.selectWaypoint(waypoint)
      this.$refs.planTable?.selectWaypoint(waypoint)
    },
    setUpdateFlag: function () {
      this.updateFlag = true
    },
    showSaveButton: function () {
      this.saveButtonVisible = true
    },
    // add function adds obj to updates list
    update: function (type, obj, valid) {
      const log = this.logger.child({ method: 'update' })
      try {
        log.info(`type: ${type}`)
        const u = this.updates
        if (obj._id) {
          if (valid) {
          // create update array if it doesn't exist
            if (!u.update) u.update = {}
            if (!u.update?.[type]) u.update[type] = []

            const x = u.update[type].find(o => o === obj)
            if (!x) u.update[type].push(obj)

            // if there is an remove array, remove this from it
            if (u.remove?.[type]) {
              const y = u.remove[type].findIndex(o => o === obj)
              if (y >= 0) u.remove[type].splice(y, 1)
            }
          } else {
          // create removal array if it doesn't exist
            if (!u.remove) u.remove = {}
            if (!u.remove?.[type]) u.remove[type] = []

            const x = u.remove[type].find(o => o === obj)
            if (!x) u.remove[type].push(obj)

            // if there is an update array, remove this from it
            if (u.update?.[type]) {
              const y = u.update[type].findIndex(o => o === obj)
              if (y >= 0) u.update[type].splice(y, 1)
            }
          }
        } else if (valid) {
        // create add array if it doesn't exist
          if (!u.add) u.add = {}
          if (!u.add?.[type]) u.add[type] = []

          const x = u.add[type].find(o => o === obj)
          if (!x) u.add[type].push(obj)
        } else if (u.add?.[type]) {
          const x = u.add[type].findIndex(o => o === obj)
          if (x >= 0) u.add[type].splice(x, 1)
        }
        u.count = 0
        const actions = ['add', 'update', 'remove']
        actions.forEach(a => {
          if (u[a]) {
            const models = Object.keys(u[a])
            models.forEach(t => {
              u.count += u[a][t]?.length || 0
            })
          }
        })
        log.info(`${u.count} updates pending`)

        if (type === 'Plan.delays') {
          this.$status.processing = true
          setTimeout(() => { this.updatePacing() }, 10)
        }
        this.$nextTick(() => { this.saveButtonVisible = u.count > 0 })
      } catch (error) {
        this.$error.handle(error)
      }
    },
    updateBatch: async function () {
      this.logger.child({ method: 'updateBatch' }).info('run')
      try {
        this.$status.processing = true
        await this.$api.batch(this.updates)
        this.$status.processing = false
        this.$nextTick(() => {
          this.reloadCourse()
        })
      } catch (error) {
        this.$error.handle(error)
        this.$status.processing = false
      }
    },
    updateCancel: async function () {
      this.logger.child({ method: 'updateCancel' }).info('run')
      try {
        if (this.updates.count) {
          this.$status.processing = true
          await this.refreshPlans({ _id: this.plan._id })
          this.updates = {}
        }
        this.$course.mode = 'view'
        this.saveButtonVisible = false
      } catch (error) {
        this.$error.handle(error)
      }
      this.$status.processing = false
    },
    async download () {
      await this.$refs.download.show()
    },
    async addOwner (user) {
      if (!this.$course.owner) { return }
      this.logger.child({ method: 'addOwner' }).info('run')
      await api.modifyCourseUsers(this.course._id, 'add', user)
    },
    async removeOwner (user) {
      if (!this.$course.owner) { return }
      this.logger.child({ method: 'removeOwner' }).info('run')
      await api.modifyCourseUsers(this.course._id, 'remove', user)
    },
    async changeOwner (_user) {
      if (!this.$user.admin) { return }
      await api.updateCourse(this.course._id, { _user: _user })
    },
    async setPermalink (link) {
      if (!this.$user.admin) { return }
      await api.updateCourse(this.course._id, { public: true, link: link })
    },
    async stopCompare (cb) {
      this.$course.comparing = false
      if (typeof cb === 'function') await cb()
      this.resetEventTime()
      this.$course.view = 'plan'
    },
    async loadCompare () {
      this.$course.view = 'analyze'
      this.$refs.courseCompare.show(
        async (actual, startTime) => {
          await this.$core.util.sleep(100)
          this.event.start = startTime
          this.$status.processing = true
          const res = await this.course.addActuals(actual)
          if (res.match) {
            this.$gtage(this.$gtag, 'Course', 'compare', this.publicName, 1)
            this.$course.comparing = true
            this.createPlanSplits()
          } else {
            this.$gtage(this.$gtag, 'Course', 'compare', this.publicName, 0)
            this.resetEventTime()
            this.$course.comparing = false
          }
          this.$status.processing = false
          return res
        }
      )
    },
    async print (component) {
      const log = this.logger.child({ method: 'print' })
      log.info(component)

      // define $refs for each print component:
      const refs = {
        Segments: 'segmentTable',
        Splits: 'splitTable',
        Waypoints: 'waypointTable',
        Details: 'planDetails',
        Profile: 'profile',
        Plan: 'planTable'
      }

      // clear focus, if any:
      if (this.focus.length) {
        this.focus = []
        if (component === 'Segments' || component === 'Splits') {
          await this.$refs[refs[component]].clear()
        }
      }

      // save devicePixelRatio to restore later, set new one to 4
      // this is for resolution of print
      const oldPixelRatio = window.devicePixelRatio
      window.devicePixelRatio = 4

      // set printing status
      this.printing = component
      if (component === 'Profile') this.$status.processing = true

      // set filename:
      let filename = `uP-${this.course.name}${(this.plan.name ? ('--' + this.plan.name) : '')}--${component}.pdf`
      filename = filename.replace(/ /g, '_')

      // pdf printing options:
      const opt = {
        margin: [0.75, 0.5, 0.5, 0.5],
        filename: filename,
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { scale: 4 },
        jsPDF: {
          unit: 'in',
          format: 'letter',
          orientation: component === 'Details' ? 'portrait' : 'landscape'
        }
      }
      if (component !== 'Profile') {
        opt.pagebreak = { mode: 'css', avoid: 'tr' }
      }

      // define logo image for header:
      const logo = new Image()
      logo.src = '/public/img/logo.png'

      // if profile print, render chart to print size:
      if (component === 'Profile') {
        await this.$refs.profile.update()
        await new Promise(resolve => setTimeout(resolve, 500))
      }
      // lazy load the html2pdf module:
      if (!html2pdf) {
        log.info('importing html2pdf')
        await import(/* webpackPrefetch: true */ 'html2pdf.js')
          .then(mod => { html2pdf = mod.default })
      }
      // execute printing:
      this.$nextTick(() => {
        html2pdf()
          .set(opt)
          .from(this.$refs[refs[component]].$el)
          .toPdf()
          .get('pdf')
          .then((pdf) => {
            // add header and logo
            const totalPages = pdf.internal.getNumberOfPages()
            for (let i = 1; i <= totalPages; i++) {
              pdf.setPage(i)

              // write ultraPacer:
              pdf.setFontSize(16)
              pdf.text('ultraPacer', 0.5, 0.6)

              // write description and page number:
              const arr = [
                `Course: ${this.course.name}`,
                component
              ]
              if (this.plan.name) arr.splice(1, 0, `Plan: ${this.plan.name}`)
              if (totalPages > 1) arr.push(`Page ${i} of ${totalPages}`)
              pdf.setFontSize(12)
              pdf.text(
                arr.join('  |  '),
                1.75,
                0.6
              )

              // add URL
              pdf.setFontSize(10)
              pdf.setTextColor(128, 128, 128)
              pdf.text(
                window.location.href,
                pdf.internal.pageSize.getWidth() - 0.5,
                pdf.internal.pageSize.getHeight() - 0.32,
                'right'
              )

              // add logo to top right:
              pdf.addImage(logo, 'JPEG', pdf.internal.pageSize.getWidth() - 1, 0.2, 0.5, 0.5)
            }
          }).save().then(() => {
            this.$gtag.event('print', { event_category: component, event_label: this.publicName })

            // reset status:
            this.printing = false
            this.$status.processing = false

            // restore devicePixelRatio:
            window.devicePixelRatio = oldPixelRatio

            // if profile print, render chart to original size:
            if (component === 'Profile') {
              this.$nextTick(() => { this.$refs.profile.update() })
            }
          })
      })
    },
    async emailOwner () {
      if (this.$user.isAuthenticated) {
        this.$refs.emailOwner.show()
      } else {
        this.$parent.login({ after: 'emailOwner' })
      }
    }
  }
}
</script>
