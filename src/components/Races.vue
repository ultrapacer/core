<template>
  <div class="container-fluid mt-4">
    <h1 class="h1 d-none d-md-block">Race Database</h1>
    <p>Click on your race below to make a game plan.<br/>Not seeing your race? Contact me and let me know!</p>
    <div v-if="initializing" class="d-flex justify-content-center mb-3">
      <b-spinner label="Loading..." ></b-spinner>
    </div>
    <b-row v-if="!initializing">
      <b-col>
        <race-table :races="upcomingRaces" :units="units"></race-table>
      </b-col>
    </b-row>
    <b-row v-if="!initializing">
      <b-col>
        <h4>Past Events</h4>
        <race-table :races="pastRaces" :units="units"></race-table>
      </b-col>
    </b-row>
    <vue-headful
      description="ultraPacer's race database; find your race strategy to tackle that grade, terrain, altitude, heat, nighttime, and fatigue."
      title="Races - ultraPacer"
    />
  </div>
</template>

<script>
import api from '@/api'
import moment from 'moment-timezone'
import RaceTable from './RaceTable'
export default {
  title: 'Races',
  props: ['isAuthenticated', 'user'],
  components: {
    RaceTable
  },
  data () {
    return {
      initializing: true,
      courses: [],
      courseEditor: false,
      upcomingRaces: [],
      pastRaces: []
    }
  },
  computed: {
    units: function () {
      var u = {
        dist: (this.isAuthenticated) ? this.user.distUnits : 'mi',
        alt: (this.isAuthenticated) ? this.user.elevUnits : 'ft'
      }
      u.distScale = (u.dist === 'mi') ? 0.621371 : 1
      u.altScale = (u.alt === 'ft') ? 3.28084 : 1
      return u
    }
  },
  async created () {
    this.races = await api.getRaces()
    // sort by day, name
    this.races.sort((a, b) =>
      b.distance - a.distance
    )
    this.races.sort((a, b) =>
      (a.name.substring(0, 6) < b.name.substring(0, 6)) ? -1 : 1
    )
    this.upcomingRaces = this.races.filter(r =>
      moment(r.eventStart).isAfter(moment(), 'day') ||
      moment(r.eventStart).isSame(moment(), 'day')
    )
    this.pastRaces = this.races.filter(r =>
      moment(r.eventStart).isBefore(moment(), 'day')
    )
    this.upcomingRaces.sort((a, b) =>
      moment(a.eventStart).format('YYYYMMDD') - moment(b.eventStart).format('YYYYMMDD')
    )
    this.pastRaces.sort((a, b) =>
      moment(b.eventStart).format('YYYYMMDD') - moment(a.eventStart).format('YYYYMMDD')
    )
    this.initializing = false
  },
  methods: {
    async refreshRaces (callback) {
      this.courses = await api.getRaces()
      if (typeof callback === 'function') callback()
    }
  }
}
</script>
