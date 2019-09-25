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
        <b-link :href="downloadURL" :download="this.course.name +'.gpx'">Download</b-link>
      </p>
    </b-toast>
  </div>
</template>

<script>
import api from '@/api'
export default {
  props: ['id'],
  data () {
    return {
      course: null,
      downloadURL: null
    }
  },
  methods: {
    async generateFile () {
      // If we are replacing a previously generated file we need to
      // manually revoke the object URL to avoid memory leaks.
      if (this.downloadURL !== null) {
        window.URL.revokeObjectURL(this.downloadURL)
      }
      this.$bvToast.show('my-toast')
      this.course = await api.getCourse(this.id)
      let textarr = ['<?xml version="1.0" encoding="UTF-8"?>',
        '<gpx creator="ultraPacer" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd" version="1.1" xmlns="http://www.topografix.com/GPX/1/1">',
        ' <trk>',
        '  <name>' + this.course.name + '</name>',
        '  <type>9</type>',
        '  <trkseg>']
      this.course.points.forEach(p => {
        textarr.push(`  <trkpt lat="${p.lat}" lon="${p.lon}">`)
        textarr.push(`   <ele>${p.alt}</ele>`)
        textarr.push('  </trkpt>')
      })
      textarr.push('  </trkseg>', ' </trk>', '</gpx>')
      var data = new Blob([textarr.join('\r')], {type: 'text/plain'})
      this.downloadURL = window.URL.createObjectURL(data)
    }
  }
}
</script>
