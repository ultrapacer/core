<template>
  <div class="container-fluid mt-4">
    <h1 class="h1">{{ course.name }}</h1>
    <b-alert :show="loading" variant="info">Loading...</b-alert>
    <div role="tablist">
      <b-card no-body class="mb-1">
        <b-card-header header-tag="header" class="p-1" role="tab">
          <b-button block href="#" v-b-toggle.accordion-1 variant="info">Splits</b-button>
        </b-card-header>
        <b-collapse id="accordion-1" accordion="my-accordion" role="tabpanel">
          <b-card-body>
            <b-row>
              <b-col>
                <table class="table table-striped">
                  <thead>
                    <tr>
                      <th>Split [{{ user.distUnits }}]</th>
                      <th>Gain [{{ user.elevUnits }}]</th>
                      <th>Loss [{{ user.elevUnits }}]</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(split, index) in splits" :key="index">
                      <td>{{ split.split }}</td>
                      <td>{{ split.gain | formatFeetMeters(elevUnits) }}</td>
                      <td>{{ split.loss | formatFeetMeters(elevUnits) }}</td>
                    </tr>
                  </tbody>
                </table>
              </b-col>
            </b-row>
          </b-card-body>
        </b-collapse>
      </b-card>
      <b-card no-body class="mb-1">
        <b-card-header header-tag="header" class="p-1" role="tab">
          <b-button block href="#" v-b-toggle.accordion-3 variant="info">Waypoints</b-button>
        </b-card-header>
        <b-collapse id="accordion-3" accordion="my-accordion" role="tabpanel">
          <b-card-body>
            <b-row>
              <b-col>
                <table class="table table-striped">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Location [{{ user.distUnits }}]</th>
                      <th>Elevation [{{ user.elevUnits }}]</th>
                      <th>&nbsp;</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="waypoint in waypoints" :key="waypoint._id">
                      <td>{{ waypoint.name }}</td>
                      <td>{{ waypoint.location | formatMilesKM(user.distUnits) }}</td>
                      <td>{{ waypoint.elevation | formatFeetMeters(user.elevUnits) }}</td>
                        <td class="text-right">
                        <a href="#" @click.prevent="populateWaypointToEdit(waypoint)">Edit</a> /
                        <a href="#" @click.prevent="deleteWaypoint(waypoint._id)">Delete</a>
                      </td>
                    </tr>
                    <tr>
                      <td>Finish</td>
                      <td>{{ course.distance | formatMilesKM(user.distUnits) }}</td>
                      <td>{{ course.elevation | formatFeetMeters(user.elevUnits) }}</td>
                      <td>&nbsp;</td>
                    </tr>
                  </tbody>
                </table>
                <div v-show="!editing">
                  <b-btn variant="success" @click.prevent="newWaypoint()">New Waypoint</b-btn>
                </div>
              </b-col>
              <b-col v-show="editing" lg="3">
                <b-card :title="(waypoint._id ? 'Edit Waypoint' : 'New Waypoint')">
                  <form @submit.prevent="saveWaypoint">
                    <b-form-group label="Name">
                      <b-form-input type="text" v-model="waypoint.name"></b-form-input>
                    </b-form-group>
                    <b-form-group v-bind:label="'Location [' + user.distUnits + ']'">
                      <b-form-input type="number" v-model="waypoint.location"></b-form-input>
                    </b-form-group>
                    <b-form-group label="Description">
                      <b-form-textarea rows="4" v-model="waypoint.description"></b-form-textarea>
                    </b-form-group>
                    <div>
                      <b-btn type="submit" variant="success">Save Waypoint</b-btn>
                      <b-btn type="cancel" @click.prevent="cancelWaypointEdit()">Cancel</b-btn>
                    </div>
                  </form>
                </b-card>
              </b-col>
            </b-row>
          </b-card-body>
        </b-collapse>
      </b-card>
    </div>
                <div>
                  <b-btn variant="success" @click.prevent="toggleUnits()">Switch Units</b-btn>
                </div>
  </div>
</template>

<script>
import api from '@/api'
import utilities from '../../shared/utilities'
export default {
  data () {
    return {
      loading: false,
      course: {},
      splits: [],
      unitSystem: 'english',
      waypoint: {},
      waypoints: [],
      editing: false,
      user: {}
    }
  },
  filters: {
    formatMilesKM (val, units) {
      var v = Number(val)
      if (units === 'mi') { v = v * 0.621371 }
      return v.toFixed(2)
    },
    formatFeetMeters (val, units) {
      var v = Number(val)
      if (units === 'ft') { v = v * 3.28084 }
      return v.toFixed(0)
    }
  },
  async created () {
    this.loading = true
    this.course = await api.getCourse(this.$route.query.course)
    this.user = await api.getUser()
    await this.refreshWaypoints()
    this.splits = utilities.calcSplits(this.course._gpx.points, this.user.distUnits)
    console.log(this.splits)
    this.loading = false
  },
  methods: {
    async toggleUnits () {
      if (this.unitSystem === 'metric') {
        this.unitSystem = 'english'
      } else {
        this.unitSystem = 'metric'
      }
      this.splits = utilities.calcSplits(this.course._gpx.points, this.user.distUnits)
    },
    async newWaypoint () {
      this.waypoint = {}
      this.editing = true
    },
    async cancelWaypointEdit () {
      this.waypoint = {}
      this.editing = false
    },
    async saveWaypoint () {
      if (this.unitSystem === 'english') {
        this.waypoint.location = this.waypoint.location / 0.621371
      }
      if (this.waypoint._id) {
        await api.updateWaypoint(this.waypoint._id, this.waypoint)
      } else {
        this.waypoint._course = this.course._id
        await api.createWaypoint(this.waypoint)
      }
      this.waypoint = {} // reset form
      await this.refreshWaypoints()
      this.editing = false
    },
    async refreshWaypoints () {
      this.waypoints = await api.getWaypoints(this.$route.query.course)
      if (!this.waypoints.length) {
        await api.createWaypoint({name: 'Start', location: 0, _course: this.course._id})
        await this.refreshWaypoints()
      }
    },
    async deleteWaypoint (id) {
      if (confirm('Are you sure you want to delete this waypoint?')) {
        // if we are editing a course we deleted, remove it from the form
        if (this.waypoint._id === id) {
          this.waypoint = {}
          this.editing = false
        }
        this.loading = true
        await api.deleteWaypoint(id)
        await this.refreshWaypoints()
        this.loading = false
      }
    },
    async populateWaypointToEdit (waypoint) {
      this.waypoint = Object.assign({}, waypoint)
      if (this.unitSystem === 'english') {
        this.waypoint.location = (this.waypoint.location * 0.621371).toFixed(3)
      }
      this.editing = true
    }
  }
}
</script>
