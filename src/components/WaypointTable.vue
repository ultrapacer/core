<template>
  <b-table
    ref="table"
    :busy="$status.processing"
    :items="rows"
    :fields="fields"
    primary-key="site._id+'_'loop"
    hover
    selectable
    small
    head-variant="light"
    no-border-collapse
    :class="`mb-0 table-xs${printing ? ' show-all-cells' : ''}`"
    :sticky-header="tableHeight ? tableHeight + 'px' : false"
    @row-clicked="toggleRowDetails"
  >
    <template #cell(actions)="row">
      <b-button
        class="mr-1"
        @click="editFn(row.item.site, row.item.loop)"
      >
        <v-icon name="edit" />
      </b-button>
      <b-button
        v-if="row.item.type !== 'start' && row.item.type !== 'finish'"
        class="mr-1"
        @click="delFn(row.item.site)"
      >
        <v-icon name="trash" />
      </b-button>
    </template>
    <template #row-details="row">
      <b-card v-if="$course.view==='edit'">
        <b-row class="mb-2">
          <b-col sm="4">
            Adjust Location:
          </b-col>
          <b-col sm="8">
            <b-button
              v-for="sb in shiftButtons"
              :key="sb.value"
              size="sm"
              class="mr-1"
              variant="outline-primary"
              @click="shiftWaypoint(rows.find(r=>r.site._id===row.item.site._id), sb.value)"
            >
              {{ sb.display }}
            </b-button>
          </b-col>
        </b-row>
      </b-card>
      <b-card v-else-if="planAssigned">
        <b-row class="mb-2">
          <form
            ref="waypoint-table-form"
            @submit.prevent=""
          >
            <b-form-group
              class="mt-1 mb-0 pl-2"
            >
              <b-form-radio
                v-model="waypointDelayCustom"
                :value="false"
                @change="waypointDelayClear(row.item)"
              >
                Use typical delay ({{ waypointDelayTypical | timef('[h]:m:ss') }})
              </b-form-radio>
              <b-form-radio
                v-model="waypointDelayCustom"
                :value="true"
              >
                Use unique delay<span v-if="waypointDelayCustom">, defined below:</span>
              </b-form-radio>
            </b-form-group>
            <b-input-group
              v-if="waypointDelayCustom"
              prepend="Delay"
              class="pl-4"
            >
              <time-input
                v-model="waypointDelay"
                format="hh:mm:ss"
                required
              />
              <b-input-group-append v-if="waypointDelayValid">
                <b-button
                  variant="outline-success"
                  @click="waypointDelayChange(row.item)"
                >
                  Save
                </b-button>
              </b-input-group-append>
            </b-input-group>
          </form>
        </b-row>
      </b-card>
    </template>
  </b-table>
</template>

<script>
import timeUtil from '../util/time'
import TimeInput from '../forms/TimeInput'
export default {
  components: {
    TimeInput
  },
  props: {
    course: {
      type: Object,
      required: true
    },
    event: {
      type: Object,
      required: true
    },
    editFn: {
      type: Function,
      required: true
    },
    delFn: {
      type: Function,
      required: true
    },
    plan: {
      type: Object,
      default: () => { return {} }
    },
    printing: {
      type: Boolean,
      default: false
    },
    segments: {
      type: Array,
      required: true
    },
    waypoints: {
      type: Array,
      required: true
    },
    tableHeight: {
      type: Number,
      default: 0
    },
    visible: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      currentWaypoint: {},
      shiftButtons: [
        { value: -1, display: '<<<' },
        { value: -0.1, display: '<<' },
        { value: -0.01, display: '<' },
        { value: 0.01, display: '>' },
        { value: 0.1, display: '>>' },
        { value: 1, display: '>>>' }
      ],
      waypointDelayCustom: false, // whether current waypoint has custom delay set
      waypointDelayTypical: '', // what the typical delay should be for current waypoint
      waypointDelay: null // delay (seconds) for current waypoint
    }
  },
  computed: {
    rows: function () {
      const arr = this.waypoints.filter(x => (
        this.$course.view === 'edit' || x.tier < 3)
      ).sort((a, b) => a.loc - b.loc)

      // clear variants from any cells that have them:
      arr.filter(wp => wp._cellVariants).forEach(wp => { delete wp._cellVariants })

      // highlight any missed cutoffs:
      if (this.$course.view === 'plan' && this.showTime) {
        arr.filter(wp => wp.cutoff && wp.elapsed(this.segments) > wp.cutoff + 29) // w/in the minute
          .forEach(wp => {
            wp._cellVariants = { elapsed: 'danger', tod: 'danger', cutoff: 'danger' }
          })
      }
      return arr
    },
    showTerrainType: function () {
      return this.waypoints.findIndex(wp => wp.terrainType()) >= 0
    },
    showTerrainFactor: function () {
      return this.waypoints.findIndex(wp => wp.terrainFactor()) >= 0
    },
    planAssigned: function () {
      return Boolean(Object.entries(this.plan).length) && Boolean(this.plan._id)
    },
    showTime: function () {
      return this.$course.view !== 'edit' && this.segments[this.segments.length - 1].elapsed
    },
    showDelay: function () {
      return Boolean(this.planAssigned && (this.plan.waypointDelay || (this.plan.waypointDelays && this.plan.waypointDelays.length > 0)))
    },
    fields: function () {
      const f = [
        {
          key: 'name',
          class: 'text-truncate mw-7rem',
          formatter: (value, key, item) => {
            return item.name
          }
        },
        {
          key: 'type',
          formatter: (value, key, item) => {
            return this.$waypointTypes[item.type].text
          },
          class: 'd-none d-md-table-cell'
        },
        {
          key: 'location',
          label: `Loc. [${this.$units.dist}]`,
          formatter: (value, key, item) => {
            if (this.$course.view === 'edit' && item.type === 'finish') {
              return this.$units.distf(this.course.scaledDist, 2)
            } else {
              return this.$units.distf(item.loc * this.course.distScale, 2)
            }
          },
          class: 'text-right'
        },
        {
          key: 'elevation',
          label: `Elev. [${this.$units.alt}]`,
          formatter: (value, key, item) => {
            return this.$units.altf(item.alt, 0)
              .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
          },
          class: 'd-none d-sm-table-cell text-right'
        }
      ]

      if (this.showCutoffs && this.$course.view !== 'analyze') {
        f.push({
          key: 'cutoff',
          label: 'Cutoff',
          formatter: (value, key, item) => {
            const v = item.cutoff
            return v === null
              ? ''
              : timeUtil.sec2string(v + this.event.startTime, 'am/pm')
          },
          class: 'd-none d-md-table-cell d-lg-none d-xl-table-cell text-right'
        })
      }
      if (this.$course.view === 'edit') {
        if (this.showTerrainType) {
          f.push({
            key: 'terrainType',
            label: 'Terrain',
            formatter: (value, key, item) => {
              if (item.type === 'finish') { return '' }
              return item.terrainType(this.waypoints) || ''
            },
            class: 'd-none d-lg-table-cell text-right'
          })
        }
        if (this.showTerrainFactor) {
          f.push({
            key: 'terrainFactor',
            label: 'Factor',
            formatter: (value, key, item) => {
              if (item.type === 'finish') { return '' }
              const v = item.terrainFactor(this.waypoints) || 0
              return `+${v}%`
            },
            class: 'd-none d-lg-table-cell text-center'
          })
        }
        f.push({
          key: 'actions',
          label: '',
          tdClass: 'actionButtonColumn'
        })
      } else {
        if (this.showTime) {
          f.push({
            key: this.event.hasTOD() ? 'tod' : 'elapsed',
            label: 'Time',
            formatter: (value, key, item) => {
              const v = item.elapsed(this.segments)
              return v !== undefined
                ? this.event.hasTOD()
                  ? timeUtil.sec2string(v + this.event.startTime, 'am/pm')
                  : timeUtil.sec2string(v, '[h]:m:ss')
                : ''
            },
            class: 'text-right'
          })
        }
        if (this.$course.comparing) {
          f.push({
            key: this.event.hasTOD() ? 'actualTOD' : 'actualElapsed',
            label: 'Actual',
            formatter: (value, key, item) => {
              const v = item.actualElapsed(this.segments)
              return v !== undefined
                ? this.event.hasTOD()
                  ? timeUtil.sec2string(v + this.event.startTime, 'am/pm')
                  : timeUtil.sec2string(v, '[h]:m:ss')
                : ''
            },
            class: 'text-right',
            variant: 'success'
          })
        }
        if (this.showDelay) {
          f.push({
            key: 'delay',
            label: 'Delay',
            formatter: (value, key, item) => {
              const v = item.delay(this.plan.waypointDelay, this.plan.waypointDelays)
              if (v) {
                return timeUtil.sec2string(v, '[h]:m:ss')
              } else {
                return ''
              }
            },
            class: 'd-none d-lg-table-cell text-right'
          })
          if (this.$course.comparing) {
            f.push({
              key: 'actualDelay',
              label: 'Actual',
              formatter: (value, key, item) => {
                try {
                  const v = item.actualDelay(this.course.points)
                  return v >= 10 ? timeUtil.sec2string(v, '[h]:m:ss') : ''
                } catch (error) {
                  console.log(error)
                  return 'error'
                }
              },
              class: 'text-right',
              variant: 'success'
            })
          }
        }
      }
      return f
    },
    waypointDelayValid: function () {
      // whether the input for a custom delay value is valid and unique
      if (this.waypointDelay === null || isNaN(this.waypointDelay)) {
        return false
      }
      const wpd = this.plan.waypointDelays.find(wpd => wpd.site === this.currentWaypoint.site._id && wpd.loop === this.currentWaypoint.loop)
      if (wpd) {
        return wpd.delay !== this.waypointDelay
      } else {
        return this.waypointDelayTypical !== this.waypointDelay
      }
    },
    showCutoffs: function () {
      return this.waypoints.filter(wp => wp.cutoff).length
    }
  },
  watch: {
    '$course.view': function (val) {
      // hide details fields when editing is turned off
      if (val !== 'edit') {
        this.rows.forEach(r => {
          this.$set(r, '_showDetails', false)
        })
      }
    },
    visible: function (val) {
      if (!val) {
        this.$refs.table.clearSelected()
        // hide other rows showing details:
        this.rows.filter(r => r._showDetails).forEach(r => {
          this.$set(r, '_showDetails', false)
        })
      }
    }
  },
  methods: {
    collapseAll: function () {
      this.$refs.table.clearSelected()
      this.rows.filter(r => r._showDetails).forEach(r => {
        this.$set(r, '_showDetails', false)
      })
    },
    toggleRowDetails: function (item) {
      try {
        // curent visible state:
        const show = !item._showDetails
        this.collapseAll()
        if ((item.type === 'start' && item.loop === 1) || item.type === 'finish') return
        const planReady = this.planAssigned && this.plan._user === this.$user._id
        if (show && (this.$course.view === 'edit' || planReady)) {
          this.$set(item, '_showDetails', true)
          this.currentWaypoint = item
          if (this.$course.view !== 'edit' && planReady) {
          // set waypoint delay inputs:
            const wpd = this.plan.waypointDelays.find(wpd => wpd.site === item.site._id && wpd.loop === item.loop)
            this.waypointDelay = null
            this.waypointDelayCustom = Boolean(wpd)
            this.waypointDelayTypical = item.hasTypicalDelay ? this.plan.waypointDelay : 0
            if (wpd) {
              this.waypointDelay = wpd.delay
            } else if (this.plan.waypointDelay && item.hasTypicalDelay) {
              this.waypointDelay = this.plan.waypointDelay
            }
          }
          this.$nextTick(() => { this.$refs.table.selectRow(this.rows.findIndex(row => row === item)) })
        }
      } catch (error) {
        console.log(error)
        this.$gtag.exception({
          description: `WaypointTable|toggleRowDetails: ${error.toString()}`,
          fatal: false
        })
      }
    },
    shiftWaypoint: function (item, delta) {
      let loc = item.loc + (delta / this.course.distScale / this.$units.distScale)
      loc = Math.max(loc, 0.01 / this.course.distScale / this.$units.distScale)
      loc = Math.min(loc, this.course.track.dist - (0.01 / this.course.distScale / this.$units.distScale))
      this.$emit('updateWaypointLocation', item, loc)
    },
    selectWaypoint: function (waypoints) {
      this.collapseAll()
      if (!Array.isArray(waypoints)) {
        waypoints = [waypoints]
      }
      waypoints.forEach(waypoint => {
        const i = this.rows.findIndex(wp => wp === waypoint)
        this.$nextTick(() => { this.$refs.table.selectRow(i) })
      })
    },
    waypointDelayClear: function (item) {
      this.$emit('updateWaypointDelay', item, null)
      this.waypointDelay = null
    },
    waypointDelayChange: function (item) {
      this.$emit('updateWaypointDelay', item, this.waypointDelay)
    }
  }
}
</script>
