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
    class="segment-table"
  >
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
    <template v-slot:row-details="row">
      <b-list-group
        v-bind:class="(hasDetailedInfo(row.item)) ? 'pt-1' : 'd-md-none pt-1'"
      >
        <b-list-group-item
          v-bind:class="detailsFields.length ? '' : 'd-md-none'"
        >
          <b-row
            v-for="f in fields"
            v-bind:key="f.key"
            v-if="!mobileFields.includes(f.key) && !(hideOneFields.includes(f.key) && round(f.value, 4) === 1)"
            v-bind:class="detailsFields.includes(f.key) ? 'mb-1' : 'mb-1 d-md-none'"
          >
            <b-col cols="4" class="text-right"><b>{{ f.label }}:</b></b-col>
            <b-col v-if="f.formatter">{{ f.formatter(parseField(row.item, f.key), f.key, row.item) }}</b-col>
          </b-row>
        </b-list-group-item>
        <b-list-group-item
          v-for="wp in spannedWaypoints(row.item)"
          v-bind:key="wp._id"
          v-if="wp.tier < 3 && (waypointDelay(wp) || wp.description)"
          class="mb-1">
          <b>{{ wp.name }} ({{ $waypointTypes[wp.type] }}), {{ wp.location | formatDist(units.distScale) }} {{ units.dist }}</b><br/>
          <b-row               v-if="waypointDelay(wp)"            >
            <b-col cols="4" class="text-sm-right"><b>Delay:</b></b-col>
            <b-col>{{ waypointDelay(wp) / 60 }} minutes</b-col>
          </b-row>
          <b-row v-if="wp.description">
            <b-col cols="4" class="text-right"><b>Notes:</b></b-col>
            <b-col style="white-space:pre-wrap">{{ wp.description }}</b-col>
          </b-row>
        </b-list-group-item>
      </b-list-group>
    </template>
  </b-table>
</template>

<script>
import { round } from '../util/math'
import timeUtil from '../util/time'
export default {
  props: ['course', 'segments', 'units', 'pacing', 'busy', 'mode'],
  data () {
    return {
      clearing: false,
      visibleTrigger: 0,
      hideOneFields: ['factors.dark']
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
    detailsFields: function () {
      let f = []
      if (this.showTerrain) { f.push('factors.tF') }
      if (this.showDark) { f.push('factors.dark') }
      return f
    },
    mobileFields: function () {
      if (this.mode === 'splits') {
        if (this.pacing.time) {
          return ['end', 'gain', 'loss', 'pace', 'collapse']
        } else {
          return ['end', 'gain', 'loss', 'collapse']
        }
      } else {
        if (this.pacing.time) {
          return ['waypoint2.name', 'len', 'elapsed', 'collapse']
        } else {
          return ['waypoint2.name', 'len', 'gain', 'loss', 'collapse']
        }
      }
    },
    fields: function () {
      var f = [
        {
          key: 'end',
          label: 'Dist [' + this.units.dist + ']',
          formatter: (value, key, item) => {
            return (value * this.units.distScale).toFixed(2)
          }
        },
        {
          key: 'gain',
          label: `Gain [${this.units.alt}]`,
          formatter: (value, key, item) => {
            let scale = 1
            if (this.pacing.scales) {
              scale = this.pacing.scales.gain
            }
            return (value * scale * this.units.altScale).toFixed(0)
              .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
          }
        },
        {
          key: 'loss',
          label: 'Loss [' + this.units.alt + ']',
          formatter: (value, key, item) => {
            let scale = 1
            if (this.pacing.scales) {
              scale = this.pacing.scales.loss
            }
            return (value * scale * this.units.altScale).toFixed(0)
              .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
          }
        },
        {
          key: 'grade',
          label: 'Grade',
          formatter: (value, key, item) => {
            return (value).toFixed(1) + '%'
          }
        }
      ]
      if (this.mode === 'segments') {
        f.splice(1, 0, {
          key: 'len',
          label: 'Len [' + this.units.dist + ']',
          formatter: (value, key, item) => {
            return (value * this.units.distScale).toFixed(2)
          }
        })
        f.unshift({
          key: 'waypoint2.name',
          label: 'End'
        })
      }
      if (this.showTerrain) {
        f.push({
          key: 'factors.tF',
          label: 'Terrain',
          formatter: (value, key, item) => {
            return '+' + ((value - 1) * 100).toFixed(1) + '%'
          }
        })
      }
      if (this.showDark) {
        f.push({
          key: 'factors.dark',
          label: 'Darkness',
          formatter: (value, key, item) => {
            return '+' + ((value - 1) * 100).toFixed(1) + '%'
          }
        })
      }
      if (this.segments[0].time) {
        if (this.mode === 'segments') {
          f.push({
            key: 'time',
            label: 'Moving Time',
            formatter: (value, key, item) => {
              return timeUtil.sec2string(value, '[h]:m:ss')
            }
          })
        }
        f.push({
          key: 'pace',
          label: `Pace [/${this.units.dist}]`,
          formatter: (value, key, item) => {
            let l = item.len * this.units.distScale
            return timeUtil.sec2string(item.time / l, '[h]:m:ss')
          }
        })
        f.push({
          key: 'elapsed',
          label: 'Elapsed',
          formatter: (value, key, item) => {
            return timeUtil.sec2string(value, '[h]:m:ss')
          }
        })
        if (this.showClock) {
          f.push({
            key: 'tod',
            label: 'Arrival',
            formatter: (value, key, item) => {
              return timeUtil.sec2string(value, 'am/pm')
            }
          })
        }
      }
      f.forEach((x, i) => {
        f[i].thClass = this.getClass(x.key)
        f[i].tdClass = f[i].thClass
      })
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
      if (this.pacing.scales) {
        v = v * this.pacing.scales.gain
      }
      return v
    },
    loss: function () {
      let v = this.visibleSegments.reduce((t, x) => { return t + x.loss }, 0)
      if (this.pacing.scales) {
        v = v * this.pacing.scales.loss
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
    showDark: function () {
      return this.pacing.factors.dark > 1
    },
    showClock: function () {
      return this.segments[0].hasOwnProperty('tod') && this.segments[0].tod !== null
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
          start: arr[i].start,
          end: this.rollup(subs, s, 'last', 'end'),
          len: this.rollup(subs, s, 'sum', 'len'),
          gain: this.rollup(subs, s, 'sum', 'gain'),
          loss: this.rollup(subs, s, 'sum', 'loss'),
          grade: this.rollup(subs, s, 'weightedAvg', 'grade'),
          factors: {...s.factors}
        }
        seg.factors.tF = this.rollup(subs, s, 'weightedAvg', 'factors.tF')
        seg.factors.dark = this.rollup(subs, s, 'weightedAvg', 'factors.dark')
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
    getClass: function (key) {
      let lefts = ['waypoint2.name']
      let base = lefts.includes(key) ? '' : 'text-right'
      if (this.mobileFields.includes(key)) {
        return base
      } else {
        if (this.detailsFields.includes(key)) {
          return `d-none`
        } else {
          return `d-none d-md-table-cell ${base}`
        }
      }
    },
    clear: async function () {
      this.clearing = true
      await this.$refs.table.clearSelected()
      this.segments.filter(s => s._showDetails)
        .forEach(s => { this.$set(s, '_showDetails', false) })
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
    selectRow: function (segment) {
      if (this.clearing) return
      if (segment.length) {
        this.visibleSegments.filter(s => s._showDetails && s.start !== segment.start)
          .forEach(s => { this.$set(s, '_showDetails', false) })
        this.$set(segment[0], '_showDetails', !segment._showDetails)
        this.$emit(
          'select',
          this.mode,
          [segment[0].start, segment[0].end]
        )
      } else {
        this.visibleSegments.filter(s => s._showDetails)
          .forEach(s => { this.$set(s, '_showDetails', false) })
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
    },
    spannedWaypoints: function (s) {
      let wps = this.course.waypoints.filter(wp =>
        round(wp.location, 4) > round(s.start, 4) &&
        round(wp.location, 4) <= round(s.end, 4)
      )
      return wps
    },
    hasDetailedInfo: function (s) {
      return (
        this.factors.dark > 1 ||
        this.showTerrain ||
        this.spannedWaypoints(s).filter(
          wp =>
            wp.description ||
            this.waypointDelay(wp)
        ).length > 0
      )
    },
    waypointDelay: function (wp) {
      let d = this.pacing.delays.find(d =>
        round(d.loc, 4) === round(wp.location, 4)
      )
      return (d) ? d.delay : 0
    }
  }
}
</script>
