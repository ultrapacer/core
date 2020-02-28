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
          Download "{{ filename }}.gpx"
        </b-link><br/>
        <b-link :href="tcxURL" :download="this.filename +'.tcx'">
          Download "{{ filename }}.tcx"
        </b-link>
      </p>
    </b-toast>
  </div>
</template>

<script>
import moment from 'moment-timezone'
import api from '@/api'
import geo from '@/util/geo'
import { round, interp } from '@/util/math'
export default {
  props: ['isAuthenticated'],
  data () {
    return {
      gpxURL: null,
      tcxURL: null,
      filename: ''
    }
  },
  methods: {
    async start (data, updateFn) {
      let t = this.$logger('DownloadGPX|start')
      if (this.gpxURL !== null) {
        window.URL.revokeObjectURL(this.gpxURL)
        window.URL.revokeObjectURL(this.tcxURL)
        this.gpxURL = null
        this.tcxURL = null
      }
      this.$bvToast.show('my-toast')
      let full = await api.getCourseField(data.course._id, 'raw')
      full = full.map(x => {
        return {lat: x[0], lon: x[1], alt: x[2]}
      })
      // add locations:
      full = geo.addLoc(full)
      // remove any points that have zero change in location:
      full = full.filter((p, i) => i === 0 || p.dloc > 0)

      let hasTime = data.event.start && data.plan
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
          red = result.points
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

      this.writeFile({
        course: data.course,
        plan: data.plan,
        points: full,
        start: data.event.start || null,
        segments: data.segments
      })
      this.$logger('DownloadGPX|start', t)
    },
    writeFile (data) {
      this.$bvToast.show('my-toast')

      this.filename = data.course.name + (data.plan ? (' - ' + data.plan.name) : '')

      let hasTime = data.start && data.points[0].hasOwnProperty('elapsed')

      let gpxText = ['<?xml version="1.0" encoding="UTF-8"?>',
        '<gpx creator="ultraPacer" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd" version="1.1" xmlns="http://www.topografix.com/GPX/1/1">',
        ' <trk>',
        '  <name>' + this.filename + '</name>',
        '  <type>9</type>',
        '  <trkseg>']

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
        let timestr = ''
        gpxText.push(`  <trkpt lat="${round(p.lat, 8)}" lon="${round(p.lon, 8)}">`)
        gpxText.push(`   <ele>${round(p.alt, 2)}</ele>`)
        if (hasTime) {
          timestr = moment(data.start).add(p.elapsed, 'seconds').utc().format('YYYY-MM-DD[T]HH:mm:ss.SSS[Z]')
          gpxText.push(`   <time>${timestr}</time>`)
        }
        gpxText.push('  </trkpt>')

        tcxText.push(
          '        <Trackpoint>'
        )
        if (hasTime) {
          tcxText.push(
            `          <Time>${timestr}</Time>`
          )
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

      gpxText.push('  </trkseg>', ' </trk>', '</gpx>')
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

      var gpx = new Blob([gpxText.join('\r')], {type: 'text/plain'})
      var tcx = new Blob([tcxText.join('\r')], {type: 'text/plain'})

      this.gpxURL = window.URL.createObjectURL(gpx)
      this.tcxURL = window.URL.createObjectURL(tcx)

      this.$ga.event('Course', 'download', data.course.public ? data.course.name : 'private')
    }
  }
}
</script>
