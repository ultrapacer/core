<template>
  <b-table
    ref="table"
    :busy="busy"
    :items="rows"
    :fields="fields"
    primary-key="_index"
    selectable
    select-mode="single"
    hover
    foot-clone
    small
    class="segment-table"
    @row-clicked="selectRow"
  >
    <template #foot(name)>
&nbsp;
    </template>
    <template #foot(len)>
      {{ $units.distf(course.distance, 2) }}
    </template>
    <template #foot(end)>
      {{ $units.distf(course.distance, 2) }}
    </template>
    <template #foot(gain)>
      {{ $units.altf(course.gain, 0) | commas }}
    </template>
    <template #foot(loss)>
      {{ $units.altf(course.loss, 0) | commas }}
    </template>
    <template #foot(grade)>
&nbsp;
    </template>
    <template #foot(time)>
      {{ time }}
    </template>
    <template #foot(elapsed)>
      {{ segments[segments.length - 1].elapsed | formatTime }}
    </template>
    <template #foot(actualElapsed)>
      {{ segments[segments.length - 1].actualElapsed | formatTime }}
    </template>
    <template #foot(tod)>
      {{ sec2string(segments[segments.length - 1].tod, 'am/pm') }}
    </template>
    <template #foot(pace)>
      {{ $units.pacef(pacing.pace) | formatTime }}
    </template>
    <template
      v-if="mode==='segments'"
      #cell(collapse)="row"
    >
      <b-button
        v-if="isCollapsed(row.item)"
        size="sm"
        class="mr-1 tinyButton"
        @click="expandRow(row.item)"
      >
        &#9660;
      </b-button>
      <b-button
        v-else-if="isCollapseable(row.item)"
        size="sm"
        class="mr-1 tinyButton"
        @click="collapseRow(row.item)"
      >
        &#9650;
      </b-button>
      <div
        v-else-if="isChild(row.item)"
        style="text-align:center"
      >
        &#8944;
      </div>
    </template>
    <template #row-details="row">
      <b-list-group
        :class="(spannedWaypoints(getSegment(row.item)).length || hasFactors(row.item)) ? 'pt-1' : 'd-md-none pt-1'"
      >
        <b-list-group-item
          class="d-md-none"
        >
          <b-row
            v-for="f in fields.filter(f=>!mobileFields.includes(f.key))"
            :key="f.key"
            class="mb-1 d-md-none"
          >
            <b-col
              cols="4"
              class="text-right"
            >
              <b>{{ f.label }}:</b>
            </b-col>
            <b-col v-if="f.formatter">
              {{ f.formatter(parseField(row.item, f.key), f.key, row.item) }}
            </b-col>
          </b-row>
        </b-list-group-item>

        <b-list-group-item
          v-for="wp in spannedWaypoints(getSegment(row.item))"
          :key="wp._id"
        >
          <b>{{ wp.name }} ({{ $waypointTypes[wp.type] }}), {{ $units.distf(wp.location, 2) }} {{ $units.dist }}</b><br>
          <b-row v-if="waypointDelay(wp)">
            <b-col
              cols="4"
              class="text-sm-right"
            >
              <b>Delay:</b>
            </b-col>
            <b-col>{{ waypointDelay(wp) / 60 }} minutes</b-col>
          </b-row>
          <b-row v-if="wp.description">
            <b-col
              cols="4"
              class="text-right"
            >
              <b>Notes:</b>
            </b-col>
            <b-col style="white-space:pre-wrap">
              {{ wp.description }}
            </b-col>
          </b-row>
        </b-list-group-item>

        <b-list-group-item
          v-if="hasFactors(row.item)"
          class="d-none d-md-block"
        >
          <b>Pacing Factors</b><br>
          <b-row
            v-for="factor in getFactors(row.item)"
            :key="factor.name"
            class="mb-1"
          >
            <b-col
              cols="4"
              class="text-right"
            >
              <b>{{ factorLables[factor.name] }}:</b>
            </b-col>
            <b-col>{{ formatPaceTimePercent(factor.value, row.item) }}</b-col>
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
  filters: {
    commas (val) {
      return val.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    },
    formatTime (val) {
      if (!val) { return '' }
      return timeUtil.sec2string(val, '[h]:m:ss')
    }
  },
  props: {
    course: {
      type: Object,
      required: true
    },
    segments: {
      type: Array,
      required: true
    },
    pacing: {
      type: Object,
      required: true
    },
    busy: {
      type: Boolean,
      default: false
    },
    mode: {
      type: String,
      required: true
    },
    showActual: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      clearing: false,
      visibleTrigger: 0,
      factorLables: { gF: 'Grade', tF: 'Terrain', aF: 'Altitude', hF: 'Heat', dF: 'Drift', dark: 'Darkness' },
      visibleSubWaypoints: []
    }
  },
  computed: {
    rows: function () {
      let arr = this.segments.map((s, i) => { return { _index: i } })
      if (this.mode === 'segments') {
        arr = arr.filter((r, i) =>
          this.segments[i].waypoint2.tier === 1 ||
          this.visibleSubWaypoints.findIndex(vi => vi === i) >= 0
        )
      }
      return arr
    },
    planAssigned: function () {
      return Boolean(this.pacing.time)
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
          return ['name', 'len', 'elapsed', 'collapse']
        } else {
          return ['name', 'len', 'gain', 'loss', 'collapse']
        }
      }
    },
    fields: function () {
      const f = [
        {
          key: 'end',
          label: 'Dist [' + this.$units.dist + ']',
          formatter: (value, key, item) => {
            return this.$units.distf(this.rollup(item, key, 'last'), 2)
          }
        },
        {
          key: 'gain',
          label: `Gain [${this.$units.alt}]`,
          formatter: (value, key, item) => {
            let scale = 1
            if (this.pacing.scales) {
              scale = this.pacing.scales.gain
            }
            return this.$units.altf(this.rollup(item, key, 'sum') * scale, 0)
              .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
          }
        },
        {
          key: 'loss',
          label: 'Loss [' + this.$units.alt + ']',
          formatter: (value, key, item) => {
            let scale = 1
            if (this.pacing.scales) {
              scale = this.pacing.scales.loss
            }
            return this.$units.altf(this.rollup(item, key, 'sum') * scale, 0)
              .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
          }
        },
        {
          key: 'grade',
          label: 'Grade',
          formatter: (value, key, item) => {
            const gs = this.pacing.scales ? this.pacing.scales.gain : 1
            const ls = this.pacing.scales ? this.pacing.scales.loss : 1
            const g = (this.rollup(item, 'gain', 'sum') * gs + this.rollup(item, 'loss', 'sum') * ls) / this.rollup(item, 'len', 'sum') / 10
            return (g).toFixed(1) + '%'
          }
        }
      ]
      if (this.mode === 'segments') {
        f.splice(1, 0, {
          key: 'len',
          label: 'Len [' + this.$units.dist + ']',
          formatter: (value, key, item) => {
            return this.$units.distf(this.rollup(item, key, 'sum'), 2)
          }
        })
        f.unshift({
          key: 'name',
          label: 'End',
          formatter: (value, key, item) => {
            return this.rollup(item, 'waypoint2.name', 'last')
          }
        })
      }
      if (this.planAssigned) {
        if (this.mode === 'segments') {
          f.push({
            key: 'time',
            label: 'Moving Time',
            formatter: (value, key, item) => {
              return timeUtil.sec2string(this.rollup(item, key, 'sum'), '[h]:m:ss')
            }
          })
        }
        f.push({
          key: 'pace',
          label: `Pace [/${this.$units.dist}]`,
          formatter: (value, key, item) => {
            const l = this.$units.distf(this.rollup(item, 'len', 'sum'))
            return timeUtil.sec2string(this.rollup(item, 'time', 'sum') / l, '[h]:m:ss')
          }
        })
        f.push({
          key: 'elapsed',
          label: 'Elapsed',
          formatter: (value, key, item) => {
            return timeUtil.sec2string(this.rollup(item, key, 'sum'), '[h]:m:ss')
          }
        })
        if (this.showActual) {
          f.push({
            key: 'actualElapsed',
            label: 'Actual',
            formatter: (value, key, item) => {
              return timeUtil.sec2string(this.rollup(item, key, 'sum'), '[h]:m:ss')
            }
          })
        }
        if (this.showClock) {
          f.push({
            key: 'tod',
            label: 'Arrival',
            formatter: (value, key, item) => {
              return timeUtil.sec2string(this.rollup(item, key, 'last'), 'am/pm')
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
    time: function () {
      const t = this.segments.reduce((t, x) => { return t + x.time }, 0)
      return timeUtil.sec2string(t, '[h]:m:ss')
    },
    actualMovingTime: function () {
      if (this.showActual) {
        const t = this.segments.reduce((t, x) => { return t + x.actualElapsed }, 0)
        return timeUtil.sec2string(t, '[h]:m:ss')
      } else {
        return 0
      }
    },
    showClock: function () {
      return this.segments[0].tod !== null
    },
    collapseableIds: function () {
      return this.segments.filter((s, i) =>
        i < this.segments.length - 1 &&
        s.waypoint1.tier === 1 &&
        this.segments[i + 1].waypoint1.tier > 1
      ).map(s => { return s.waypoint1._id })
    }
  },
  watch: {
    segments: function (val) {
      this.visibleSubWaypoints = []
    }
  },
  methods: {
    getSegment: function (row, field = null) {
      // return the segment object/field associated with a row
      const s = this.segments[row._index]
      return (field) ? this.parseField(s, field) : s
    },
    getFactors: function (row) {
      const fs = []
      Object.keys(this.factorLables).forEach(k => {
        const f = this.rollup(row, `factors.${k}`, 'weightedAvg')
        if (round(f, 4) !== 1) {
          fs.push({
            name: k,
            value: f
          })
        }
      })
      return fs
    },
    getClass: function (key) {
      // return class of cell in table for each key
      const lefts = ['name']
      const base = lefts.includes(key) ? '' : 'text-right'
      if (this.mobileFields.includes(key)) {
        return base
      } else {
        return `d-none d-md-table-cell ${base}`
      }
    },
    isCollapsed: function (row) {
      const ri = this.rows.findIndex(r => r._index === row._index)
      return ((ri === 0 && row._index > 0) || (ri > 0 && row._index - this.rows[ri - 1]._index > 1))
    },
    isCollapseable: function (row) {
      return row._index === 0 ? false : this.segments[row._index - 1].waypoint2.tier === 2
    },
    isChild: function (row) {
      return this.segments[row._index].waypoint2.tier === 2
    },
    clear: async function () {
      this.clearing = true
      await this.$refs.table.clearSelected()
      this.segments.filter(s => s._showDetails)
        .forEach(s => { this.$set(s, '_showDetails', false) })
      this.clearing = false
    },
    expandRow: function (row) {
      const ri = this.rows.findIndex(r => r._index === row._index)
      const prev = (ri > 0) ? this.rows[ri - 1]._index : -1
      const wps = []
      this.segments.forEach((s, i) => {
        if (i > prev && i < row._index) {
          this.visibleSubWaypoints.push(i)
          wps.push(s.waypoint2._id)
        }
      })
      this.$emit('show', wps)
    },
    collapseRow: function (row) {
      let prev
      for (prev = row._index - 1; prev >= 0; prev--) {
        if (prev < 0) { break } else if (this.segments[prev].waypoint2.tier === 1) { break }
      }
      const wps = []
      this.segments.forEach((s, i) => {
        if (i > prev && i < row._index) {
          this.visibleSubWaypoints = this.visibleSubWaypoints.filter(vi => vi !== i)
          wps.push(s.waypoint2._id)
        }
      })
      this.$emit('hide', wps)
    },
    selectRow: function (row) {
      this.rows.filter((r, i) => r._index !== row._index).forEach(r => {
        this.$set(r, '_showDetails', false)
      })
      this.$set(row, '_showDetails', !row._showDetails)
      this.$emit(
        'select',
        this.mode,
        [this.rollup(row, 'start', 'first'), this.getSegment(row, 'end')]
      )
      if (!row._showDetails) {
        this.$emit('select', this.mode, [])
      }
    },
    rollup: function (row, field, method) {
      const ri = this.rows.findIndex(r => r._index === row._index)
      if (
        this.mode === 'segments' &&
        ((ri === 0 && row._index > 0) ||
        (ri > 0 && row._index - this.rows[ri - 1]._index > 1))
      ) {
        const prev = (ri > 0) ? this.rows[ri - 1]._index : -1
        const subs = this.segments.filter((s, i) => i > prev && i <= row._index)
        switch (method) {
          case 'sum': {
            return subs.reduce((v, x) => { return v + this.parseField(x, field) }, 0)
          }
          case 'first': {
            return this.parseField(subs[0], field)
          }
          case 'last': {
            return this.parseField(subs[subs.length - 1], field)
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
      } else {
        return this.getSegment(row, field)
      }
    },
    parseField: function (obj, field) {
      const arr = field.split('.')
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
    round: function (v, t) {
      return round(v, t)
    },
    spannedWaypoints: function (s) {
      return this.course.waypoints.filter(wp =>
        round(wp.location, 4) > round(s.start, 4) &&
        round(wp.location, 4) <= round(s.end, 4) && (
          wp.description ||
        this.waypointDelay(wp))
      )
    },
    waypointDelay: function (wp) {
      const d = this.pacing.delays.find(d =>
        round(d.loc, 4) === round(wp.location, 4)
      )
      return (d) ? d.delay : 0
    },
    formatPaceTimePercent (f, item) {
      const df = f - 1
      const sign = f - 1 > 0 ? '+' : '-'
      let str = `${sign}${(Math.abs(df) * 100).toFixed(1)}%`
      if (this.planAssigned) {
        const time = this.rollup(item, 'time', 'sum')
        const len = this.rollup(item, 'len', 'sum')
        const pace = time / len
        const dTime = Math.abs(time * (1 - 1 / f) / this.$units.distScale)
        const dPace = Math.abs(pace * (1 - 1 / f) / this.$units.distScale)
        const paceStr = `[${sign}${timeUtil.sec2string(dPace, '[h]:m:ss')}/${this.$units.dist}] `
        str = `${sign}${timeUtil.sec2string(dTime, '[h]:m:ss')} ${paceStr}[${str}]`
      }
      return str
    },
    hasFactors (item) {
      const segment = this.getSegment(item)
      let res = false
      Object.keys(segment.factors).forEach(k => {
        if (round(segment.factors[k], 4) !== 1) {
          res = true
        }
      })
      return res
    }
  }
}
</script>
