<template>
  <b-table :items="waypoints" :fields="fields" primary-key="_id" @row-clicked="toggleRowDetails" hover small>
    <template slot="actions" slot-scope="row">
      <b-button size="sm" @click="editFn(row.item)" class="mr-1">
        <v-icon name="edit"></v-icon><span class="d-none d-md-inline">Edit</span>
      </b-button>
      <b-button size="sm" @click="delFn(row.item._id)" class="mr-1">
        <v-icon name="trash"></v-icon><span class="d-none d-md-inline">Delete</span>
      </b-button>
    </template>
    <template slot="row-details" slot-scope="row">
      <b-card>
        <b-row class="mb-2">
          <b-col sm="4">
            Adjust Location:
          </b-col>
          <b-col sm="8">
            <b-button size="sm" class="mr-1" variant="outline-primary" @click="shiftWaypoint(row.item,-1)">&lt;&lt;&lt;</b-button>
            <b-button size="sm" class="mr-1" variant="outline-primary" @click="shiftWaypoint(row.item,-0.1)">&lt;&lt;</b-button>
            <b-button size="sm" class="mr-1" variant="outline-primary" @click="shiftWaypoint(row.item,-0.01)">&lt;</b-button>
            <b-button size="sm" class="mr-1" variant="outline-primary" @click="shiftWaypoint(row.item,0.01)">&gt;</b-button>
            <b-button size="sm" class="mr-1" variant="outline-primary" @click="shiftWaypoint(row.item,0.1)">&gt;&gt;</b-button>
            <b-button size="sm" class="mr-1" variant="outline-primary" @click="shiftWaypoint(row.item,1)">&gt;&gt;&gt;</b-button>
          </b-col>
        </b-row>
      </b-card>
      </template>
  </b-table>
</template>

<script>
import wputil from '../../shared/waypointUtilities'
import api from '@/api'
export default {
  props: ['course', 'waypoints', 'units', 'owner', 'editFn', 'delFn', 'updFn', 'points'],
  data () {
    return {
      updatingWaypointTimeout: null,
      updatingWaypointTimeoutID: null
    }
  },
  computed: {
    fields: function () {
      var f = [
        {
          key: 'name'
        },
        {
          key: 'location',
          label: 'Location [' + this.units.dist + ']',
          formatter: (value, key, item) => {
            return (value * this.units.distScale).toFixed(2)
          }
        },
        {
          key: 'elevation',
          label: 'Elevation [' + this.units.alt + ']',
          formatter: (value, key, item) => {
            return (value * this.units.altScale).toFixed(0)
          },
          thClass: 'd-none d-sm-table-cell',
          tdClass: 'd-none d-sm-table-cell'
        }
      ]
      if (this.owner) {
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
      if (!this.owner) return
      for (var i = 0, il = this.waypoints.length; i < il; i++) {
        if (waypoint !== this.waypoints[i] && this.waypoints[i]._showDetails) {
          this.waypoints[i]._showDetails = false
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
      } else if (loc >= this.points[this.points.length - 1].loc) {
        loc = this.points[this.points.length - 1].loc - (0.01 / this.units.distScale)
      }
      waypoint.location = loc
      wputil.updateLLA(waypoint, this.points)
      wputil.sortWaypointsByDistance(this.waypoints)
      if (String(waypoint._id) === this.updatingWaypointTimeoutID) {
        clearTimeout(this.updatingWaypointTimeout)
      }
      this.updatingWaypointTimeoutID = String(waypoint._id)
      this.updatingWaypointTimeout = setTimeout(() => {
        api.updateWaypoint(waypoint._id, waypoint)
      }, 2000)
    }
  }
}
</script>
