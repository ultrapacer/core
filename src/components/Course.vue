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
            <tr v-for="split in course.splits">
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
    console.log(this.course)
    this.loading = false
  },
  methods: {
  }
}
</script>
