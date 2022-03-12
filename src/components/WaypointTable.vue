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
      small
      head-variant="light"
      no-border-collapse
      :class="`mb-0 table-xs${printing ? ' show-all-cells' : ''}`"
      :sticky-header="tableHeight ? tableHeight -34 + 'px' : false"
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
      </template>
    </b-table>

    <b-row
      class="mr-1 ml-1"
      style="display: flex; border-top: inset"
    >
      <div>Distance in <b>{{ $units.distance }}</b>; altitude in <b>{{ $units.altitude }}</b></div>
      <div
        v-if="$course.owner"
        style="   text-align: right; max-width: 100%;    margin-left: auto;"
      >
        <b-button
          v-if="$course.view==='edit'"
          variant="success"
          @click.prevent="$emit('newWaypoint')"
        >
          <v-icon name="plus" /><span>New Waypoint</span>
        </b-button>
      </div>
    </b-row>
  </div>
</template>

<script>
export default {
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
    printing: {
      type: Boolean,
      default: false
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
      logger: this.$log.child({ file: 'WaypointTable.vue' }),
      shiftButtons: [
        { value: -1, display: '<<<' },
        { value: -0.1, display: '<<' },
        { value: -0.01, display: '<' },
        { value: 0.01, display: '>' },
        { value: 0.1, display: '>>' },
        { value: 1, display: '>>>' }
      ]
    }
  },
  computed: {
    rows: function () {
      const arr = this.waypoints.filter(x => (
        this.$course.view === 'edit' || x.tier < 3)
      ).sort((a, b) => a.loc - b.loc)
      return arr
    },
    showTerrainType: function () {
      return this.waypoints.findIndex(wp => wp.terrainType()) >= 0
    },
    showTerrainFactor: function () {
      return this.waypoints.findIndex(wp => wp.terrainFactor()) >= 0
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
          key: 'elevation',
          label: 'Alt.',
          formatter: (value, key, item) => {
            return this.$units.altf(item.alt, 0)
              .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
          },
          class: 'd-none d-sm-table-cell text-right'
        }
      ]
      if (this.showCutoffs) {
        f.push({
          key: 'cutoff',
          label: 'Cutoff',
          formatter: (value, key, item) => {
            const v = item.cutoff
            return v === null
              ? ''
              : this.$utils.time.sec2string(v + this.event.startTime, 'am/pm')
          },
          class: 'd-none d-md-table-cell d-lg-none d-xl-table-cell text-right'
        })
      }
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
      if (this.$course.view === 'edit') {
        f.push({
          key: 'actions',
          label: '',
          tdClass: 'actionButtonColumn'
        })
      }
      return f
    },
    showCutoffs: function () {
      return this.waypoints.filter(wp => wp.cutoff).length
    }
  },
  watch: {
    visible: function (val) {
      if (!val) this.collapseAll()
    }
  },
  created () {
    this.rows.forEach(r => {
      this.$set(r, '_showDetails', false)
    })
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
        if (show) {
          this.$set(item, '_showDetails', true)
          this.$nextTick(() => { this.$refs.table.selectRow(this.rows.findIndex(row => row === item)) })
        }
      } catch (error) {
        this.logger.child({ method: 'toggleRowDetails' }).error(error)
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
    }
  }
}
</script>
