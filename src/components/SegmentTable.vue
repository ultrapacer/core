<template>
  <b-table
    ref="table"
    :busy="busy"
    :items="segments"
    :fields="fields"
    primary-key="waypoint1._id"
    selectable
    select-mode="single"
    @row-selected="selectRow"
    hover
    foot-clone
    small
  >
    <template slot="FOOT_waypoint1.name">&nbsp;</template>
    <template slot="FOOT_waypoint2.name">&nbsp;</template>
    <template slot="FOOT_len">
      {{ course.distance | formatDist(units.distScale) }}
    </template>
    <template slot="FOOT_end">
      {{ segments[segments.length - 1].end | formatDist(units.distScale) }}
    </template>
    <template slot="FOOT_gain">{{ gain | formatAlt(units.altScale) }}</template>
    <template slot="FOOT_loss">{{ loss | formatAlt(units.altScale) }}</template>
    <template slot="FOOT_grade">&nbsp;</template>
    <template slot="FOOT_factors.tF" v-if="pacing.factors">
      +{{ ((pacing.factors.tF - 1) * 100).toFixed(1) }}%
    </template>
    <template slot="FOOT_time">{{ time }}</template>
    <template slot="FOOT_elapsed">
      {{ segments[segments.length - 1].elapsed | formatTime }}
    </template>
    <template slot="FOOT_clock" v-if="course._plan">
      {{ sec2string(segments[segments.length - 1].tod, 'am/pm') }}
    </template>
    <template slot="FOOT_pace">
      {{ pacing.pace / units.distScale | formatTime }}
    </template>
    <template slot="collapse" slot-scope="row">
      <b-button
        v-if="row.item.collapsed"
        size="sm"
        @click="expandRow(row.item)"
        class="mr-1 tinyButton"
      >
        &#9660;
      </b-button>
      <b-button
        v-if="!row.item.collapsed && row.item.collapseable"
        size="sm"
        @click="collapseRow(row.item)"
        class="mr-1 tinyButton"
      >
        &#9650;
      </b-button>
      <div v-if="row.item.waypoint1.tier===2" style="text-align:center">
        &#8944;
      </div>
    </template>
  </b-table>
</template>

<script>
import { round } from '../../shared/utilities'
import timeUtil from '../../shared/timeUtilities'
export default {
  props: ['course', 'segments', 'units', 'pacing', 'busy', 'mode'],
  data () {
    return {
      clearing: false
    }
  },
  filters: {
    formatDist (val, distScale) {
      return (val * distScale).toFixed(2)
    },
    formatAlt (val, altScale) {
      return (val * altScale).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    },
    formatTime (val) {
      if (!val) { return '' }
      return timeUtil.sec2string(val, '[h]:m:ss')
    }
  },
  computed: {
    fields: function () {
      var f = [
        {
          key: 'end',
          label: 'Dist [' + this.units.dist + ']',
          formatter: (value, key, item) => {
            return (value * this.units.distScale).toFixed(2)
          },
          thClass: 'text-right',
          tdClass: 'text-right'
        },
        {
          key: 'gain',
          label: `Gain [${this.units.alt}]`,
          formatter: (value, key, item) => {
            let scale = 1
            if (this.course.scales) {
              scale = this.course.scales.gain
            }
            return (value * scale * this.units.altScale).toFixed(0)
              .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
          },
          thClass: 'd-none d-md-table-cell text-right',
          tdClass: 'd-none d-md-table-cell text-right'
        },
        {
          key: 'loss',
          label: 'Loss [' + this.units.alt + ']',
          formatter: (value, key, item) => {
            let scale = 1
            if (this.course.scales) {
              scale = this.course.scales.loss
            }
            return (value * scale * this.units.altScale).toFixed(0)
              .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
          },
          thClass: 'd-none d-md-table-cell text-right',
          tdClass: 'd-none d-md-table-cell text-right'
        },
        {
          key: 'grade',
          label: 'Grade',
          formatter: (value, key, item) => {
            return (value).toFixed(1) + '%'
          },
          thClass: 'd-none d-md-table-cell text-right',
          tdClass: 'd-none d-md-table-cell text-right'
        }
      ]
      if (this.mode === 'segments') {
        f.splice(1, 0, {
          key: 'len',
          label: 'Len [' + this.units.dist + ']',
          formatter: (value, key, item) => {
            return (value * this.units.distScale).toFixed(2)
          },
          thClass: 'text-right',
          tdClass: 'text-right'
        })
        f.unshift({
          key: 'waypoint2.name',
          label: 'End'
        })
        f.unshift({
          key: 'waypoint1.name',
          label: 'Start',
          thClass: 'd-none d-md-table-cell',
          tdClass: 'd-none d-md-table-cell'
        })
      }
      if (this.showTerrain) {
        f.push({
          key: 'factors.tF',
          label: 'Terrain',
          formatter: (value, key, item) => {
            return '+' + ((value - 1) * 100).toFixed(1) + '%'
          },
          thClass: 'd-none d-md-table-cell text-right',
          tdClass: 'd-none d-md-table-cell text-right'
        })
      }
      if (this.segments[0].time) {
        f.push({
          key: 'time',
          label: 'Moving Time',
          formatter: (value, key, item) => {
            return timeUtil.sec2string(value, '[h]:m:ss')
          },
          thClass: 'd-none d-md-table-cell text-right',
          tdClass: 'd-none d-md-table-cell text-right'
        })
        f.push({
          key: 'pace',
          label: `Pace [/${this.units.dist}]`,
          formatter: (value, key, item) => {
            let l = item.len * this.units.distScale
            return timeUtil.sec2string(item.time / l, '[h]:m:ss')
          },
          thClass: 'text-right',
          tdClass: 'text-right'
        })
        f.push({
          key: 'elapsed',
          label: 'Elapsed',
          formatter: (value, key, item) => {
            return timeUtil.sec2string(value, '[h]:m:ss')
          },
          thClass:
            this.segments[0].hasOwnProperty('tod')
              ? 'd-none d-md-table-cell text-right'
              : 'text-right',
          tdClass:
            this.segments[0].hasOwnProperty('tod')
              ? 'd-none d-md-table-cell text-right'
              : 'text-right'
        })
        if (this.segments[0].hasOwnProperty('tod')) {
          f.push({
            key: 'clock',
            label: 'Clock',
            formatter: (value, key, item) => {
              let c = item.tod
              return timeUtil.sec2string(c, 'am/pm')
            },
            thClass: 'text-right',
            tdClass: 'text-right'
          })
        }
      }
      if (
        this.mode === 'segments' &&
        this.course.waypoints.findIndex(x => x.tier > 1) >= 0) {
        f.push({
          key: 'collapse',
          label: '',
          tdClass: 'actionButtonColumn text-center'
        })
      }
      return f
    },
    gain: function () {
      let v = this.segments.reduce((t, x) => { return t + x.gain }, 0)
      if (this.course.scales) {
        v = v * this.course.scales.gain
      }
      return v
    },
    loss: function () {
      let v = this.segments.reduce((t, x) => { return t + x.loss }, 0)
      if (this.course.scales) {
        v = v * this.course.scales.loss
      }
      return v
    },
    time: function () {
      let t = this.segments.reduce((t, x) => { return t + x.time }, 0)
      return timeUtil.sec2string(t, '[h]:m:ss')
    },
    showTerrain: function () {
      for (let i = 0; i < this.segments.length; i++) {
        if (
          round(this.segments[i].factors.tF, 4) !==
          round(this.segments[0].factors.tF, 4)) {
          return true
        }
      }
      return false
    }
  },
  methods: {
    clear: async function () {
      this.clearing = true
      await this.$refs.table.clearSelected()
      this.clearing = false
    },
    expandRow: function (s) {
      let wps = this.course.waypoints
      let i = wps.findIndex(x => s.waypoint1._id === x._id)
      i++
      let arr = []
      while (wps[i].tier > 1) {
        if (wps[i].tier !== 3) {
          arr.push(wps[i]._id)
        }
        i++
      }
      this.$emit('show', arr)
    },
    collapseRow: function (s) {
      let wps = this.course.waypoints
      let i = wps.findIndex(x => s.waypoint1._id === x._id)
      i++
      let arr = []
      while (wps[i].tier > 1) {
        arr.push(wps[i]._id)
        i++
      }
      this.$emit('hide', arr)
    },
    selectRow: function (s) {
      if (this.clearing) return
      if (s.length) {
        this.$emit(
          'select',
          this.mode,
          [s[0].start, s[0].end]
        )
      } else {
        this.$emit('select', this.mode, [])
      }
    },
    sec2string: function (s, f) {
      return timeUtil.sec2string(s, f)
    }
  }
}
</script>
