<template>
  <div>
    <b-modal
      id="download-modal"
      centered
      title="Download GPS/TCX Files"
      hide-footer
    >
    <p>Select your download type below. Use the "Low Resolution" files if loading onto your watch{{ hasTime ? 'for real-time pacing' : '' }}.</p>
    <p v-show="!hasTime">Create/select a plan for this course to download with time & pacing data.</p>
      <div class="text-center">
        <b-button-group vertical>
          <download-track-button
            type="GPX"
            resolution="Original"
            :ready="ready.gpx"
            :spinner="working.gpx"
            :url="urls.gpx"
            :filename="filenames.gpx"
            :disabled="disableButtons"
            @generate="generate('gpx','orig','gpx')"
          ></download-track-button>
          <download-track-button
            type="TCX"
            resolution="Original"
            :ready="ready.tcx"
            :spinner="working.tcx"
            :url="urls.tcx"
            :filename="filenames.tcx"
            :disabled="disableButtons"
            @generate="generate('tcx','orig','tcx')"
          ></download-track-button>
          <download-track-button
            type="GPX"
            resolution="Low"
            :ready="ready.gpx2"
            :spinner="working.gpx2"
            :url="urls.gpx2"
            :filename="filenames.gpx2"
            :disabled="disableButtons"
            @generate="generate('gpx','low','gpx2')"
          ></download-track-button>
          <download-track-button
            type="TCX"
            resolution="Low"
            :ready="ready.tcx2"
            :spinner="working.tcx2"
            :url="urls.tcx2"
            :filename="filenames.tcx2"
            :disabled="disableButtons"
            @generate="generate('tcx','low','tcx2')"
          ></download-track-button>
        </b-button-group>
      </div>
    </b-modal>
  </div>
</template>

<script>
/* eslint new-cap: 0 */
import moment from 'moment-timezone'
import api from '@/api'
import geo from '@/util/geo'
import { round, interp } from '@/util/math'
import DownloadTrackButton from './DownloadTrackButton'
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
  props: ['isAuthenticated', 'course', 'plan', 'event', 'points', 'segments', 'updateFn'],
  components: {
    DownloadTrackButton
  },
  data () {
    return {
      urls: {},
      filenames: [],
      raw: [],
      working: {
        gpx: false,
        tcx: false,
        gpx2: false,
        tcx2: false
      },
      ready: {
        gpx: false,
        tcx: false,
        gpx2: false,
        tcx2: false
      },
      disableButtons: false
    }
  },
  computed: {
    hasTime () {
      return this.event.start && this.plan
    }
  },
  methods: {
    async show () {
      this.ready = {}
      this.$bvModal.show('download-modal')
    },
    async generate (type, resolution, target) {
      let t = this.$logger(`DownloadGPX|generate ${type} ${resolution}`)

      this.working[target] = true
      this.ready[target] = false
      this.disableButtons = true
      await new Promise(resolve => setTimeout(resolve, 250)) // sleep a bit

      if (this.urls[target]) {
        window.URL.revokeObjectURL(this.urls[target])
        this.urls[target] = null
      }

      if (this.hasTime && !this.points[0].hasOwnProperty('elapsed')) {
        await this.updateFn()
      }

      let pnts = []
      if (resolution === 'orig') {
        // ORIGINAL RESOLUTION
        if (!this.raw.length) { // download raw data:
          this.raw = await api.getCourseField(this.course._id, 'raw')
        }
        pnts = this.raw.map(x => {
          return {lat: x[0], lon: x[1], alt: x[2]}
        })
        pnts = geo.addLoc(pnts, this.course.distance)
        if (this.hasTime) { // interpolate times from distances in pnts
          let red = this.points.map(p => { return {...p} })
          let lastelapsed = 0
          pnts.forEach(p => {
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
          pnts = pnts.filter((p, i) => i === 0 || p.delapsed > 0)
        }
      } else {
        // LOW RESOLUTION (adjust odd points lat/lon to correct distance)
        pnts = this.points.map(p => { return {...p} })
        pnts = geo.addLoc(pnts, this.course.distance) // update locations
        pnts.forEach((p, i) => {
          if (
            i % 2 === 0 &&
            i < pnts.length - 2 &&
            (pnts[i + 1].dloc + pnts[i + 2].dloc < this.points[i + 1].dloc + this.points[i + 2].dloc)
          ) {
            let A = new sgeo.latlon(p.lat, p.lon)
            let B = new sgeo.latlon(pnts[i + 1].lat, pnts[i + 1].lon)
            let C = new sgeo.latlon(pnts[i + 2].lat, pnts[i + 2].lon)
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
              pnts[i + 1].lat = Number(B2.lat)
              pnts[i + 1].lon = Number(B2.lng)
            }
          }
        })
        pnts = geo.addLoc(pnts, this.course.distance)
      }

      let name = `uP-${this.course.name}${(this.plan ? ('-' + this.plan.name) : '')}-${resolution}`
      name = name.replace(/ /g, '_')
      this.filenames[target] = `${name}.${type}`
      let fn = (type === 'gpx') ? this.writeGPXText : this.writeTCXText
      let text = fn(pnts, name)
      var file = new Blob([text], {type: 'text/plain'})
      this.urls[target] = window.URL.createObjectURL(file)
      this.working[target] = false
      this.ready[target] = true
      this.disableButtons = false
      this.$ga.event('Course', 'download', this.course.public ? this.course.name : 'private')
      this.$logger('DownloadGPX|generate', t)
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
      let trackpoints = pnts.map(p => {
        let o = {
          Position: {
            LatitudeDegrees: round(p.lat, 8),
            LongitudeDegrees: round(p.lon, 8)
          },
          AltitudeMeters: round(p.alt, 2),
          DistanceMeters: round(p.loc * 1000, 2)
        }
        if (this.hasTime) {
          o.Time = moment(this.event.start).add(p.elapsed, 'seconds').utc().format('YYYY-MM-DD[T]HH:mm:ss.SSS[Z]')
        }
        return o
      })
      let lap = {
        DistanceMeters: round(pnts[pnts.length - 1].loc * 1000, 2),
        Intensity: 'Active'
      }
      if (this.hasTime) {
        lap.TotalTimeSeconds = round(pnts[pnts.length - 1].elapsed, 3)
      }
      let coursepoints = this.segments.filter(s => s.waypoint2.tier < 3).map(s => {
        let o = {
          Name: s.waypoint2.name,
          PointType: 'Generic',
          Position: {
            LatitudeDegrees: round(s.waypoint2.lat, 8),
            LongitudeDegrees: round(s.waypoint2.lon, 8)
          },
          AltitudeMeters: round(s.waypoint2.elevation, 2)
        }
        if (this.hasTime) {
          o.Time = moment(this.event.start).add(s.elapsed, 'seconds').utc().format('YYYY-MM-DD[T]HH:mm:ss.SSS[Z]')
        }
        return o
      })
      let obj = {
        TrainingCenterDatabase: {
          $: {
            creator: 'ultraPacer',
            'xsi:schemaLocation': 'http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2 http://www.garmin.com/xmlschemas/TrainingCenterDatabasev2.xsd',
            'xmlns:ns5': 'http://www.garmin.com/xmlschemas/ActivityGoals/v1',
            'xmlns:ns3': 'http://www.garmin.com/xmlschemas/ActivityExtension/v2',
            'xmlns:ns2': 'http://www.garmin.com/xmlschemas/UserProfile/v2',
            xmlns: 'http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2',
            'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance'
          },
          Courses: {
            Course: {
              Name: name,
              Lap: lap,
              Track: {
                Trackpoint: trackpoints
              },
              CoursePoint: coursepoints
            }
          }
        }
      }
      var builder = new xml2js.Builder({
        xmldec: { version: '1.0', encoding: 'UTF-8', standalone: null }
      })
      var xml = builder.buildObject(obj)
      return xml
    }
  }
}
</script>
