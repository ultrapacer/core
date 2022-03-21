<template>
  <div>
    <b-table
      ref="table"
      :busy="$status.processing"
      :items="rows"
      :fields="fields"
      primary-key="site._id+'_'loop"
      hover
      selectable
      select-mode="multi"
      no-select-on-click
      small
      head-variant="light"
      no-border-collapse
      :class="`mb-0 table-xs${printing ? ' show-all-cells' : ''}`"
      :sticky-header="tableHeight ? tableHeight - 24 + 'px' : false"
      @row-clicked="selectWaypoint"
    >
      <template
        #cell(name)="row"
        )
      >
        <b>{{ row.item.name }} [{{ $waypointTypes[row.item.type].short }}]</b>
      </template>
      <template #cell(delayInput)="row">
        <time-input
          v-if="row.item.type !== 'finish' && (row.item.loop > 1 || row.item.type !== 'start')"
          v-model="waypointDelays[row.index]"
          format="mm:ss"
          :default="plan.getTypicalDelayAtWaypoint(row.item)"
          style="width: 50px"
          @input="waypointDelayChange(plan.getDelayAtWaypoint(row.item), waypointDelays[row.index])"
        />
      </template>
      <template #row-details="row">
        <b-card
          v-if="planOwner && plan._id && $course.mode === 'edit' && !printing"
          no-body
          class="ml-1 p-1"
        >
          <form
            ref="waypoint-table-form"
            @submit.prevent=""
          >
            <b-input-group
              v-if="row.item.type !== 'finish' && (row.item.loop > 1 || row.item.type !== 'start')"
              prepend="Delay"
              class="d-md-none mb-1"
            >
              <time-input
                v-model="waypointDelays[row.index]"
                format="hh:mm:ss"
                :default="plan.getTypicalDelayAtWaypoint(row.item)"
                @input="waypointDelayChange(plan.getDelayAtWaypoint(row.item), waypointDelays[row.index])"
              />
            </b-input-group>
            <b-input-group
              v-if="plan._user===$user._id"
              prepend="Notes"
            >
              <b-form-textarea
                v-model="waypointNotes[row.index]"
                rows="2"
                max-rows="30"
                @input="$emit('input')"
                @change="noteChange(plan.getNoteAtWaypoint(row.item), waypointNotes[row.index])"
              />
            </b-input-group>
          </form>
        </b-card>
        <b-card
          v-else-if="planAssigned && waypointNotes[row.index]"
          no-body
          class="ml-1 p-1"
        >
          <p
            class="p-1 m-0"
          >
            <span style="white-space: pre-wrap">{{ waypointNotes[row.index] }}</span>
          </p>
        </b-card>
      </template>
    </b-table>
    <b-row
      class="mr-1 ml-1"
      style="display: flex; border-top: inset"
    >
      <div>Distance in <b>{{ $units.distance }}</b>; altitude in <b>{{ $units.altitude }}</b></div>
      <div style="   text-align: right; max-width: 100%;    margin-left: auto;">
        <b>*</b> delta from prior waypoint
      </div>
    </b-row>
  </div>
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
    }
  },
  data () {
    return {
      logger: this.$log.child({ file: 'PlanTable.vue' })
    }
  },
  computed: {
    rows: function () {
      this.logger.child({ method: 'rows' }).debug('computed')
      const arr = this.waypoints.filter(x => (x.tier === 1)).sort((a, b) => a.loc - b.loc)

      // clear variants from any cells that have them:
      arr.filter(wp => wp._cellVariants).forEach(wp => { delete wp._cellVariants })

      // highlight any missed cutoffs:
      if (this.$course.view === 'plan' && this.showTime) {
        arr.filter(wp => wp.cutoff && wp.elapsed(this.segments) > wp.cutoff + 29) // w/in the minute
          .forEach(wp => {
            wp._cellVariants = { elapsed: 'danger', tod: 'danger', cutoff: 'danger' }
          })
      }

      arr.forEach(r => { r._showDetails = true })

      return arr
    },
    superSegments: function () {
      if (!this.segments?.[0]?.waypoint) return []
      let segs = []
      const rs = []
      this.segments.forEach((s, i) => {
        segs.push(s)
        if (s.waypoint.tier === 1) {
          rs.push(new this.$core.segments.SuperSegment(segs))
          segs = []
        }
      })
      return rs
    },
    planAssigned: function () {
      return this.plan?.__class === 'Plan' || false
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
    showCutoffs: function () {
      return this.waypoints.filter(wp => wp.cutoff).length
    },
    showTime: function () {
      return this.segments[this.segments.length - 1].elapsed
    },
    fields: function () {
      const f = [
        {
          key: 'name',
          class: 'text-truncate mw-7rem',
          formatter: (value, key, item) => {
            return `${item.name} [${this.$waypointTypes[item.type].short}]`
          }
        },
        {
          key: 'location',
          label: 'Loc.',
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
          key: 'len',
          label: 'Len.*',
          formatter: (value, key, item) => {
            const v = item.len(this.superSegments) * this.course.distScale
            return this.$units.distf(v, 2)
          },
          class: 'text-right'
        },
        {
          key: 'gain',
          label: 'Gain*',
          formatter: (value, key, item) => {
            const v = item.gain(this.superSegments) * this.course.gainScale
            return this.$units.altf(v, 0)
              .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
          },
          class: 'd-none d-md-table-cell d-lg-none d-xl-table-cell text-right'
        },
        {
          key: 'loss',
          label: 'Loss*',
          formatter: (value, key, item) => {
            const v = item.loss(this.superSegments) * this.course.lossScale
            return this.$units.altf(-v, 0)
              .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
          },
          class: 'd-none d-md-table-cell d-lg-none d-xl-table-cell text-right'
        }
      ]
      if (this.planAssigned) {
        if (this.showTime) {
          f.push({
            key: 'pace',
            label: 'Pace*',
            formatter: (value, key, item) => {
              const v = item.pace(this.superSegments) / this.course.distScale / this.$units.distScale
              return timeUtil.sec2string(v, '[h]:m:ss')
            },
            class: 'text-right'
          }, {
            key: 'time',
            label: 'Time*',
            formatter: (value, key, item) => {
              const v = item.time(this.superSegments)
              return timeUtil.sec2string(v, '[h]:m:ss')
            },
            class: 'text-right'
          })
        }
      }
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

      if (this.planAssigned) {
        if (this.showTime) {
          f.push({
            key: this.event.hasTOD() ? 'tod' : 'elapsed',
            label: 'Clock',
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
        if (this.$course.view === 'analyze') {
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
        if (this.plan._id && this.planOwner && !this.printing && this.$course.mode === 'edit') {
          f.push({
            key: 'delayInput',
            label: 'Delay',
            class: 'd-none',
            thClass: 'd-md-table-cell text-right',
            tdClass: 'd-md-flex inlineTableInput'
          })
        } else {
          f.push({
            key: 'delay',
            label: 'Delay',
            formatter: (value, key, item) => {
              const v = this.plan.getDelayAtWaypoint(item).delay
              if (v) {
                return timeUtil.sec2string(v, '[h]:m:ss')
              } else {
                return ''
              }
            },
            class: 'd-none d-md-table-cell text-right'
          })
        }
        if (this.$course.view === 'analyze') {
          f.push({
            key: 'actualDelay',
            label: 'Actual',
            formatter: (value, key, item) => {
              try {
                const v = item.actualDelay(this.course.points)
                return v >= 10 ? timeUtil.sec2string(v, '[h]:m:ss') : ''
              } catch (error) {
                return 'error'
              }
            },
            class: 'text-right',
            variant: 'success'
          })
        }
      }
      return f
    },

    // array of waypoint delays for input fields
    waypointDelays: function () {
      this.logger.child({ method: 'waypointDelays' }).debug('compute')
      return this.rows.map(row => this.plan.getDelayAtWaypoint(row).delay)
    },

    // array of waypoint notes for input fields
    waypointNotes: function () {
      this.logger.child({ method: 'waypointNotes' }).debug('compute')
      return this.rows.map(row => this.plan.getNoteAtWaypoint(row).text)
    }
  },
  created () {
    this.logger.debug('created')
  },
  mounted () {
    this.logger.debug('mounted')
  },
  methods: {
    selectWaypoint: function (waypoints) {
      if (!Array.isArray(waypoints)) {
        waypoints = [waypoints]
      }
      this.$refs.table.clearSelected()
      waypoints.forEach(waypoint => {
        const i = this.rows.findIndex(wp => wp === waypoint)
        this.$nextTick(() => { this.$refs.table.selectRow(i) })
      })
    },
    noteChange: async function (item, val) {
      const log = this.logger.child({ method: 'noteChange' })
      try {
        log.debug('run')
        item.text = val
        const valid = item.text.length > 0
        this.$emit('change', 'Plan.notes', item, valid)
      } catch (error) {
        log.error(error)
      }
    },
    waypointDelayChange: async function (item, val) {
      const log = this.logger.child({ method: 'waypointDelayChange' })
      try {
        item.delay = val
        const wp = this.waypoints.find(wp => wp.site._id === item._waypoint && wp.loop === item.loop)
        const valid = item.delay !== null && item.delay !== this.plan.getTypicalDelayAtWaypoint(wp)
        log.info(`delay: ${item.delay}, valid: ${valid}`)
        this.$emit('change', 'Plan.delays', item, valid)
      } catch (error) {
        log.error(error)
      }
    }
  }
}
</script>

<style>
.noPageBreakAfter{
  page-break-after: avoid;
}
.inlineTableInput {
  padding: 0.1rem !important;
  justify-content: flex-end;
}
.inlineTableInput input {
  padding: 0.05rem 0.3rem !important;
  background-image: none !important;
}
.inlineTableInput input.is-valid {
  padding: 0.05rem 0.3rem !important;
}
.b-table-details td:empty {
  display:none !important;
}
</style>
