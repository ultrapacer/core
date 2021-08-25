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
        :href="`https://ultrapacer.com/${link}`"
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
import { Course } from '../../core/courses'
import { loopedWaypoints } from '../../core/waypoints'
import { Segment, SuperSegment } from '../../core/segments'

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
      if (this.mode === 'splits') {
        return this.segments.map(s => { return new SuperSegment([s]) })
      } else {
        if (!this.segments || !this.segments.length || !this.segments[0].waypoint) return []
        let segs = []
        const rs = []
        this.segments.forEach((s, i) => {
          segs.push(s)
          if (s.waypoint.tier() === 1) {
            rs.push(new SuperSegment(segs))
            segs = []
          }
        })
        rs.unshift(
          new SuperSegment([
            new Segment({
              waypoint: this.waypoints[0],
              gain: 0,
              loss: 0,
              end: 0,
              len: 0
            })
          ])
        )
        return rs
      }
    },
    fields: function () {
      if (this.mode === 'segments' && (!this.rows.length || !this.rows[0].segments.length || !this.rows[0].segments[0].waypoint)) return []
      const arr = []
      const availableFields = {
        location: {
          key: 'end',
          label: `${this.mode === 'segments' ? 'Loc' : 'Split'} [${this.$units.dist}]`,
          formatter: (value, key, item) => {
            return this.$units.distf(item.end(), 2)
          },
          class: 'text-right'
        },
        elevation: {
          key: 'alt',
          label: `Elev. [${this.$units.alt}]`,
          formatter: (value, key, item) => {
            return this.$units.altf(item.last().waypoint.alt(), 0)
              .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
          },
          class: 'text-right'
        },
        gain: {
          key: 'gain',
          label: `Gain [${this.$units.alt}]`,
          formatter: (value, key, item) => {
            const scale = this.course.scales.gain || 1
            return this.$units.altf(item.gain() * scale, 0)
              .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
          },
          class: 'text-right'
        },
        loss: {
          key: 'loss',
          label: 'Loss [' + this.$units.alt + ']',
          formatter: (value, key, item) => {
            const scale = this.course.scales.loss || 1
            return this.$units.altf(item.loss() * scale, 0)
              .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
          },
          class: 'text-right'
        }
      }
      if (this.mode === 'segments') {
        availableFields.name = {
          key: 'name',
          label: 'Waypoint',
          formatter: (value, key, item) => {
            return item.name()
          },
          class: 'text-truncate mw-7rem'
        }
        availableFields.distance = {
          key: 'len',
          label: `Dist. [${this.$units.dist}]`,
          formatter: (value, key, item) => {
            return this.$units.distf(item.len(), 2)
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
    },
    link: function () {
      if (this.course && this.course._id) {
        return this.course.link ? `race/${this.course.link}` : `course/${this.course._id}`
      } else {
        return ''
      }
    },
    waypoints: function () {
      if (!this.course.waypoints || !this.course.waypoints.length) return []
      return loopedWaypoints(this.course.waypoints, this.course.loops, this.course.distance)
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
    this.course = new Course(await api.getUpTable(this.courseId, mode))
    switch (this.mode) {
      case 'segments':
        this.segments = this.course.splits.segments
        // match waypoints in cached segments w/ actual objects
        this.course.splits.segments.forEach(s => {
          const wp = this.waypoints.find(
            wp => wp.site._id === s.waypoint.site._id && wp.loop === s.waypoint.loop
          )
          if (wp) s.waypoint = wp
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
