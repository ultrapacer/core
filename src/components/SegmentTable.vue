<template>
  <b-table
    ref="table"
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
      {{ course.gain | formatAlt(units.altScale) }}
    </template>
    <template slot="FOOT_loss">
      {{ course.loss | formatAlt(units.altScale) }}
    </template>
    <template slot="FOOT_grade">&nbsp;</template>
    <template slot="FOOT_factors.tF">
      +{{ ((pacing.factors.tF - 1) * 100).toFixed(1) }}%
    </template>
    <template slot="FOOT_time">
      {{ time | formatTime }}
    </template>
    <template slot="FOOT_elapsed">
      {{ segments[segments.length - 1].elapsed | formatTime }}
    </template>
    <template slot="FOOT_pace">
      {{ pacing.pace / units.distScale | formatTime }}
    </template>
    <template slot="collapse" slot-scope="row">
      <b-button
        v-if="row.item.collapsed"
        size="sm"
        @click="expandRow(row.item)"
        class="mr-1"
      >
        &#9660;
      </b-button>
      <b-button
        v-if="!row.item.collapsed && row.item.collapseable"
        size="sm"
        @click="collapseRow(row.item)"
        class="mr-1"
      >
        &#9650;
      </b-button>
    </template>
  </b-table>
</template>

<script>
import { calcSegments } from '../../shared/utilities'
import timeUtil from '../../shared/timeUtilities'
export default {
  props: ['course', 'units', 'owner', 'pacing'],
  data () {
    return {
      clearing: false,
      displayTier: 1,
      display: []
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
  async created () {
    this.display = this.course.waypoints.filter(
      x =>
        x.type === 'start' ||
        x.tier !== 2
    ).map(x => {
      return x._id
    })
  },
  computed: {
    segments: function () {
      var breaks = []
      let wps = []
      let is = []
      let delays = []
      this.course.waypoints.forEach((x, i) => {
        if (
          x.type === 'start' ||
          x.type === 'finish' ||
          this.display.findIndex(y => x._id === y) >= 0
        ) {
          breaks.push(x.location)
          wps.push(x)
          is.push(i)
          delays.push(x.delay ? x.delay : 0)
        } else {
          delays[delays.length - 1] += (x.delay ? x.delay : 0)
        }
      })
      let arr = calcSegments(this.course.points, breaks, this.pacing)
      arr.forEach((x, i) => {
        arr[i].elapsed =
          arr[i].time +
          (i > 0 ? arr[i - 1].elapsed : 0) +
          delays[i]
        arr[i].waypoint1 = wps[i]
        arr[i].waypoint2 = wps[i + 1]
        arr[i].collapsed = false
        arr[i].collapseable = false
        if (
          arr[i].waypoint1.tier !== 2 &&
          this.course.waypoints[is[i + 1]].tier === 2
        ) {
          arr[i].collapseable = true
        }
        if (is[i + 1] - is[i] > 1) {
          arr[i].collapsed = true
        }
      })
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
      if (this.pacing.factors.tF > 1) {
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
          label: `Pace [\/${this.units.dist}]`,
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
          thClass: 'text-right',
          tdClass: 'text-right'
        })
      }
      if (this.course.waypoints.findIndex(x => x.tier > 1) >= 0) {
        f.push({
          key: 'collapse',
          label: '',
          tdClass: 'actionButtonColumn'
        })
      }
      return f
    },
    time: function () {
      if (this.segments[0].time) {
        var t = 0
        this.segments.forEach(s => { t += s.time })
        return t
      } else {
        return 0
      }
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
      while (wps[i].tier === 2) {
        this.display.push(wps[i]._id)
        i++
      }
      s.collapsed = false
    },
    collapseRow: function (s) {
      let wps = this.course.waypoints
      let i = wps.findIndex(x => s.waypoint1._id === x._id)
      i++
      while (wps[i].tier === 2) {
        let j = this.display.findIndex(x => x === wps[i]._id)
        this.display.splice(j, 1)
        i++
      }
      s.collapsed = true
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
    }
  }
}
</script>
