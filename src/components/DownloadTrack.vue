<template>
  <div>
    <b-modal
      ref="modal"
      centered
      title="Download GPS/TCX Files"
      hide-footer
    >
      <p>Select your download type below.</p>
      <p v-show="!hasTime">
        Create/select a plan for this course to download with time & pacing data.
      </p>
      <div class="text-center">
        <b-button-group vertical>
          <download-track-button
            type="GPX"
            :ready="ready.gpx"
            :spinner="working.gpx"
            :url="urls.gpx"
            :filename="filenames.gpx"
            :disabled="disableButtons"
            @generate="generate('gpx','gpx')"
          />
          <download-track-button
            type="TCX"
            :ready="ready.tcx"
            :spinner="working.tcx"
            :url="urls.tcx"
            :filename="filenames.tcx"
            :disabled="disableButtons"
            @generate="generate('tcx','tcx')"
          />
        </b-button-group>
      </div>
    </b-modal>
  </div>
</template>

<script>
import moment from 'moment-timezone'
import DownloadTrackButton from './DownloadTrackButton'
const xml2js = require('xml2js')

export default {
  components: {
    DownloadTrackButton
  },
  props: {
    course: {
      type: Object,
      required: true
    },
    plan: {
      type: Object,
      required: true
    },
    event: {
      type: Object,
      required: true
    },
    segments: {
      type: Array,
      required: true
    },
    updateFn: {
      type: Function,
      required: true
    }
  },
  data () {
    return {
      logger: this.$log.child({ file: 'DownloadTrack.vue' }),
      urls: {},
      filenames: [],
      working: { gpx: false, tcx: false },
      ready: { gpx: false, tcx: false },
      disableButtons: false
    }
  },
  computed: {
    hasTime () {
      return Boolean(this.event.hasTOD() && this.plan && Object.keys(this.plan).length)
    }
  },
  methods: {
    async show () {
      this.ready = {}
      this.$refs.modal.show()
    },
    async generate (type, target) {
      const log = this.logger.child({ method: 'generate' })
      try {
        log.verbose('run')

        this.working[target] = true
        this.ready[target] = false
        this.disableButtons = true
        await new Promise(resolve => setTimeout(resolve, 250)) // sleep a bit

        if (this.urls[target]) {
          window.URL.revokeObjectURL(this.urls[target])
          this.urls[target] = null
        }

        if (this.hasTime && this.course.points[0].elapsed === undefined) {
          await this.updateFn()
        }

        const pnts = this.course.points

        /* this code  will adjust odd points to make length work; may want to reuse someday
          // (adjust odd points lat/lon to correct distance)
          // create a copy of points with new Point/LLA objects
          pnts = await this.$core.tracks.create(
            this.course.points.map(p => { return [p.lat, p.lon, p.alt] })
          )

          pnts.forEach((p, i) => {
            if (
              i % 2 === 0 &&
              i < pnts.length - 2 &&
              (pnts[i + 1].dloc + pnts[i + 2].dloc < this.course.points[i + 1].dloc + this.course.points[i + 2].dloc)
            ) {
              const A = new sgeo.latlon(p.lat, p.lon)
              const B = new sgeo.latlon(pnts[i + 1].lat, pnts[i + 1].lon)
              const C = new sgeo.latlon(pnts[i + 2].lat, pnts[i + 2].lon)
              const bAB = A.bearingTo(B)
              const bAC = A.bearingTo(C)
              const dAC = A.distanceTo(C)
              if (dAC < this.course.points[i + 1].dloc + this.course.points[i + 2].dloc) {
                const alpha = lawOfCosines(dAC, this.course.points[i + 1].dloc, this.course.points[i + 2].dloc)
                let bAB2 = 0
                if ((bAB - bAC < 180 && bAC < bAB) || (bAC > 270 && bAB < 90)) {
                  bAB2 = bAC + alpha
                } else {
                  bAB2 = bAC - alpha
                }
                const B2 = A.destinationPoint(bAB2, this.course.points[i + 1].dloc)
                pnts[i + 1].lat = Number(B2.lat)
                pnts[i + 1].lon = Number(B2.lng)
              }
            }
          })
        */

        let name = `uP-${this.course.name}${(this.plan.name && this.hasTime ? ('-' + this.plan.name) : '')}`

        name = name.replace(/ /g, '_')
        this.filenames[target] = `${name}.${type}`
        const fn = (type === 'gpx') ? this.writeGPXText : this.writeTCXText
        const text = fn(pnts, name)
        const file = new Blob([text], { type: 'text/plain' })
        this.urls[target] = window.URL.createObjectURL(file)
        this.working[target] = false
        this.ready[target] = true
        this.disableButtons = false
        this.$gtage(this.$gtag, 'Course', 'download', this.course.public ? this.course.name : 'private')
      } catch (error) {
        log.error(error)
      }
    },
    writeGPXText (pnts, name) {
      const trkpts = pnts.map(p => {
        const o = {
          $: {
            lat: this.$math.round(p.lat, 8),
            lon: this.$math.round(p.lon, 8)
          }
        }
        if (this.course.db?.track?.source?.alt !== 'google') {
          o.ele = this.$math.round(p.alt, 2)
        }
        if (this.hasTime) {
          o.time = moment(this.event.start).add(p.elapsed, 'seconds').utc().format('YYYY-MM-DD[T]HH:mm:ss.SSS[Z]')
        }
        return o
      })
      const obj = {
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
      const builder = new xml2js.Builder({
        xmldec: { version: '1.0', encoding: 'UTF-8', standalone: null }
      })
      const xml = builder.buildObject(obj)
      return xml
    },
    writeTCXText (pnts, name) {
      const trackpoints = pnts.map(p => {
        const o = {
          Position: {
            LatitudeDegrees: this.$math.round(p.lat, 8),
            LongitudeDegrees: this.$math.round(p.lon, 8)
          },
          DistanceMeters: this.$math.round(p.loc * 1000, 2)
        }
        if (this.course.db?.track?.source?.alt !== 'google') {
          o.AltitudeMeters = this.$math.round(p.alt, 2)
        }
        if (this.hasTime) {
          o.Time = moment(this.event.start).add(p.elapsed, 'seconds').utc().format('YYYY-MM-DD[T]HH:mm:ss.SSS[Z]')
        }
        return o
      })
      const lap = {
        DistanceMeters: this.$math.round(pnts[pnts.length - 1].loc * 1000, 2),
        Intensity: 'Active'
      }
      if (this.hasTime) {
        lap.TotalTimeSeconds = this.$math.round(pnts[pnts.length - 1].elapsed, 3)
      }
      const coursepoints = this.segments.filter(s => s.waypoint.tier < 3).map(s => {
        const o = {
          Name: s.waypoint.name,
          PointType: 'Generic',
          Position: {
            LatitudeDegrees: this.$math.round(s.waypoint.lat, 8),
            LongitudeDegrees: this.$math.round(s.waypoint.lon, 8)
          }
        }
        if (this.course.db?.track?.source?.alt !== 'google') {
          o.AltitudeMeters = this.$math.round(s.waypoint.alt, 2)
        }
        if (this.hasTime) {
          o.Time = moment(this.event.start).add(s.elapsed, 'seconds').utc().format('YYYY-MM-DD[T]HH:mm:ss.SSS[Z]')
        }
        return o
      })
      const obj = {
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
      const builder = new xml2js.Builder({
        xmldec: { version: '1.0', encoding: 'UTF-8', standalone: null }
      })
      const xml = builder.buildObject(obj)
      return xml
    }
  }
}
</script>
