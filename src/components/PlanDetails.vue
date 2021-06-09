<template>
  <b-list-group
    v-if="!busy"
  >
    <b-list-group-item>
      <h5 class="mb-1">
        Course Description
      </h5>
      <span v-if="course.description">
        {{ course.description }}
      </span>
      <span v-else>
        The <b>{{ course.name }}</b> course covers <b>{{ $units.distf(course.distance, 1) }} {{ $units.dist }}</b> with <b>{{ $units.altf(course.gain, 0) | commas }} {{ $units.alt }}</b> of climbing.
      </span>
      <span
        v-if="course.source.alt"
        class="mb-0"
      >
        <br>
        Elevation data is {{ elevationDatasets[course.source.alt] }}.
      </span>
      <span
        v-if="userCount > 9"
        class="mb-0"
      >
        <br>
        <b>{{ userCount }} runners</b> have ultraPacer plans for this course.
      </span>
    </b-list-group-item>
    <b-list-group-item v-if="showPaceInfo">
      <h5 class="mb-1">
        Pacing Calculation Basis
      </h5>
      <p class="mb-1">
        <b>{{ methods[plan.pacingMethod] }}</b>
        of <b>{{ pacingTargetF }}</b>
      </p>
    </b-list-group-item>
    <b-list-group-item v-if="event.sun">
      <h5 class="mb-1">
        Event
      </h5>
      <b-row>
        <b-col
          cols="4"
          sm="3"
          lg="3"
          xl="2"
          class="text-right pr-0"
        >
          Date/Time:
        </b-col>
        <b-col><b>{{ event.start | datetime(event.timezone) }}</b></b-col>
      </b-row>
      <b-row>
        <b-col
          cols="4"
          sm="3"
          lg="3"
          xl="2"
          class="text-right pr-0"
        >
          Dawn:
        </b-col>
        <b-col><b>{{ sec2string(event.sun.dawn, 'am/pm') }}</b></b-col>
      </b-row>
      <b-row>
        <b-col
          cols="4"
          sm="3"
          lg="3"
          xl="2"
          class="text-right pr-0"
        >
          Sunrise:
        </b-col>
        <b-col><b>{{ sec2string(event.sun.rise, 'am/pm') }}</b></b-col>
      </b-row>
      <b-row>
        <b-col
          cols="4"
          sm="3"
          lg="3"
          xl="2"
          class="text-right pr-0"
        >
          Sunset:
        </b-col>
        <b-col><b>{{ sec2string(event.sun.set, 'am/pm') }}</b></b-col>
      </b-row>
      <b-row>
        <b-col
          cols="4"
          sm="3"
          lg="3"
          xl="2"
          class="text-right pr-0"
        >
          Dusk:
        </b-col>
        <b-col><b>{{ sec2string(event.sun.dusk, 'am/pm') }}</b></b-col>
      </b-row>
    </b-list-group-item>
    <b-list-group-item v-if="showPaceInfo">
      <h5 class="mb-1">
        Time
      </h5>
      <b-row>
        <b-col
          cols="4"
          sm="3"
          lg="3"
          xl="2"
          class="text-right pr-0"
        >
          Total Time:
        </b-col>
        <b-col><b>{{ sec2string(pacing.time, '[h]:m:ss') }}</b></b-col>
      </b-row>
      <b-row>
        <b-col
          cols="4"
          sm="3"
          lg="3"
          xl="2"
          class="text-right pr-0"
        >
          Moving Time:
        </b-col>
        <b-col><b>{{ sec2string(pacing.time - pacing.delay, '[h]:m:ss') }}</b></b-col>
      </b-row>
      <b-row v-if="event.startTime">
        <b-col
          cols="4"
          sm="3"
          lg="3"
          xl="2"
          class="text-right pr-0"
        >
          Start Time:
        </b-col>
        <b-col><b>{{ sec2string(event.startTime, 'am/pm') }}</b></b-col>
      </b-row>
      <b-row v-if="event.startTime">
        <b-col
          cols="4"
          sm="3"
          lg="3"
          xl="2"
          class="text-right pr-0"
        >
          Finish Time:
        </b-col>
        <b-col><b>{{ sec2string((event.startTime + pacing.time) % 86400, 'am/pm') }}</b></b-col>
      </b-row>
    </b-list-group-item>
    <b-list-group-item v-if="showPaceInfo">
      <h5 class="mb-1">
        Paces
      </h5>
      <b-row>
        <b-col
          cols="4"
          sm="3"
          lg="3"
          xl="2"
          class="text-right pr-0"
        >
          Average:
        </b-col>
        <b-col><b>{{ sec2string(fPace(pacing.pace), 'mm:ss') }}</b> *</b-col>
      </b-row>
      <b-row>
        <b-col
          cols="4"
          sm="3"
          lg="3"
          xl="2"
          class="text-right pr-0"
        >
          Normalized:
        </b-col>
        <b-col><b>{{ sec2string(fPace(pacing.np), 'mm:ss') }}</b> *,**</b-col>
      </b-row>
      <b-row>
        <b-col
          cols="4"
          sm="3"
          lg="3"
          xl="2"
          class="text-right pr-0"
        >
          Overall:
        </b-col>
        <b-col><b>{{ sec2string(fPace(pacing.time / course.distance), 'mm:ss') }}</b></b-col>
      </b-row>
      <b-row>
        <b-col
          cols="4"
          sm="3"
          lg="3"
          xl="2"
          class="text-right pr-0"
        />
        <b-col>
          <small>&nbsp; * While Moving</small><br>
          <small>&nbsp; ** Normalized for {{ normString }}</small>
        </b-col>
      </b-row>
    </b-list-group-item>
    <b-list-group-item v-if="showPaceInfo && pacing.delay">
      <h5 class="mb-1">
        Aid Station Delays
      </h5>
      <b-row>
        <b-col
          cols="4"
          sm="3"
          lg="3"
          xl="2"
          class="text-right pr-0"
        >
          Typical Delay:
        </b-col>
        <b-col><b>{{ sec2string(plan.waypointDelay, '[h]:m:ss') }}</b></b-col>
      </b-row>
      <b-row>
        <b-col
          cols="4"
          sm="3"
          lg="3"
          xl="2"
          class="text-right pr-0"
        >
          Quantity:
        </b-col>
        <b-col><b>{{ aidStationCount }} stop<span v-if="aidStationCount>1">s</span></b></b-col>
      </b-row>
      <b-row>
        <b-col
          cols="4"
          sm="3"
          lg="3"
          xl="2"
          class="text-right pr-0"
        >
          Total Delay:
        </b-col>
        <b-col><b>{{ sec2string(pacing.delay, '[h]:m:ss') }}</b></b-col>
      </b-row>
    </b-list-group-item>
    <b-list-group-item v-if="showPaceInfo && plan.drift">
      <h5 class="mb-1">
        Pace Drift
      </h5>
      <b-row
        v-if="visible"
        style="height:100px"
      >
        <b-container style="max-width: 400px">
          <drift-chart
            :drift="plan.drift"
            :course-distance="course.distance"
          />
        </b-container>
      </b-row>
      <b-row
        v-if="!Array.isArray(plan.drift)"
      >
        <b-col
          cols="4"
          sm="3"
          lg="3"
          xl="2"
          class="text-right pr-0"
        >
          Pace Drift:
        </b-col>
        <b-col><b>{{ plan.drift }} %</b></b-col>
      </b-row>
      <b-row>
        <b-col
          cols="4"
          sm="3"
          lg="3"
          xl="2"
          class="text-right pr-0"
        >
          Starting Pace:
        </b-col>
        <b-col><b>{{ sec2string(fPace(startPace), 'mm:ss') }}</b> *</b-col>
      </b-row>
      <b-row>
        <b-col
          cols="4"
          sm="3"
          lg="3"
          xl="2"
          class="text-right pr-0"
        >
          Average Pace:
        </b-col>
        <b-col><b>{{ sec2string(fPace(pacing.np), 'mm:ss') }}</b> *</b-col>
      </b-row>
      <b-row>
        <b-col
          cols="4"
          sm="3"
          lg="3"
          xl="2"
          class="text-right pr-0"
        >
          Ending Pace:
        </b-col>
        <b-col><b>{{ sec2string(fPace(endPace), 'mm:ss') }}</b> *</b-col>
      </b-row>
      <b-row>
        <b-col
          cols="4"
          sm="3"
          lg="3"
          xl="2"
          class="text-right pr-0"
        />
        <b-col>
          <small>&nbsp; * Normalized for {{ normString }}</small>
        </b-col>
      </b-row>
    </b-list-group-item>
    <b-list-group-item>
      <h5 class="mb-1">
        Grade Effects
      </h5>
      <b-row>
        <b-col
          cols="1"
          class="text-right pr-0"
        /><b-col>
          <p class="mb-1">
            Overall Grade Factor:
            <b>{{ pacing.factors.gF - 1 | percentWithPace(pacing.np, $units) }}</b>
          </p>
          <p class="mb-1">
            Steepest Climb:
            <b>{{ maxGrade.toFixed(1) }}%</b> grade
            [<b>{{ gF(maxGrade) - 1 | percentWithPace(pacing.np, $units) }}</b>]
          </p>
          <p class="mb-1">
            Steepest Descent:
            <b>{{ minGrade.toFixed(1) }}%</b> grade
            [<b>{{ gF(minGrade) - 1 | percentWithPace(pacing.np, $units) }}</b>]
          </p>
        </b-col>
      </b-row>
    </b-list-group-item>
    <b-list-group-item v-if="round(pacing.factors.aF, 3) > 1">
      <h5 class="mb-1">
        Altitude Effects
      </h5>
      <b-row>
        <b-col
          cols="1"
          class="text-right pr-0"
        /><b-col>
          <p class="mb-1">
            Average Altitude Factor:
            <b>{{ pacing.factors.aF - 1 | percentWithPace(pacing.np, $units) }}</b>
          </p>
          <p class="mb-1">
            Highest Altitude Factor:
            <b>{{ aF(maxAltitude) - 1 | percentWithPace(pacing.np, $units) }}</b>
            at
            <b>{{ $units.altf(maxAltitude, 0) | commas }} {{ $units.alt }}</b>
          </p>
          <p class="mb-1">
            Lowest Altitude Factor:
            <b>{{ aF(minAltitude) - 1 | percentWithPace(pacing.np, $units) }}</b>
            at
            <b>{{ $units.altf(minAltitude, 0) | commas }} {{ $units.alt }}</b>
          </p>
        </b-col>
      </b-row>
    </b-list-group-item>
    <b-list-group-item v-if="round(pacing.factors.tF, 3) > 1">
      <h5 class="mb-1">
        Terrain Effects
      </h5>
      <b-row>
        <b-col
          cols="1"
          class="text-right pr-0"
        /><b-col>
          <p class="mb-1">
            Overall Terrain Factor:
            <b>{{ pacing.factors.tF - 1 | percentWithPace(pacing.np, $units) }}</b>
          </p>
          <p class="mb-1">
            Hardest Terrain:
            <b>{{ pacing.fstats.max.tF - 1 | percentWithPace(pacing.np, $units) }}</b>
            over
            <b>{{ $units.distf(maxTFdist, 2) }} {{ $units.dist }}</b>
          </p>
          <p class="mb-1">
            Easiest Terrain:
            <b>{{ pacing.fstats.min.tF - 1 | percentWithPace(pacing.np, $units) }}</b>
            over
            <b>{{ $units.distf(minTFdist, 2) }} {{ $units.dist }}</b>
          </p>
        </b-col>
      </b-row>
    </b-list-group-item>
    <b-list-group-item v-if="round(pacing.factors.hF, 3) > 1">
      <h5 class="mb-1">
        Heat Effects
      </h5>
      <b-row
        v-if="visible"
        style="height:100px"
      >
        <b-container style="max-width: 400px">
          <heat-chart
            :heat-model="plan.heatModel"
            :sun="event.sun"
            :kilometers="kilometers"
          />
        </b-container>
      </b-row>
      <b-row>
        <b-col
          cols="1"
          class="text-right pr-0"
        /><b-col>
          <p class="mb-1">
            Average Heat Factor:
            <b>{{ pacing.factors.hF - 1 | percentWithPace(pacing.np, $units) }}</b>
          </p>
          <p class="mb-1">
            Highest Heat Factor:
            <b>{{ pacing.fstats.max.hF - 1 | percentWithPace(pacing.np, $units) }}</b>
          </p>
          <p class="mb-1">
            Lowest Heat Factor:
            <b>{{ pacing.fstats.min.hF - 1 | percentWithPace(pacing.np, $units) }}</b>
          </p>
        </b-col>
      </b-row>
    </b-list-group-item>
    <b-list-group-item v-if="showPaceInfo && round(pacing.factors.dark, 3) > 1">
      <h5 class="mb-1">
        Darkness Effects
      </h5>
      <b-row>
        <b-col
          cols="4"
          sm="3"
          lg="3"
          xl="2"
          class="text-right pr-0"
        >
          Avg. Factor:
        </b-col>
        <b-col>
          <b>{{ pacing.factors.dark - 1 | percentWithPace(pacing.np, $units) }}</b>
        </b-col>
      </b-row>
      <b-row>
        <b-col
          cols="4"
          sm="3"
          lg="3"
          xl="2"
          class="text-right pr-0"
        >
          Daylight Time:
        </b-col>
        <b-col>
          <b>
            {{ sec2string(pacing.sunTime.day, 'hh:mm:ss') }}&nbsp;
            ({{ $units.distf(pacing.sunDist.day, 2) }} {{ $units.dist }})
          </b>
        </b-col>
      </b-row>
      <b-row>
        <b-col
          cols="4"
          sm="3"
          lg="3"
          xl="2"
          class="text-right pr-0"
        >
          Twilight Time:
        </b-col>
        <b-col>
          <b>
            {{ sec2string(pacing.sunTime.twilight, 'hh:mm:ss') }}&nbsp;
            ({{ $units.distf(pacing.sunDist.twilight, 2) }} {{ $units.dist }})
          </b>
        </b-col>
      </b-row>
      <b-row>
        <b-col
          cols="4"
          sm="3"
          lg="3"
          xl="2"
          class="text-right pr-0"
        >
          Dark Time:
        </b-col>
        <b-col>
          <b>
            {{ sec2string(pacing.sunTime.dark, 'hh:mm:ss') }}&nbsp;
            ({{ $units.distf(pacing.sunDist.dark, 2) }} {{ $units.dist }})
          </b>
        </b-col>
      </b-row>
    </b-list-group-item>
    <b-list-group-item>
      <p
        v-if="showPaceInfo && !pacing.delay"
        class="mb-1"
      >
        No Delays
      </p>
      <p
        v-if="pacing.factors.aF <= 1"
        class="mb-1"
      >
        No Altitude Effects
      </p>
      <p
        v-if="pacing.factors.tF <= 1"
        class="mb-1"
      >
        No Terrain Effects
      </p>
      <p
        v-if="showPaceInfo && pacing.factors.hF <= 1"
        class="mb-1"
      >
        No Heat Effects
      </p>
      <p
        v-if="showPaceInfo && pacing.factors.dark <= 1"
        class="mb-1"
      >
        No Darkness Effects
      </p>
      <p
        v-if="showPaceInfo && !plan.drift"
        class="mb-1"
      >
        No Pace Drift
      </p>
    </b-list-group-item>
  </b-list-group>
</template>

<script>
import api from '@/api'
import moment from 'moment-timezone'
import { sec2string } from '../util/time'
import { aF, dF, gF } from '../util/normFactor'
import { round } from '../util/math'
import DriftChart from './DriftChart.vue'
import HeatChart from './HeatChart.vue'
export default {
  components: {
    DriftChart,
    HeatChart
  },
  filters: {
    percentWithPace (val, np, units) {
      let str = `${(val > 0 ? '+' : '')}${(val * 100).toFixed(1)}% `
      if (np) {
        if (val !== 0) {
          const fact = val > 0 ? 1 : -1
          val = fact * val
          const dPace = val * np / units.distScale
          str = `${str} (${sec2string(dPace, '[h]:m:ss')} min/${units.dist})`
        }
      }
      return str
    },
    datetime (val, tz) {
      const m = moment(val).tz(tz)
      return m.format('M/D/YYYY | h:mm A')
    }
  },
  props: {
    plan: {
      type: Object,
      required: true
    },
    points: {
      type: Array,
      required: true
    },
    pacing: {
      type: Object,
      required: true
    },
    course: {
      type: Object,
      required: true
    },
    event: {
      type: Object,
      required: true
    },
    kilometers: {
      type: Array,
      default: () => { return null }
    },
    busy: {
      type: Boolean,
      default: false
    },
    visible: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      elevationDatasets: {
        gpx: 'from an uploaded GPX file',
        'strava-route': 'sourced from Strava Routes',
        google: 'sourced from Google',
        'elevation-api': 'sourced from DEM-Net Elevation API by Xavier Fischer'
      },
      methods: {
        time: 'Finish Time',
        pace: 'Average Pace',
        np: 'Normalized Pace'
      },
      userCount: 0
    }
  },
  computed: {
    aidStationCount: function () {
      return this.course.waypoints.filter(
        wp => wp.type === 'aid' || wp.type === 'water'
      ).length
    },
    pacingTargetF: function () {
      if (this.plan.pacingTarget) {
        let s = this.plan.pacingTarget
        if (
          this.plan.pacingMethod === 'pace' ||
          this.plan.pacingMethod === 'np'
        ) {
          s = s / this.$units.distScale
          return sec2string(s, 'mm:ss')
        } else {
          return sec2string(s, 'hh:mm:ss')
        }
      } else {
        return ''
      }
    },
    startPace: function () {
      return this.pacing.np * dF(0, this.plan.drift, this.course.distance)
    },
    endPace: function () {
      return this.pacing.np * dF(this.course.distance, this.plan.drift, this.course.distance)
    },
    maxAltitude: function () {
      const m = Math.max.apply(
        Math,
        this.points.map(x => { return x.alt })
      )
      return m
    },
    minAltitude: function () {
      const m = Math.min.apply(
        Math,
        this.points.map(x => { return x.alt })
      )
      return m
    },
    maxGrade: function () {
      const max = Math.max.apply(
        Math,
        this.points.map(x => { return x.grade })
      )
      return max
    },
    minGrade: function () {
      const min = Math.min.apply(
        Math,
        this.points.map(x => { return x.grade })
      )
      return min
    },
    maxTFdist: function () {
      const da = this.pacing.tFs.map(x => {
        if (round(x.tF / 100, 2) === round(this.pacing.fstats.max.tF - 1, 2)) {
          return x.end - x.start
        } else {
          return 0
        }
      })
      const d = da.reduce((a, b) => a + b, 0)
      return d
    },
    minTFdist: function () {
      const da = this.pacing.tFs.map(x => {
        if (round(x.tF / 100, 2) === round(this.pacing.fstats.min.tF - 1, 2)) {
          return x.end - x.start
        } else {
          return 0
        }
      })
      const d = da.reduce((a, b) => a + b, 0)
      return d
    },
    showPaceInfo: function () {
      if (this.plan && this.plan.name && this.pacing && this.pacing.time) {
        return true
      } else {
        return false
      }
    },
    normString: function () {
      const a = ['grade']
      if (round(this.pacing.factors.aF, 3) > 1) {
        a.push('altitude')
      }
      if (round(this.pacing.factors.tF, 3) > 1) {
        a.push('terrain')
      }
      if (this.showPaceInfo && round(this.pacing.factors.hF, 3) > 1) {
        a.push('heat')
      }
      if (this.showPaceInfo && round(this.pacing.factors.dark, 3) > 1) {
        a.push('darkness')
      }
      if (a.length === 1) {
        return a[0]
      } else if (a.length === 2) {
        return `${a[0]} and ${a[1]}`
      } else {
        const last = a.pop()
        const str = a.join(', ')
        return `${str}, & ${last}`
      }
    }
  },
  async created () {
    this.userCount = await api.courseUserCount(this.course._id)
  },
  methods: {
    fPace: function (p) {
      return p / this.$units.distScale
    },
    round: function (v, t) {
      return round(v, t)
    },
    sec2string: function (s, f) {
      return sec2string(s, f)
    },
    gF: function (grade) { return gF(grade) },
    aF: function (alt) { return aF(alt, this.course.altModel) }
  }
}
</script>
