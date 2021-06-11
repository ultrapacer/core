<template>
  <div
    ref="main"
    class="vld-parent"
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
      class="table-xs mb-1"
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

    <div style="display: flex; justify-content: flex-end;">
      <b-link
        :href="`https://ultrapacer.com/course/${courseId}`"
        target="_blank"
        class="up-link mb-2"
      >
        pace this race with ultraPacer
        <img
          src="/public/img/logo-72x72.png"
          style="height:24px"
        >
      </b-link>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import Loading from 'vue-loading-overlay'

import UnitsPlugin from '@/plugins/units'
import LoggerPlugin from '@/plugins/logger'
import api from '@/api-external'
import { BLink, BTable } from 'bootstrap-vue'
Vue.use(UnitsPlugin)
Vue.use(LoggerPlugin)
export default {
  components: {
    BLink, BTable, Loading
  },
  props: {
    courseId: {
      type: String,
      default: '5f35347d239d4e000799eabe'
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
    }
  },
  data () {
    return {
      course: { waypoints: [] },
      isLoading: true
    }
  },
  computed: {
    rows: function () {
      return this.course.waypoints.filter(x => x.tier < 3).map(wp => { return { _id: wp._id } })
    },
    showTerrainType: function () {
      return this.course.waypoints.findIndex(wp => wp.terrainType) >= 0
    },
    showTerrainFactor: function () {
      return this.course.waypoints.findIndex(wp => wp.terrainFactor) >= 0
    },
    fields: function () {
      const f = [
        {
          key: 'name',
          class: 'text-truncate mw-7rem',
          formatter: (value, key, item) => {
            return this.getWaypoint(item, key)
          }
        },
        {
          key: 'location',
          label: `Loc. [${this.$units.dist}]`,
          formatter: (value, key, item) => {
            return this.$units.distf(this.getWaypoint(item, key), 2)
          },
          class: 'text-right'
        },
        {
          key: 'elevation',
          label: `Elev. [${this.$units.alt}]`,
          formatter: (value, key, item) => {
            return this.$units.altf(this.getWaypoint(item, key), 0)
              .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
          },
          class: 'text-right'
        }
      ]
      return f
    }
  },
  async created () {
    this.$logger('getting course')
    this.course = await api.getCourse(this.courseId, 'course')
    this.isLoading = false
  },
  methods: {
    getWaypoint: function (row, field = null) {
      // return the waypoint object/field associated with a row
      const wp = this.course.waypoints.find(wp => wp._id === row._id)
      return (field) ? wp[field] : wp
    }
  }
}
</script>
<style>
@import "~bootstrap/dist/css/bootstrap.css";
@import "~vue-loading-overlay/dist/vue-loading.css";
.table-xs td, .table-xs th {
  font-family: sans-serif;
  font-size: 80%;
  line-height: 1.25;
  padding: 0.2rem;
}
.mw-7rem {
  max-width: 7rem;
}
.up-link {
  font-family: sans-serif;
  font-size: 80%;
}
</style>
