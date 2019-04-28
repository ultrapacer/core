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
                      <th>Split [{{ distUnits }}]</th>
                      <th>Gain [{{ elevUnits }}]</th>
                      <th>Loss [{{ elevUnits }}]</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="split in splits">
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
                      <th>Location [{{ distUnits }}]</th>
                      <th>Elevation [{{ elevUnits }}]</th>
                      <th>&nbsp;</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="waypoint in waypoints" :key="waypoint._id">
                      <td>{{ waypoint.name }}</td>
                      <td>{{ waypoint.location | formatMilesKM(distUnits) }}</td>
                      <td>{{ waypoint.elevation | formatFeetMeters(elevUnits) }}</td>
                        <td class="text-right">
                        <a href="#" @click.prevent="populateWaypointToEdit(waypoint)">Edit</a> /
                        <a href="#" @click.prevent="deleteWaypoint(waypoint._id)">Delete</a>
                      </td>
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
                    <b-form-group label="Location [distUnits]">
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
import utilities from '@/utilities'
export default {
  data () {
    return {
      loading: false,
      course: {},
      splits: [],
      unitSystem: 'english',
      distUnits: 'mi',
      elevUnits: 'ft',
      waypoint: {},
      waypoints: [],
      editing: false
    }
  },
  filters: {
    formatMilesKM (val,units) {
      var v = Number(val)
      if (units == 'mi') { v = v * 0.621371 }
      return v.toFixed(2)
    },
    formatFeetMeters (val,units) {
      var v = Number(val)
      if (units == 'ft') { v = v * 3.28084 }
      return v.toFixed(0)
    },
    unitFeetMeters (units){
      if(units == 'english') { return 'ft' }
      else { return 'm' }
    }
  },
  async created () {
    this.loading = true
    this.course = await api.getCourse(this.$route.query.course)
    this.waypoints = await api.getWaypoints(this.$route.query.course)
    this.splits = utilities.calcSplits(this.course._gpx.points, this.distUnits)
    console.log(this.splits)
    console.log(this.course)
    this.loading = false
  },
  methods: {
    async toggleUnits () {
      if (this.unitSystem == 'metric') {
        this.elevUnits = 'ft'
        this.distUnits = 'mi'
        this.unitSystem = 'english'
      } else {
        this.elevUnits = 'm'
        this.distUnits = 'km'
        this.unitSystem = 'metric'
      }
      this.splits = utilities.calcSplits(this.course._gpx.points, this.distUnits)
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
      this.loading = true
      this.waypoints = await api.getWaypoints(this.$route.query.course)
      this.loading = false
    },
    async deleteWaypoint (id) {
      if (confirm('Are you sure you want to delete this waypoint?')) {
        // if we are editing a course we deleted, remove it from the form
        if (this.waypoint._id === id) {
          this.waypoint = {}
          this.editing = false
        }
        await api.deleteWaypoint(id)
        await this.refreshWaypoints()
      }
    },
    async populateWaypointToEdit (waypoint) {
      this.waypoint = Object.assign({}, waypoint)
      this.editing = true
    },
  }
}
</script>
