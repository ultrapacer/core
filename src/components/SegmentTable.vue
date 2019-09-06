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
    <template slot="FOOT_gain">
      {{ segments.reduce((t, x) => {return t + x.gain}, 0) | formatAlt(units.altScale) }}<br>
    </template>
    <template slot="FOOT_loss">
      {{ course.loss | formatAlt(units.altScale) }}
    </template>
    <template slot="FOOT_grade">&nbsp;</template>
    <template slot="FOOT_factors.tF" v-if="pacing.factors">
      +{{ ((pacing.factors.tF - 1) * 100).toFixed(1) }}%
    </template>
    <template slot="FOOT_time">
      {{ movingTimeTot | formatTime }}
    </template>
    <template slot="FOOT_elapsed">
      {{ segments[segments.length - 1].elapsed | formatTime }}
    </template>
    <template slot="FOOT_clock" v-if="course._plan">
      {{ (course._plan.startTime + pacing.time) / 60 | formatTime }}
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
      <div v-if="row.item.waypoint1.tier===2" style="text-align:center">&#8944;</div>
    </template>
  </b-table>
</template>

<script>
import { calcSegments, round } from '../../shared/utilities'
import timeUtil from '../../shared/timeUtilities'
export default {
  props: ['course', 'units', 'pacing', 'busy'],
  data () {
    return {
      clearing: false,
      updateTrigger: 0
    }
  },
  filters: {
    formatDist (val, distScale) {
      return (val * distScale).toFixed(2)
    },
    formatAlt (val, altScale) {
      return (val * altScale).toFixed(0)
    },
    formatTime (val) {
      if (!val) { return '' }
      return timeUtil.sec2string(val, '[h]:m:ss')
    }
  },
  computed: {
    segments: function () {
      let t = this.$logger()
      // eslint-disable-next-line
      this.updateTrigger // hack for force recompute
      var breaks = []
      let wps = []
      this.course.waypoints.forEach((x, i) => {
        if (this.course.waypoints[i].show) {
          breaks.push(x.location)
          wps.push(x)
        }
      })
      let arr = calcSegments(this.course.points, breaks, this.pacing)
      arr.forEach((x, i) => {
        arr[i].waypoint1 = wps[i]
        arr[i].waypoint2 = wps[i + 1]
        arr[i].collapsed = false
        arr[i].collapseable = false
        let ind = this.course.waypoints.findIndex(
          x => x._id === arr[i].waypoint1._id
        )
        if (
          arr[i].waypoint1.tier === 1 &&
          this.course.waypoints.filter((x, j) =>
            j > ind &&
            j < this.course.waypoints.findIndex((x, j) =>
              j > ind && x.tier === 1
            ) &&
            x.tier === 2
          ).length
        ) {
          arr[i].collapseable = true
        }
        if (
          arr[i].collapseable &&
          arr[i].waypoint2.tier === 1
        ) {
          arr[i].collapsed = true
        }
      })
      this.$logger('compute-segments', t)
      return arr
    },
    fields: function () {
      var f = [
        {
          key: 'waypoint1.name',
          label: 'Start',
          thClass: 'd-none d-md-table-cell',
          tdClass: 'd-none d-md-table-cell'
        },
        {
          key: 'waypoint2.name',
          label: 'End'
        },
        {
          key: 'len',
          label: 'Len [' + this.units.dist + ']',
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
            return (value * this.units.altScale).toFixed(0)
          },
          thClass: 'd-none d-md-table-cell text-right',
          tdClass: 'd-none d-md-table-cell text-right'
        },
        {
          key: 'loss',
          label: 'Loss [' + this.units.alt + ']',
          formatter: (value, key, item) => {
            return (value * this.units.altScale).toFixed(0)
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
            this.course._plan.startTime
              ? 'd-none d-md-table-cell text-right'
              : 'text-right',
          tdClass:
            this.course._plan.startTime
              ? 'd-none d-md-table-cell text-right'
              : 'text-right'
        })
        if (this.course._plan.startTime) {
          f.push({
            key: 'clock',
            label: 'Clock',
            formatter: (value, key, item) => {
              let c = item.elapsed + this.course._plan.startTime
              return timeUtil.sec2string(c, 'hh:mm')
            },
            thClass: 'text-right',
            tdClass: 'text-right'
          })
        }
      }
      if (this.course.waypoints.findIndex(x => x.tier > 1) >= 0) {
        f.push({
          key: 'collapse',
          label: '',
          tdClass: 'actionButtonColumn text-center'
        })
      }
      return f
    },
    movingTimeTot: function () {
      if (this.segments[0].time) {
        var t = 0
        this.segments.forEach(s => { t += s.time })
        return t
      } else {
        return 0
      }
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
          'segment',
          [s[0].start, s[0].end]
        )
      } else {
        this.$emit('select', 'segment', [])
      }
    },
    forceSegmentUpdate: function () {
      // this is a hack because the computed property won't update
      // when this.course.waypoints[i] change
      this.updateTrigger++
    }
  }
}
</script>
