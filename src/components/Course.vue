<template>
  <div class="container-fluid mt-4">
    <h1 class="h1">{{ course.name }}</h1>
    <b-alert :show="loading" variant="info">Loading...</b-alert>
    <b-row>
      <b-col>
        <table class="table table-striped">
          <thead>
            <tr>
              <th>Split</th>
              <th>Gain [ft]</th>
              <th>Loss [ft]</th>
              <th>&nbsp;</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="split in splits">
              <td>{{ split.split }}</td>
              <td>{{ split.gain | toFeet }}</td>
              <td>{{ split.loss | toFeet }}</td>
            </tr>
          </tbody>
        </table>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import api from '@/api'
var gpxParse = require('gpx-parse')
export default {
  data () {
    return {
      loading: false,
      courses: [],
      course: {},
      splits: [],
    }
  },
  filters: {
    toMiles (val) {
      var v = Number(val * 0.621371)
      return v.toFixed(2)
    },
    toFeet (val) {
      var v = Number(val * 3.28084)
      return v.toFixed(0)
    }
  },
  async created () {
    this.loading = true
    this.course = await api.getCourse(this.$route.query.course)
    await this.calcSplits()
    this.loading = false
  },
  methods: {
    async calcSplits() {
      var total = 0
      var split = 0
      var igain = 0
      var iloss = 0
      var currentSegment = this.course._gpx.points
      var delta = 0
      this.splits = []
      console.log(this.course)
      for (var i=0, il= currentSegment.length -1; i<il; i++) {
      	total += (gpxParse.utils.calculateDistance(currentSegment[i].lat,currentSegment[i].lon,currentSegment[i+1].lat,currentSegment[i+1].lon )) * 0.621371;
        delta = currentSegment[i+1].elevation - currentSegment[i].elevation
        if (delta < 0) { iloss += delta }
        else { igain += delta }
        if (total - split > 1 || i == il - 1) {
          split += 1
          this.splits.push({
            split: total.toFixed(2),
            gain: igain,
            loss: iloss
          })
          igain = 0
          iloss = 0
        }
      }
    }
  }
}
</script>
