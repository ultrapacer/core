<template>
  <div class="container-fluid mt-4">
    <h1 class="h1">{{ course.name }}</h1>
    <b-alert :show="loading" variant="info">Loading...</b-alert>
    <b-row>
      <b-col>
        <table class="table table-striped">
          <thead>
            <tr>
              <th>Split [{{ distUnits }}]</th>
              <th>Gain [{{ elevUnits }}]</th>
              <th>Loss [{{ elevUnits }}]</th>
              <th>&nbsp;</th>
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
        <div>
          <b-btn variant="success" @click.prevent="toggleUnits()">Switch Units</b-btn>
        </div>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import api from '@/api'
import utilities from '@/utilities'
export default {
  data () {
    return {
      loading: false,
      courses: [],
      course: {},
      splits: [],
      unitSystem: 'english',
      distUnits: 'mi',
      elevUnits: 'ft'
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
    this.splits = utilities.calcSplits(this.course._gpx.points, this.distUnits)
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
    }
  }
}
</script>
