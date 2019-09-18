<template>
  <b-table
    ref="table"
    :busy="busy"
    :items="visibleSegments"
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
    <template slot="FOOT_tod">
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
      clearing: false,
      visibleTrigger: 0
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
            this.showClock
              ? 'd-none d-md-table-cell text-right'
              : 'text-right',
          tdClass:
            this.showClock
              ? 'd-none d-md-table-cell text-right'
              : 'text-right'
        })
        if (this.showClock) {
          f.push({
            key: 'tod',
            label: 'Clock',
            formatter: (value, key, item) => {
              return timeUtil.sec2string(value, 'am/pm')
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
      let v = this.visibleSegments.reduce((t, x) => { return t + x.gain }, 0)
      if (this.course.scales) {
        v = v * this.course.scales.gain
      }
      return v
    },
    loss: function () {
      let v = this.visibleSegments.reduce((t, x) => { return t + x.loss }, 0)
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
    },
    showClock: function () {
      return this.segments[0].hasOwnProperty('tod')
    },
    collapseableIds: function () {
      return this.segments.filter((s, i) =>
        i < this.segments.length - 1 &&
        s.waypoint1.tier === 1 &&
        this.segments[i + 1].waypoint1.tier > 1
      ).map(s => { return s.waypoint1._id })
    },
    visibleSegments: function () {
      // eslint-disable-next-line
      this.visibleTrigger++
      if (this.mode === 'splits') {
        return this.segments
      }
      let t = this.$logger()
      let arr = this.segments.filter(x => x.waypoint1.show)
      let arr2 = []
      arr.forEach((s, i) => {
        let subs = this.subSegments(s)
        let seg = {
          collapseable: this.collapseableIds.includes(s.waypoint1._id),
          collapsed: subs.length > 1,
          waypoint1: arr[i].waypoint1,
          waypoint2: this.rollup(subs, arr[i], 'last', 'waypoint2'),
          end: this.rollup(subs, s, 'last', 'end'),
          len: this.rollup(subs, s, 'sum', 'len'),
          gain: this.rollup(subs, s, 'sum', 'gain'),
          loss: this.rollup(subs, s, 'sum', 'loss'),
          grade: this.rollup(subs, s, 'weightedAvg', 'grade'),
          factors: {...s.factors}
        }
        seg.factors.tF = this.rollup(subs, s, 'weightedAvg', 'factors.tF')
        if (s.time) {
          seg.time = this.rollup(subs, s, 'sum', 'time')
          seg.pace = seg.time / seg.len
          seg.elapsed = this.rollup(subs, s, 'last', 'elapsed')
        }
        if (this.showClock) {
          seg.tod = this.rollup(subs, s, 'last', 'tod')
        }
        arr2.push(seg)
      })
      this.$logger('SegmentTable|visibleSegments', t)
      return arr2
    }
  },
  methods: {
    clear: async function () {
      this.clearing = true
      await this.$refs.table.clearSelected()
      this.clearing = false
    },
    expandRow: function (s) {
      let subs = this.subSegments(s)
      subs.splice(0, 1)
      let arr = subs.map(x => { return x.waypoint1._id })
      this.$emit('show', arr)
      this.visibleTrigger++
    },
    collapseRow: function (segment) {
      let ind = this.segments.findIndex(
        s => s.waypoint1._id === segment.waypoint1._id
      )
      let next = this.segments.findIndex((x, j) =>
        j > ind && x.waypoint1.tier === 1
      )
      let subs = this.segments.filter((x, j) =>
        j > ind && (next < 0 || j < next)
      )
      let arr = subs.map(x => { return x.waypoint1._id })
      this.$emit('hide', arr)
      this.visibleTrigger++
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
    subSegments: function (segment) {
      let ind = this.segments.findIndex(
        s => s.waypoint1._id === segment.waypoint1._id
      )
      let next = this.segments.findIndex((x, j) =>
        j > ind && x.waypoint1.show
      )
      return this.segments.filter((x, j) =>
        j >= ind && (next < 0 || j < next)
      )
    },
    rollup: function (subs, segment, method, field) {
      switch (method) {
        case 'sum': {
          return subs.reduce((v, x) => { return v + x[field] }, 0)
        }
        case 'last': {
          return subs[subs.length - 1][field]
        }
        case 'weightedAvg': {
          let v = 0
          let t = 0
          subs.forEach(s => {
            v += s.len * this.parseField(s, field)
            t += s.len
          })
          return v / t
        }
      }
    },
    parseField: function (obj, field) {
      let arr = field.split('.')
      switch (arr.length) {
        case 1:
          return obj[field]
        case 2:
          return obj[arr[0]][arr[1]]
      }
    },
    sec2string: function (s, f) {
      return timeUtil.sec2string(s, f)
    }
  }
}
</script>
