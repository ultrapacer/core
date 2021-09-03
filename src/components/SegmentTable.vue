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
    head-variant="light"
    no-border-collapse
    :class="`mb-0 table-xs${printing ? ' show-all-cells' : ''}`"
    :sticky-header="tableHeight ? tableHeight + 'px' : false"
    @row-clicked="selectRow"
  >
    <template #foot(name)>
      &nbsp;
    </template>
    <template #foot(len)>
      {{ $units.distf(course.totalDistance(), 2) }}
    </template>
    <template #foot(end)>
      {{ $units.distf(course.totalDistance(), 2) }}
    </template>
    <template #foot(gain)>
      {{ $units.altf(course.totalGain(), 0) | commas }}
    </template>
    <template #foot(loss)>
      {{ $units.altf(course.totalLoss(), 0) | commas }}
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
      {{ sec2string(segments[segments.length - 1].elapsed + event.startTime, 'am/pm') }}
    </template>
    <template #foot(pace)>
      {{ $units.pacef(plan.pacing.pace) | formatTime }}
    </template>
    <template
      v-if="mode==='segments'"
      #cell(collapse)="row"
    >
      <b-button
        v-if="isCollapsed(row.item)"
        class="collapse-button mr-1"
        @click="expandRow(row.item)"
      >
        &#9660;
      </b-button>
      <b-button
        v-else-if="isCollapseable(row.item)"
        class="collapse-button mr-1"
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
      <b-list-group>
        <!--
        :class="(spannedWaypoints(getSegment(row.item)).length || hasFactors(row.item)) ? 'pt-1' : 'd-md-none pt-1'"
        -->
        <b-list-group-item
          :class="`d-${minFieldsSize}-none`"
        >
          <b-row
            v-for="f in fields.filter(f=>Boolean(fieldsInTable[f.key]))"
            :key="f.key"
            :class="`mb-1 d-${fieldsInTable[f.key]}-none`"
          >
            <b-col
              cols="4"
              class="text-right"
            >
              <b>{{ f.label }}:</b>
            </b-col>
            <b-col>
              {{ f.formatter(null,null,row.item) }}
            </b-col>
          </b-row>
        </b-list-group-item>
        <b-list-group-item :class="`d-none d-${minFieldsSize}-block p-0`" />

        <b-list-group-item
          v-for="wp in spannedWaypoints(row.item)"
          :key="wp.site._id"
        >
          <b>{{ wp.name() }} ({{ $waypointTypes[wp.type()] }}), {{ $units.distf(wp.loc(), 2) }} {{ $units.dist }}</b><br>
          <b-row v-if="waypointDelay(wp)">
            <b-col
              cols="4"
              class="text-sm-right"
            >
              <b>Delay:</b>
            </b-col>
            <b-col>{{ waypointDelay(wp) / 60 }} minutes</b-col>
          </b-row>
          <b-row v-if="wp.description()">
            <b-col
              cols="4"
              class="text-right"
            >
              <b>Notes:</b>
            </b-col>
            <b-col style="white-space:pre-wrap">
              {{ wp.description() }}
            </b-col>
          </b-row>
        </b-list-group-item>

        <b-list-group-item>
          <b>Pacing Factors</b>
          <div>
            <b-row
              v-for="factor in row.item.factors()"
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
            <b-row
              class="mb-1 show-if-solo"
            >
              <b-col
                cols="4"
                class="text-right"
              >
                None
              </b-col>
            </b-row>
          </div>
        </b-list-group-item>
      </b-list-group>
    </template>
  </b-table>
</template>

<script>
import timeUtil from '../util/time'
import { SuperSegment } from '../../core/segments'

export default {
  filters: {
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
    event: {
      type: Object,
      required: true
    },
    segments: {
      type: Array,
      required: true
    },
    plan: {
      type: Object,
      default () { return null }
    },
    busy: {
      type: Boolean,
      default: false
    },
    mode: {
      type: String,
      required: true
    },
    printing: {
      type: Boolean,
      default: false
    },
    tableHeight: {
      type: Number,
      default: 0
    },
    waypoints: {
      type: Array,
      required: true
    },
    visible: {
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
      if (this.mode === 'splits') {
        return this.segments.map(s => { return new SuperSegment([s]) })
      } else {
        if (!this.segments || !this.segments.length || !this.segments[0].waypoint) return []

        let segs = []
        const rs = []
        this.segments.forEach((s, i) => {
          segs.push(s)
          if (s.waypoint.tier() === 1 || this.visibleSubWaypoints.includes(s._index)) {
            rs.push(new SuperSegment(segs))
            segs = []
          }
        })
        return rs
      }
    },
    planAssigned: function () {
      return Boolean(this.plan && this.plan.pacing && this.plan.pacing.time)
    },
    fieldsInTable: function () {
      // specify fields to show in table or in details based on size breaks
      const fieldsInTable = {
        len: 'sm',
        tod: 'xl'
      }
      if (this.mode === 'segments') {
        fieldsInTable.grade = 'xl'
        fieldsInTable.loss = 'xl'
        if (this.planAssigned) {
          fieldsInTable.gain = 'sm'
          fieldsInTable.time = 'md'
          fieldsInTable.pace = 'sm'
        }
      } else {
        fieldsInTable.grade = 'md'
        if (this.planAssigned) {
          fieldsInTable.loss = 'sm'
        }
      }
      return fieldsInTable
    },
    minFieldsSize: function () {
      // this is the size at which to show hidden columns in the row details
      const a = ['xs', 'sm', 'md', 'lg', 'xl']
      let i = 0
      Object.keys(this.fieldsInTable).forEach(k => {
        const fieldExists = this.fields.findIndex(f => f.key === k) >= 0
        if (fieldExists) {
          i = Math.max(i, a.findIndex(x => x === this.fieldsInTable[k]))
        }
      })
      return a[i]
    },
    fields: function () {
      if (this.mode === 'segments' && (!this.rows.length || !this.rows[0].segments.length || !this.rows[0].segments[0].waypoint)) return []
      const f = [
        {
          key: 'end',
          label: 'Dist [' + this.$units.dist + ']',
          formatter: (value, key, item) => {
            return this.$units.distf(item.end(), 2)
          }
        },
        {
          key: 'gain',
          label: `Gain [${this.$units.alt}]`,
          formatter: (value, key, item) => {
            const scale = this.course.scales ? this.course.scales.gain : 1
            return this.$units.altf(item.gain() * scale, 0)
              .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
          }
        },
        {
          key: 'loss',
          label: 'Loss [' + this.$units.alt + ']',
          formatter: (value, key, item) => {
            const scale = this.course.scales ? this.course.scales.loss : 1
            return this.$units.altf(item.loss() * scale, 0)
              .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
          }
        },
        {
          key: 'grade',
          label: 'Grade',
          formatter: (value, key, item) => {
            const gs = this.course.scales ? this.course.scales.gain : 1
            const ls = this.course.scales ? this.course.scales.loss : 1
            const l = this.mode === 'segments'
              ? item.len()
              : 1 / this.$units.distScale
            const g = (item.gain() * gs + item.loss() * ls) / l / 10
            return (g).toFixed(1) + '%'
          }
        }
      ]
      if (this.mode === 'segments') {
        f.splice(1, 0, {
          key: 'len',
          label: 'Len [' + this.$units.dist + ']',
          formatter: (value, key, item) => {
            return this.$units.distf(item.len(), 2)
          }
        })
        f.unshift({
          key: 'name',
          label: 'End',
          class: 'text-truncate mw-7rem',
          formatter: (value, key, item) => {
            return item.name()
          }
        })
      }
      if (this.planAssigned) {
        if (this.mode === 'segments') {
          f.push({
            key: 'time',
            label: 'Time',
            formatter: (value, key, item) => {
              return timeUtil.sec2string(item.time(), '[h]:m:ss')
            }
          })
        }
        f.push({
          key: 'pace',
          label: `Pace [/${this.$units.dist}]`,
          formatter: (value, key, item) => {
            const l = this.$units.distf(item.len())
            return timeUtil.sec2string(item.time() / l, '[h]:m:ss')
          }
        })
        f.push({
          key: 'elapsed',
          label: 'Elapsed',
          formatter: (value, key, item) => {
            return timeUtil.sec2string(item.elapsed(), '[h]:m:ss')
          }
        })
        if (this.$course.view === 'analyze') {
          f.push({
            key: 'actualElapsed',
            label: 'Actual',
            formatter: (value, key, item) => {
              const v = item.actualElapsed()
              return v !== null ? timeUtil.sec2string(v, '[h]:m:ss') : ''
            },
            variant: 'success'
          })
        }
        if (this.event.hasTOD()) {
          f.push({
            key: 'tod',
            label: 'Arrival',
            formatter: (value, key, item) => {
              return timeUtil.sec2string(item.elapsed() + this.event.startTime, 'am/pm')
            }
          })
        }
      }
      f.forEach((x, i) => {
        f[i].thClass = this.getClass(x.key)
        f[i].tdClass = f[i].thClass
      })
      if (
        !this.printing &&
        this.mode === 'segments' &&
        this.waypoints.findIndex(x => x.tier() > 1) >= 0) {
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
    }
  },
  watch: {
    segments: function (val) {
      this.visibleSubWaypoints = []
    },
    visible: function (val) {
      if (!val) {
        this.clear()
      }
    }
  },
  methods: {
    getClass: function (key) {
      // return class of cell in table for each key
      const lefts = ['name']
      const base = lefts.includes(key) ? '' : 'text-right'
      if (this.fieldsInTable[key]) {
        return `d-none d-${this.fieldsInTable[key]}-table-cell ${base}`
      } else {
        return base
      }
    },
    isCollapsed: function (item) {
      return item.segments.length > 1
    },
    isCollapseable: function (item) {
      return item.segments[0].waypoint.tier() === 1 && this.visibleSubWaypoints.includes(item.segments[0]._index - 1)
    },
    isChild: function (item) {
      return this.visibleSubWaypoints.includes(item.segments[0]._index)
    },
    clear: async function () {
      this.clearing = true
      await this.$refs.table.clearSelected()
      this.rows.filter(r => r._showDetails)
        .forEach(r => { this.$set(r, '_showDetails', false) })
      this.clearing = false
    },
    expandRow: function (item) {
      item.segments.forEach((s, i) => {
        if (i < item.segments.length - 1) {
          this.visibleSubWaypoints.push(s._index)
          s.waypoint.show()
        }
      })
      this.$emit('select', this.mode, [])
    },
    collapseRow: function (item) {
      let i = item.segments[0]._index - 1
      while (this.visibleSubWaypoints.includes(i)) {
        const ind = this.visibleSubWaypoints.findIndex(vi => vi === i)
        this.visibleSubWaypoints.splice(ind, 1)
        this.segments[i].waypoint.hide()
        i -= 1
      }
      this.$emit('select', this.mode, [])
    },
    selectRow: function (row) {
      const showing = Boolean(row._showDetails)
      this.rows.filter(r => r._showDetails).forEach(r => {
        this.$set(r, '_showDetails', false)
      })
      this.$set(row, '_showDetails', !showing)
      const len = this.mode === 'segments'
        ? row.len()
        : 1 / this.$units.distScale
      this.$emit(
        'select',
        this.mode,
        [row.end() - len, row.end()]
      )
      if (!row._showDetails) {
        this.$emit('select', this.mode, [])
      }
    },
    sec2string: function (s, f) {
      return timeUtil.sec2string(s, f)
    },
    spannedWaypoints: function (s) {
      return this.waypoints.filter(wp =>
        this.$math.round(wp.loc(), 4) > this.$math.round(s.end() - s.len(), 4) &&
        this.$math.round(wp.loc(), 4) <= this.$math.round(s.end(), 4) && (
          wp.description() ||
        this.waypointDelay(wp))
      )
    },
    waypointDelay: function (wp) {
      if (!this.planAssigned || !this.plan.pacing.delays.length) return 0
      const d = this.plan.pacing.delays.find(d =>
        this.$math.round(d.loc, 4) === this.$math.round(wp.loc(), 4)
      )
      return (d) ? d.delay : 0
    },
    formatPaceTimePercent (f, item) {
      const df = f - 1
      const sign = f - 1 > 0 ? '+' : '-'
      let str = `${sign}${(Math.abs(df) * 100).toFixed(1)}%`
      if (this.planAssigned) {
        const time = item.time()
        const len = item.len()
        const pace = time / len
        const dTime = Math.abs(time * (1 - 1 / f))
        const dPace = Math.abs(pace * (1 - 1 / f) / this.$units.distScale)
        const paceStr = `[${sign}${timeUtil.sec2string(dPace, '[h]:m:ss')}/${this.$units.dist}] `
        str = `${sign}${timeUtil.sec2string(dTime, '[h]:m:ss')} ${paceStr}[${str}]`
      }
      return str
    },
    hasFactors (item) {
      let res = false
      const facts = item.factors()
      Object.keys(facts).forEach(k => {
        if (this.$math.round(facts, 4) !== 1) {
          res = true
        }
      })
      return res
    }
  }
}
</script>

<style>
.show-if-solo:nth-child(n+2) {
    display: none;
}
</style>
