<template>
  <div
    class="container-fluid mt-4"
    style="max-width:60rem"
  >
    <h1 class="h1 d-none d-md-block">
      Race Database
    </h1>
    <p>Click on your race below to make a game plan.<br>Not seeing your race? Contact me and let me know!</p>
    <div
      v-if="initializing"
      class="d-flex justify-content-center mb-3"
    >
      <b-spinner label="Loading..." />
    </div>
    <b-row v-if="!initializing">
      <b-col>
        <race-table
          :races="upcomingRaces"
        />
      </b-col>
    </b-row>
    <b-row v-if="!initializing">
      <b-col>
        <h4>Past Events</h4>
        <race-table
          :races="pastRaces"
        />
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
  components: {
    RaceTable
  },
  data () {
    return {
      initializing: true,
      upcomingRaces: [],
      pastRaces: []
    }
  },
  async created () {
    const races = await api.getRaces()
    // sort by day, name
    races.sort((a, b) =>
      b.distance - a.distance
    )
    races.sort((a, b) =>
      (a.name.substring(0, 6) < b.name.substring(0, 6)) ? -1 : 1
    )
    this.upcomingRaces = races.filter(r =>
      moment(r.eventStart).isAfter(moment(), 'day') ||
      moment(r.eventStart).isSame(moment(), 'day')
    )
    this.pastRaces = races.filter(r =>
      moment(r.eventStart).isBefore(moment(), 'day')
    )
    this.upcomingRaces.sort((a, b) =>
      moment(a.eventStart).format('YYYYMMDD') - moment(b.eventStart).format('YYYYMMDD')
    )
    this.pastRaces.sort((a, b) =>
      moment(b.eventStart).format('YYYYMMDD') - moment(a.eventStart).format('YYYYMMDD')
    )
    this.initializing = false
  }
}
</script>
