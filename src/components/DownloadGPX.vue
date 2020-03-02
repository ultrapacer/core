<template>
  <div>
    <b-toast id="my-toast" variant="info" auto-hide-delay="10000" solid>
      <template v-slot:toast-title>
        GPX Download
      </template>
      <p v-if="!this.gpxURL">
        <b-spinner small></b-spinner>
        Generating file...
      </p>
      <p v-else>
        <b-link :href="gpxURL" :download="this.filename +'.gpx'">
          Full resolution: "{{ filename }}.gpx"
        </b-link><br/>
        <b-link :href="gpx2URL" :download="'uP-' + this.filename + '.gpx'">
          Downsized (for watch): "uP-{{ filename }}.gpx"
        </b-link><br/>
        <b-link :href="tcxURL" :download="this.filename +'.tcx'">
          Full resolution "{{ filename }}.tcx"
        </b-link>
      </p>
    </b-toast>
  </div>
</template>

<script>
/* eslint new-cap: 0 */
import moment from 'moment-timezone'
import api from '@/api'
import geo from '@/util/geo'
import { round, interp } from '@/util/math'
const sgeo = require('sgeo')

function lawOfCosines (a, b, c) {
  let val = Math.acos((a ** 2 + b ** 2 - c ** 2) / (2 * a * b)) * 180 / Math.PI
  if (!val) {
    console.log({
      a: a,
      b: b,
      c: c
    })
  }
  return val
}

export default {
  props: ['isAuthenticated'],
  data () {
    return {
      gpxURL: null,
      gpx2URL: null,
      tcxURL: null,
      filename: ''
    }
  },
  methods: {
    async start (data, updateFn) {
      let t = this.$logger('DownloadGPX|start')
      if (this.gpxURL !== null) {
        window.URL.revokeObjectURL(this.gpxURL)
        window.URL.revokeObjectURL(this.gpx2URL)
        window.URL.revokeObjectURL(this.tcxURL)
        this.gpxURL = null
        this.gpx2URL = null
        this.tcxURL = null
      }
      this.$bvToast.show('my-toast')
      let full = await api.getCourseField(data.course._id, 'raw')
      full = full.map(x => {
        return {lat: x[0], lon: x[1], alt: x[2]}
      })
      // add locations:
      full = geo.addLoc(full)
      let hasTime = data.event.start && data.plan
      let red2 = [...data.points] // reduced points array
      if (hasTime) {
        let red = [...data.points] // reduced points array
        if (!red[0].hasOwnProperty('elapsed')) {
          let result = geo.calcPacing({
            course: data.course,
            plan: data.plan,
            points: data.points,
            pacing: data.pacing,
            event: data.event,
            delays: data.delays,
            heatModel: data.heatModel,
            scales: data.scales,
            terrainFactors: data.terrainFactors
          })
          red = [...result.points]
          red2 = [...result.points]
        }
        // interpolate times from distances in full
        let lastelapsed = 0
        full.forEach(p => {
          while (red.length > 1 && red[1].loc <= p.loc) {
            red.shift()
          }
          if (p.loc === red[0].loc || red.length === 1) {
            p.elapsed = red[0].elapsed
          } else if (p.loc > red[0].loc && p.loc < red[1].loc) {
            p.elapsed = interp(
              red[0].loc,
              red[1].loc,
              red[0].elapsed,
              red[1].elapsed,
              p.loc
            )
          }
          p.elapsed = round(p.elapsed, 3)
          p.delapsed = p.elapsed - lastelapsed
          lastelapsed = p.elapsed
        })
        // remove any points with zero change in time:
        full = full.filter((p, i) => i === 0 || p.delapsed > 0)
      }

      // create straight line option:
      let red3 = red2.map(p => { return {...p} }) // clone red2
      let p0 = new sgeo.latlon(0, 0)
      red3[0].lat = Number(p0.lat)
      red3[0].lon = Number(p0.lng)
      red3.forEach((p, i) => {
        if (i > 0) {
          let ll1 = new sgeo.latlon(red3[i - 1].lat, red3[i - 1].lon)
          let ll2 = ll1.destinationPoint(0, p.dloc)
          p.lat = Number(ll2.lat)
          p.lon = Number(ll2.lng)
        }
      })

      // adjust odd points of red2 lat/lon to make length work
      let red4 = red2.map(p => { return {...p} }) // deep copy red2
      red4 = geo.addLoc(red4)
      red4.forEach((p, i) => {
        if (
          i % 2 === 0 &&
          i < red4.length - 2 &&
          (red4[i + 1].dloc + red4[i + 2].dloc < red2[i + 1].dloc + red2[i + 2].dloc)
        ) {
          let A = new sgeo.latlon(p.lat, p.lon)
          let B = new sgeo.latlon(red4[i + 1].lat, red4[i + 1].lon)
          let C = new sgeo.latlon(red4[i + 2].lat, red4[i + 2].lon)
          let bAB = A.bearingTo(B)
          let bAC = A.bearingTo(C)
          let dAC = A.distanceTo(C)
          if (dAC < red2[i + 1].dloc + red2[i + 2].dloc) {
            let alpha = lawOfCosines(dAC, red2[i + 1].dloc, red2[i + 2].dloc)
            let bAB2 = 0
            if (bAC < bAB || (bAC > 270 && bAB < 90)) {
              bAB2 = bAC + alpha
            } else {
              bAB2 = bAC - alpha
            }
            let B2 = A.destinationPoint(bAB2, red2[i + 1].dloc)
            red4[i + 1].lat = Number(B2.lat)
            red4[i + 1].lon = Number(B2.lng)
          }
        }
      })
      red4 = geo.addLoc(red4)

      this.filename = data.course.name + (data.plan ? (' - ' + data.plan.name) : '')
      let gpxText = this.writeGPXText({
        start: data.event.start || null,
        points: full
      })
      let gpxText2 = this.writeGPXText({
        start: data.event.start || null,
        points: red4
      })
      let tcxText = this.writeTCXText({
        start: data.event.start || null,
        segments: data.segments,
        points: full
      })
      var gpx = new Blob([gpxText.join('\r')], {type: 'text/plain'})
      var gpx2 = new Blob([gpxText2.join('\r')], {type: 'text/plain'})
      var tcx = new Blob([tcxText.join('\r')], {type: 'text/plain'})
      this.gpxURL = window.URL.createObjectURL(gpx)
      this.gpx2URL = window.URL.createObjectURL(gpx2)
      this.tcxURL = window.URL.createObjectURL(tcx)

      this.$ga.event('Course', 'download', data.course.public ? data.course.name : 'private')
      this.$logger('DownloadGPX|start', t)
    },
    writeGPXText (data) {
      let hasTime = data.start && data.points[0].hasOwnProperty('elapsed')
      let gpxText = ['<?xml version="1.0" encoding="UTF-8"?>',
        '<gpx creator="ultraPacer" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd" version="1.1" xmlns="http://www.topografix.com/GPX/1/1">',
        '  <trk>',
        '    <name>' + this.filename + '</name>',
        '    <type>9</type>',
        '    <trkseg>']
      data.points.forEach(p => {
        let timestr = ''
        gpxText.push(`    <trkpt lat="${round(p.lat, 8)}" lon="${round(p.lon, 8)}">`)
        gpxText.push('      <ele>' + round(p.alt, 2) + '</ele>')
        if (hasTime) {
          timestr = moment(data.start).add(p.elapsed, 'seconds').utc().format('YYYY-MM-DD[T]HH:mm:ss.SSS[Z]')
          gpxText.push('      <time>' + timestr + '</time>')
        }
        gpxText.push('    </trkpt>')
      })

      gpxText.push('    </trkseg>', '   </trk>', '</gpx>')
      return gpxText
    },
    writeTCXText (data) {
      let hasTime = data.start && data.points[0].hasOwnProperty('elapsed')
      let tcxText = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<TrainingCenterDatabase xmlns="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2 http://www.garmin.com/xmlschemas/TrainingCenterDatabasev2.xsd">',
        '  <Folders>',
        '    <Courses>',
        '      <CourseFolder Name="ultraPacer">',
        '        <CourseNameRef>',
        '          <Id>' + this.filename + '</Id>',
        '        </CourseNameRef>',
        '      </CourseFolder>',
        '    </Courses>',
        '  </Folders>',
        '  <Courses>',
        '    <Course>',
        '      <Name>' + this.filename + '</Name>',
        '      <Lap>'
      ]
      if (hasTime) {
        tcxText.push(
          '        <TotalTimeSeconds>' + round(data.points[data.points.length - 1].elapsed, 3) + '</TotalTimeSeconds>'
        )
      }
      tcxText.push(
        '        <DistanceMeters>' + round(data.points[data.points.length - 1].loc * 1000, 2) + '</DistanceMeters>',
        '        <BeginPosition>',
        '          <LatitudeDegrees>' + data.points[0].lat + '</LatitudeDegrees>',
        '          <LongitudeDegrees>' + data.points[0].lon + '</LongitudeDegrees>',
        '        </BeginPosition>',
        '        <EndPosition>',
        '          <LatitudeDegrees>' + data.points[data.points.length - 1].lat + '</LatitudeDegrees>',
        '          <LongitudeDegrees>' + data.points[data.points.length - 1].lon + '</LongitudeDegrees>',
        '        </EndPosition>',
        '        <Intensity>Active</Intensity>',
        '      </Lap>',
        '      <Track>'
      )
      data.points.forEach(p => {
        tcxText.push(
          '        <Trackpoint>'
        )
        if (hasTime) {
          let timestr = moment(data.start).add(p.elapsed, 'seconds').utc().format('YYYY-MM-DD[T]HH:mm:ss.SSS[Z]')
          tcxText.push('          <Time>' + timestr + '</Time>')
        }
        tcxText.push(
          '          <Position>',
          `            <LatitudeDegrees>${round(p.lat, 8)}</LatitudeDegrees>`,
          `            <LongitudeDegrees>${round(p.lon, 8)}</LongitudeDegrees>`,
          '          </Position>',
          `          <AltitudeMeters>${round(p.alt, 2)}</AltitudeMeters>`,
          `          <DistanceMeters>${round(p.loc * 1000, 2)}</DistanceMeters>`,
          '        </Trackpoint>'
        )
      })

      tcxText.push(
        '      </Track>'
      )
      data.segments.forEach(s => {
        let wp = s.waypoint2
        if (wp.tier === 1) {
          tcxText.push(
            '      <CoursePoint>',
            '        <Name>' + wp.name + '</Name>',
            '        <PointType>Generic</PointType>'
          )
          if (hasTime) {
            let timestr = moment(data.start).add(s.elapsed, 'seconds').utc().format('YYYY-MM-DD[T]HH:mm:ss.SSS[Z]')
            tcxText.push(
              '        <Time>' + timestr + '</Time>'
            )
          }
          tcxText.push(
            '        <Position>',
            '          <LatitudeDegrees>' + round(wp.lat, 8) + '</LatitudeDegrees>',
            '          <LongitudeDegrees>' + round(wp.lon, 8) + '</LongitudeDegrees>',
            '        </Position>',
            '        <AltitudeMeters>' + round(wp.elevation, 2) + '</AltitudeMeters>',
            '      </CoursePoint>'
          )
        }
      })
      tcxText.push(
        '    </Course>',
        '  </Courses>',
        '</TrainingCenterDatabase>'
      )
      return tcxText
    }
  }
}
</script>
