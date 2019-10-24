<template>
  <b-table
    ref="table"
    :items="waypoints"
    :fields="fields"
    primary-key="_id"
    @row-clicked="toggleRowDetails"
    hover
    selectable
    select-mode="single"
    small
  >
    <template slot="actions" slot-scope="row">
      <b-button size="sm" @click="editFn(row.item)" class="mr-1">
        <v-icon name="edit"></v-icon>
        <span class="d-none d-md-inline">Edit</span>
      </b-button>
      <b-button
        v-if="row.item.type !== 'start' && row.item.type !== 'finish'"
        size="sm"
        @click="delFn(row.item)"
        class="mr-1"
      >
        <v-icon name="trash"></v-icon>
        <span class="d-none d-md-inline">Delete</span>
      </b-button>
    </template>
    <template slot="row-details" slot-scope="row">
      <b-card>
        <b-row class="mb-2">
          <b-col sm="4">
            Adjust Location:
          </b-col>
          <b-col sm="8">
            <b-button
                v-for="sb in shiftButtons"
                v-bind:key="sb.value"
                size="sm"
                class="mr-1"
                variant="outline-primary"
                @click="shiftWaypoint(row.item, sb.value)"
              >
              {{ sb.display }}
            </b-button>
          </b-col>
        </b-row>
      </b-card>
      </template>
  </b-table>
</template>

<script>
import wputil from '../util/waypoints'
import api from '@/api'
export default {
  props: ['course', 'points', 'units', 'editing', 'editFn', 'delFn', 'updFn'],
  data () {
    return {
      updatingWaypointTimeout: null,
      updatingWaypointTimeoutID: null,
      shiftButtons: [
        { value: -1, display: '<<<' },
        { value: -0.1, display: '<<' },
        { value: -0.01, display: '<' },
        { value: 0.01, display: '>' },
        { value: 0.1, display: '>>' },
        { value: 1, display: '>>>' }
      ]
    }
  },
  computed: {
    waypoints: function () {
      if (this.editing) {
        return this.course.waypoints
      } else {
        return this.course.waypoints.filter(x => x.tier < 3)
      }
    },
    showTerrain: function () {
      return this.waypoints.findIndex(wp => wp.terrainFactor) >= 0
    },
    fields: function () {
      var f = [
        {
          key: 'name'
        },
        {
          key: 'type',
          formatter: (value, key, item) => {
            return this.$waypointTypes[value]
          },
          thClass: 'd-none d-md-table-cell',
          tdClass: 'd-none d-md-table-cell'
        },
        {
          key: 'location',
          label: 'Location [' + this.units.dist + ']',
          formatter: (value, key, item) => {
            return (value * this.units.distScale).toFixed(2)
          },
          thClass: 'text-right',
          tdClass: 'text-right'
        },
        {
          key: 'elevation',
          label: 'Elevation [' + this.units.alt + ']',
          formatter: (value, key, item) => {
            return (value * this.units.altScale).toFixed(0)
          },
          thClass: 'd-none d-sm-table-cell text-right',
          tdClass: 'd-none d-sm-table-cell text-right'
        }
      ]
      if (this.showTerrain) {
        f.push({
          key: 'terrainFactor',
          label: 'Terrain',
          formatter: (value, key, item) => {
            if (value === null) {
              // if waypoint doesn't have a value, show previous
              let i = this.waypoints.findIndex(wp => wp._id === item._id)
              let wp = this.waypoints.filter((wp, j) =>
                j < i &&
                wp.terrainFactor
              ).pop()
              value = (wp) ? wp.terrainFactor : 0
            }
            return `+${value}%`
          },
          thClass: 'd-none d-md-table-cell text-right',
          tdClass: 'd-none d-md-table-cell text-right'
        })
      }
      if (this.editing) {
        f.push({
          key: 'actions',
          label: '',
          tdClass: 'actionButtonColumn'
        })
      }
      return f
    }
  },
  methods: {
    toggleRowDetails: function (waypoint) {
      if (!this.editing) return
      for (var i = 0, il = this.course.waypoints.length; i < il; i++) {
        if (waypoint !== this.course.waypoints[i] && this.course.waypoints[i]._showDetails) {
          this.course.waypoints[i]._showDetails = false
        }
      }
      if (waypoint.type !== 'start' && waypoint.type !== 'finish') {
        this.$set(waypoint, '_showDetails', !waypoint._showDetails)
      }
    },
    shiftWaypoint: function (waypoint, delta) {
      var loc = waypoint.location + delta / this.units.distScale
      if (loc < 0.01 / this.units.distScale) {
        loc = 0.01
      } else if (loc >= this.course.distance) {
        loc = this.course.distance - (0.01 / this.units.distScale)
      }
      waypoint.location = loc
      wputil.updateLLA(waypoint, this.points)
      wputil.sortWaypointsByDistance(this.course.waypoints)
      if (String(waypoint._id) === this.updatingWaypointTimeoutID) {
        clearTimeout(this.updatingWaypointTimeout)
      }
      this.updatingWaypointTimeoutID = String(waypoint._id)
      this.updatingWaypointTimeout = setTimeout(() => {
        api.updateWaypoint(waypoint._id, waypoint)
      }, 2000)
      this.$emit('setUpdateFlag')
    },
    selectWaypoint: function (id) {
      let i = this.waypoints.findIndex(x => x._id === id)
      this.$refs.table.selectRow(i)
    }
  }
}
</script>
