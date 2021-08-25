<template>
  <b-table
    ref="table"
    :items="rows"
    :fields="fields"
    primary-key="site._id+'_'loop"
    hover
    selectable
    select-mode="single"
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
        @click="editFn(row.item.site)"
      >
        <v-icon name="edit" />
        <span class="d-none d-xl-inline">Edit</span>
      </b-button>
      <b-button
        v-if="row.item.type() !== 'start' && row.item.type() !== 'finish'"
        class="mr-1"
        @click="delFn(row.item.site)"
      >
        <v-icon name="trash" />
        <span class="d-none d-xl-inline">Delete</span>
      </b-button>
    </template>
    <template #row-details="row">
      <b-card v-if="editing">
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
              @click="shiftWaypoint(row.item, sb.value)"
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
              v-if="Boolean(course.eventStart)"
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
              <b-form-input
                v-model="waypointDelayF"
                v-mask="'##:##:##'"
                type="text"
                min="0"
                placeholder="hh:mm:ss"
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
export default {
  props: {
    course: {
      type: Object,
      required: true
    },
    editing: {
      type: Boolean,
      default: false
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
      waypointDelayF: '' // formatted string delay for current waypoint
    }
  },
  computed: {
    rows: function () {
      return this.waypoints.filter(x => (this.editing && (x.loop === 1 || x.type() === 'finish')) || (!this.editing && x.tier() < 3)).sort((a, b) => a.loc() - b.loc())
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
    showDelay: function () {
      return Boolean(this.planAssigned && (this.plan.waypointDelay || (this.plan.waypointDelays && this.plan.waypointDelays.length > 0)))
    },
    fields: function () {
      const f = [
        {
          key: 'name',
          class: 'text-truncate mw-7rem',
          formatter: (value, key, item) => {
            return item.name()
          }
        },
        {
          key: 'type',
          formatter: (value, key, item) => {
            return this.$waypointTypes[item.type()]
          },
          class: 'd-none d-md-table-cell'
        },
        {
          key: 'location',
          label: `Loc. [${this.$units.dist}]`,
          formatter: (value, key, item) => {
            if (this.editing && item.type() === 'finish') {
              return this.$units.distf(this.course.distance, 2)
            } else {
              return this.$units.distf(item.loc(), 2)
            }
          },
          class: 'text-right'
        },
        {
          key: 'elevation',
          label: `Elev. [${this.$units.alt}]`,
          formatter: (value, key, item) => {
            return this.$units.altf(item.alt(), 0)
              .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
          },
          class: 'd-none d-sm-table-cell text-right'
        }
      ]
      if (this.showTerrainType && this.editing) {
        f.push({
          key: 'terrainType',
          label: 'Terrain',
          formatter: (value, key, item) => {
            if (item.type() === 'finish') { return '' }
            return item.terrainType(this.waypoints) || ''
          },
          class: 'd-none d-lg-table-cell text-right'
        })
      }
      if (this.showTerrainFactor && this.editing) {
        f.push({
          key: 'terrainFactor',
          label: 'Factor',
          formatter: (value, key, item) => {
            if (item.type() === 'finish') { return '' }
            const v = item.terrainFactor(this.waypoints) || 0
            return `+${v}%`
          },
          class: 'd-none d-lg-table-cell text-center'
        })
      }
      if (this.editing) {
        f.push({
          key: 'actions',
          label: '',
          tdClass: 'actionButtonColumn'
        })
      } else {
        if (this.segments.length && this.segments[0].time) {
          f.push({
            key: 'time',
            label: 'Time',
            formatter: (value, key, item) => {
              try {
                if (this.rows.findIndex(r => r.site._id === item.site._id && r.loop === item.loop) === 0) {
                  const s = this.segments[0]
                  if (s.tod !== undefined) {
                    return timeUtil.sec2string(s.tod - s.elapsed, 'am/pm')
                  } else {
                    return timeUtil.sec2string(0, '[h]:m:ss')
                  }
                } else {
                  const s = this.segments.find(s => s.waypoint.site._id === item.site._id && s.waypoint.loop === item.loop)
                  if (s.tod !== undefined) {
                    return timeUtil.sec2string(s.tod, 'am/pm')
                  } else {
                    return timeUtil.sec2string(s.elapsed, '[h]:m:ss')
                  }
                }
              } catch (err) {
                console.log(err)
                return ''
              }
            },
            class: 'text-right'
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
        }
      }
      return f
    },
    waypointDelay: function () {
      if (!this.waypointDelayF || this.waypointDelayF.length !== 8) {
        return null
      } else {
        return timeUtil.string2sec(this.waypointDelayF)
      }
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
    }
  },
  watch: {
    editing: function (val) {
      // hide details fields when editing is turned off
      if (val === false) {
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
    toggleRowDetails: function (item) {
      try {
        if ((item.type() === 'start' && item.loop === 1) || item.type() === 'finish') return

        // curent visible state:
        const show = !item._showDetails

        // hide other rows showing details:
        this.rows.filter(r => r._showDetails).forEach(r => {
          this.$set(r, '_showDetails', false)
        })

        const planReady = this.planAssigned && this.plan._user === this.$user._id

        if (show && (this.editing || planReady)) {
          this.$set(item, '_showDetails', true)
          this.currentWaypoint = item
          if (!this.editing && planReady) {
          // set waypoint delay inputs:
            const wpd = this.plan.waypointDelays.find(wpd => wpd.site === item.site._id && wpd.loop === item.loop)
            this.waypointDelayF = null
            this.waypointDelayCustom = Boolean(wpd)
            this.waypointDelayTypical = item.hasTypicalDelay() ? this.plan.waypointDelay : 0
            if (wpd) {
              this.waypointDelayF = timeUtil.sec2string(wpd.delay, 'hh:mm:ss')
            } else if (this.plan.waypointDelay && item.hasTypicalDelay()) {
              this.waypointDelayF = timeUtil.sec2string(this.plan.waypointDelay, 'hh:mm:ss')
            }
          }
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
      let loc = item.site.location + delta / this.$units.distScale
      if (loc < 0.01 / this.$units.distScale) {
        loc = 0.01
      } else if (loc >= this.course.distance) {
        loc = this.course.distance - (0.01 / this.$units.distScale)
      }
      this.$emit('updateWaypointLocation', item.site, loc)
    },
    selectWaypoint: function (id) {
      const i = this.rows.findIndex(x => x._id === id)
      this.$refs.table.selectRow(i)
    },
    waypointDelayClear: function (item) {
      this.$emit('updateWaypointDelay', item, null)
      this.waypointDelayF = timeUtil.sec2string(this.plan.waypointDelay, 'hh:mm:ss')
    },
    waypointDelayChange: function (item) {
      this.$emit('updateWaypointDelay', item, this.waypointDelay)
    }
  }
}
</script>
