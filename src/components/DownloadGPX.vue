<template>
  <div>
    <b-toast id="my-toast" variant="info" auto-hide-delay="10000" solid>
      <template v-slot:toast-title>
        GPX Download
      </template>
      <p v-if="!this.downloadURL">
        <b-spinner small></b-spinner>
        Generating file...
      </p>
      <p v-else>
        <b-link :href="downloadURL" :download="this.filename +'.gpx'">
          Download "{{ filename }}.gpx"
        </b-link>
      </p>
    </b-toast>
  </div>
</template>

<script>
import api from '@/api'
import moment from 'moment-timezone'
export default {
  props: ['isAuthenticated'],
  data () {
    return {
      downloadURL: null,
      filename: ''
    }
  },
  methods: {
    async rawFromId (id) {
      // If we are replacing a previously generated file we need to
      // manually revoke the object URL to avoid memory leaks.
      if (this.downloadURL !== null) {
        window.URL.revokeObjectURL(this.downloadURL)
      }
      this.$bvToast.show('my-toast')
      let course = await api.getCourse(id)
      let points = await api.getCourseField(id, 'raw')
      points = points.map(x => {
        return {lat: x[0], lon: x[1], alt: x[2]}
      })
      this.writeFile({
        course: course,
        points: points
      })
    },
    writeFile (data) {
      this.$bvToast.show('my-toast')
      this.filename = data.course.name + (data.hasOwnProperty('plan') ? (' - ' + data.plan.name) : '')
      let hasTime = data.hasOwnProperty('start') && data.points[0].hasOwnProperty('elapsed')
      let textarr = ['<?xml version="1.0" encoding="UTF-8"?>',
        '<gpx creator="ultraPacer" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd" version="1.1" xmlns="http://www.topografix.com/GPX/1/1">',
        ' <trk>',
        '  <name>' + this.filename + '</name>',
        '  <type>9</type>',
        '  <trkseg>']
      data.points.forEach(p => {
        textarr.push(`  <trkpt lat="${p.lat}" lon="${p.lon}">`)
        textarr.push(`   <ele>${p.alt}</ele>`)
        if (hasTime) {
          let s = moment(data.start).add(p.elapsed, 'seconds').utc().format()
          textarr.push(`   <time>${s}</time>`)
        }
        textarr.push('  </trkpt>')
      })
      textarr.push('  </trkseg>', ' </trk>', '</gpx>')
      var b = new Blob([textarr.join('\r')], {type: 'text/plain'})
      this.downloadURL = window.URL.createObjectURL(b)
      this.$ga.event('Course', 'download', data.course.public ? data.course.name : 'private')
    }
  }
}
</script>
