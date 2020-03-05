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
      <div v-else>
        <p>
          <b>Original resolution</b><br/>
          <b-link :href="gpxURL" :download="this.filename +'-orig.gpx'">
            "{{ filename }}-orig.gpx"
          </b-link>
        </p>
        <p>
          <b>Low resolution (for watch/pacing)</b><br/>
          <b-link :href="gpx2URL" :download="this.filename + '-low.gpx'">
            "{{ filename }}-low.gpx"
          </b-link>
        </p>
      </div>
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
var xml2js = require('xml2js')

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
  props: ['isAuthenticated', 'course', 'plan', 'event', 'points', 'segments'],
  data () {
    return {
      gpxURL: null,
      gpx2URL: null,
      tcxURL: null,
      filename: '',
      raw: []
    }
  },
  computed: {
    hasTime () {
      return this.event.start && this.plan
    }
  },
  methods: {
    async start (updateFn) {
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
      await new Promise(resolve => setTimeout(resolve, 250)) // sleep a bit

      if (this.hasTime && !this.points[0].hasOwnProperty('elapsed')) {
        await updateFn()
      }

      // ORIGINAL RESOLUTION
      if (!this.raw.length) { // download raw data:
        this.raw = await api.getCourseField(this.course._id, 'raw')
      }
      let orig = this.raw.map(x => {
        return {lat: x[0], lon: x[1], alt: x[2]}
      })
      orig = geo.addLoc(orig)
      if (this.hasTime) { // interpolate times from distances in orig
        let red = this.points.map(p => { return {...p} })
        let lastelapsed = 0
        orig.forEach(p => {
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
        orig = orig.filter((p, i) => i === 0 || p.delapsed > 0)
      }

      // LOW RESOLUTION (adjust odd points lat/lon to correct distance)
      let low = this.points.map(p => { return {...p} })
      low = geo.addLoc(low) // update locations
      low.forEach((p, i) => {
        if (
          i % 2 === 0 &&
          i < low.length - 2 &&
          (low[i + 1].dloc + low[i + 2].dloc < this.points[i + 1].dloc + this.points[i + 2].dloc)
        ) {
          let A = new sgeo.latlon(p.lat, p.lon)
          let B = new sgeo.latlon(low[i + 1].lat, low[i + 1].lon)
          let C = new sgeo.latlon(low[i + 2].lat, low[i + 2].lon)
          let bAB = A.bearingTo(B)
          let bAC = A.bearingTo(C)
          let dAC = A.distanceTo(C)
          if (dAC < this.points[i + 1].dloc + this.points[i + 2].dloc) {
            let alpha = lawOfCosines(dAC, this.points[i + 1].dloc, this.points[i + 2].dloc)
            let bAB2 = 0
            if ((bAB - bAC < 180 && bAC < bAB) || (bAC > 270 && bAB < 90)) {
              bAB2 = bAC + alpha
            } else {
              bAB2 = bAC - alpha
            }
            let B2 = A.destinationPoint(bAB2, this.points[i + 1].dloc)
            low[i + 1].lat = Number(B2.lat)
            low[i + 1].lon = Number(B2.lng)
          }
        }
      })
      low = geo.addLoc(low)

      this.filename = 'uP-' + this.course.name + (this.plan ? ('-' + this.plan.name) : '')
      this.filename = this.filename.replace(/ /g, '_')
      let gpxText = this.writeGPXText(orig, this.filename + '-orig')
      let gpxText2 = this.writeGPXText(low, this.filename + '-low')
      // let tcxText = this.writeTCXText(orig, this.filename + '-orig')
      var gpx = new Blob([gpxText], {type: 'text/plain'})
      var gpx2 = new Blob([gpxText2], {type: 'text/plain'})
      // var tcx = new Blob([tcxText.join('\r')], {type: 'text/plain'})
      this.gpxURL = window.URL.createObjectURL(gpx)
      this.gpx2URL = window.URL.createObjectURL(gpx2)
      // this.tcxURL = window.URL.createObjectURL(tcx)

      this.$ga.event('Course', 'download', this.course.public ? this.course.name : 'private')
      this.$logger('DownloadGPX|start', t)
    },
    writeGPXText (pnts, name) {
      let trkpts = pnts.map(p => {
        let o = {
          $: {
            lat: round(p.lat, 8),
            lon: round(p.lon, 8)
          },
          ele: round(p.alt, 2)
        }
        if (this.hasTime) {
          o.time = moment(this.event.start).add(p.elapsed, 'seconds').utc().format('YYYY-MM-DD[T]HH:mm:ss.SSS[Z]')
        }
        return o
      })
      console.log(trkpts)

      let obj = {
        gpx: {
          $: {
            creator: 'ultraPacer',
            'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
            'xsi:schemaLocation': 'http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd',
            version: '1.1',
            xmlns: 'http://www.topografix.com/GPX/1/1'
          },
          trk: {
            name: name,
            type: 9,
            trkseg: {
              trkpt: trkpts
            }
          }
        }
      }
      var builder = new xml2js.Builder({
        xmldec: { version: '1.0', encoding: 'UTF-8', standalone: null }
      })
      var xml = builder.buildObject(obj)
      return xml
    },
    writeTCXText (pnts, name) {
      let tcxText = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<TrainingCenterDatabase xmlns="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2 http://www.garmin.com/xmlschemas/TrainingCenterDatabasev2.xsd">',
        '  <Folders>',
        '    <Courses>',
        '      <CourseFolder Name="ultraPacer">',
        '        <CourseNameRef>',
        '          <Id>' + name + '</Id>',
        '        </CourseNameRef>',
        '      </CourseFolder>',
        '    </Courses>',
        '  </Folders>',
        '  <Courses>',
        '    <Course>',
        '      <Name>' + name + '</Name>',
        '      <Lap>'
      ]
      if (this.hasTime) {
        tcxText.push(
          '        <TotalTimeSeconds>' + round(pnts[pnts.length - 1].elapsed, 3) + '</TotalTimeSeconds>'
        )
      }
      tcxText.push(
        '        <DistanceMeters>' + round(pnts[pnts.length - 1].loc * 1000, 2) + '</DistanceMeters>',
        '        <BeginPosition>',
        '          <LatitudeDegrees>' + pnts[0].lat + '</LatitudeDegrees>',
        '          <LongitudeDegrees>' + pnts[0].lon + '</LongitudeDegrees>',
        '        </BeginPosition>',
        '        <EndPosition>',
        '          <LatitudeDegrees>' + pnts[pnts.length - 1].lat + '</LatitudeDegrees>',
        '          <LongitudeDegrees>' + pnts[pnts.length - 1].lon + '</LongitudeDegrees>',
        '        </EndPosition>',
        '        <Intensity>Active</Intensity>',
        '      </Lap>',
        '      <Track>'
      )
      pnts.forEach(p => {
        tcxText.push(
          '        <Trackpoint>'
        )
        if (this.hasTime) {
          let timestr = moment(this.event.start).add(p.elapsed, 'seconds').utc().format('YYYY-MM-DD[T]HH:mm:ss.SSS[Z]')
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
      this.segments.forEach(s => {
        let wp = s.waypoint2
        if (wp.tier === 1) {
          tcxText.push(
            '      <CoursePoint>',
            '        <Name>' + wp.name + '</Name>',
            '        <PointType>Generic</PointType>'
          )
          if (this.hasTime) {
            let timestr = moment(this.event.start).add(s.elapsed, 'seconds').utc().format('YYYY-MM-DD[T]HH:mm:ss.SSS[Z]')
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
