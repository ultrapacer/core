<template>
  <div
    ref="main"
    class="up-table-container vld-parent"
    :style="`min-height:150px; ${style}`"
  >
    <b-table
      ref="table"
      :items="rows"
      :fields="fields"
      primary-key="_id"
      hover
      select-mode="single"
      small
      head-variant="light"
      no-border-collapse
      class="up-table mb-1"
    />
    <loading
      :active.sync="isLoading"
      color="#5e8351"
      loader="spinner"
      width="100"
      height="100"
      :can-cancel="true"
      :is-full-page="false"
      container="$refs.main"
    />

    <div class="up-table-link mb-2">
      <b-link
        :href="`https://ultrapacer.com/course/${courseId}`"
        target="_blank"
      >
        pace this race with ultraPacer
        <img
          src="https://ultrapacer.com/public/img/logo-72x72.png"
          class="up-table-logo"
        >
      </b-link>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import Loading from 'vue-loading-overlay'

import UnitsPlugin from '@/plugins/units'
import { logger } from '../../core/logger'
import api from '@/api-external'
import { BLink, BTable } from 'bootstrap-vue'
Vue.prototype.$logger = logger
Vue.use(UnitsPlugin)
export default {
  components: {
    BLink, BTable, Loading
  },
  props: {
    courseId: {
      type: String,
      required: true
    },
    style: {
      type: String,
      default: ''
    },
    units: {
      type: String,
      default: 'english'
    },
    columns: {
      type: String,
      default: 'name,location,elevation'
    },
    mode: {
      type: String,
      default: 'segments'
    }
  },
  data () {
    return {
      course: { waypoints: [] },
      isLoading: true,
      segments: []
    }
  },
  computed: {
    cols: function () {
      let s = this.columns
      s = s.replaceAll(' ', '') // remove any spaces
      const arr = s.split(',')
      return arr
    },
    rows: function () {
      let arr = this.segments.map((s, i) => { return { _index: i } })
      if (this.mode === 'segments') {
        arr = arr.filter((r, i) =>
          this.segments[i].waypoint.tier === 1
        )
      }
      return arr
    },
    fields: function () {
      const arr = []
      const availableFields = {
        location: {
          key: 'end',
          label: `${this.mode === 'segments' ? 'Loc' : 'Split'} [${this.$units.dist}]`,
          formatter: (value, key, item) => {
            return this.$units.distf(this.rollup(item, key, 'last'), 2)
          },
          class: 'text-right'
        },
        elevation: {
          key: 'alt',
          label: `Elev. [${this.$units.alt}]`,
          formatter: (value, key, item) => {
            return this.$units.altf(this.rollup(item, key, 'last'), 0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
          },
          class: 'text-right'
        },
        gain: {
          key: 'gain',
          label: `Gain [${this.$units.alt}]`,
          formatter: (value, key, item) => {
            const scale = this.course.scales.gain || 1
            return this.$units.altf(this.rollup(item, key, 'sum') * scale, 0)
              .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
          },
          class: 'text-right'
        },
        loss: {
          key: 'loss',
          label: 'Loss [' + this.$units.alt + ']',
          formatter: (value, key, item) => {
            const scale = this.course.scales.loss || 1
            return this.$units.altf(this.rollup(item, key, 'sum') * scale, 0)
              .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
          },
          class: 'text-right'
        }
      }
      if (this.mode === 'segments') {
        availableFields.name = {
          key: 'name',
          label: 'End',
          formatter: (value, key, item) => {
            return this.rollup(item, 'waypoint.name', 'last')
          },
          class: 'text-truncate mw-7rem'
        }
        availableFields.distance = {
          key: 'len',
          label: `Dist. [${this.$units.dist}]`,
          formatter: (value, key, item) => {
            return this.$units.distf(this.rollup(item, key, 'sum'), 2)
          },
          class: 'text-right'
        }
      }
      this.cols.forEach(c => {
        if (availableFields[c]) arr.push(availableFields[c])
      })

      // first column should not be right-aligned:
      arr[0].class = arr[0].class.replace('text-right', '')

      // add padding between columns with right then left align
      arr.forEach((x, i) => {
        if (
          i < arr.length - 1 &&
          x.class.includes('text-right') &&
          !arr[i + 1].class.includes('text-right')
        ) {
          arr[i].class += ' pr-3'
          arr[i + 1].class += 'pl-3'
        }
      })
      return arr
    }
  },
  async created () {
    if (!this.courseId) {
      throw new Error('Course not specified.')
    }
    const t = this.$logger()
    if (this.units === 'metric') {
      this.$units.setDist('km')
      this.$units.setAlt('m')
    }
    let mode = ''
    switch (this.mode) {
      case 'segments':
        mode = this.mode
        break
      case 'splits':
        switch (this.units) {
          case 'english':
            mode = 'miles'
            break
          case 'metric':
            mode = 'kilometers'
        }
    }
    this.course = await api.getUpTable(this.courseId, mode)
    switch (this.mode) {
      case 'segments':
        this.segments = this.course.splits.segments
        // match waypoints in cached segments w/ actual objects
        this.segments.forEach(s => {
          s.waypoint = this.course.waypoints.find(
            wp => wp._id === (s.waypoint._id || s.waypoint)
          )
        })
        break
      case 'splits':
        switch (this.units) {
          case 'english':
            this.segments = this.course.splits.miles
            break
          case 'metric':
            this.segments = this.course.splits.kilometers
        }
    }
    this.isLoading = false
    this.$logger('UpTable|created: complete', t)
  },
  methods: {
    getWaypoint: function (row, field = null) {
      // return the waypoint object/field associated with a row
      const wp = this.course.waypoints.find(wp => wp._id === row._id)
      return (field) ? wp[field] : wp
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
    getSegment: function (row, field = null) {
      // return the segment object/field associated with a row
      const s = this.segments[row._index]
      return (field) ? this.parseField(s, field) : s
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
    }
  }
}
</script>
<style>
@import "~bootstrap/dist/css/bootstrap.css";
@import "~vue-loading-overlay/dist/vue-loading.css";
.up-table td, .up-table th {
  font-family: sans-serif;
  font-size: 80%;
  line-height: 1.25;
  padding: 0.2rem;
}
.mw-7rem {
  max-width: 7rem;
}
.up-table-link {
  font-family: sans-serif;
  font-size: 80%;
  display: flex;
  justify-content: space-evenly;
}
.up-table-logo {
  height: 24px;
}
</style>
