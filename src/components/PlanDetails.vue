<template>
  <b-list-group
    v-if="!$status.processing"
  >
    <b-list-group-item>
      <h5 class="mb-1">
        Course Description
      </h5>
      <span v-if="course.description">
        {{ course.description }}
      </span>
      <span v-else>
        The <b>{{ course.name }}</b> course covers <b>{{ $units.distf(course.totalDistance(), 1) }} {{ $units.dist }}</b> with <b>{{ $units.altf(course.totalGain(), 0) | commas }} {{ $units.alt }}</b> of climbing.
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
        <b-col><b>{{ sec2string(plan.pacing.time, '[h]:m:ss') }}</b></b-col>
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
        <b-col><b>{{ sec2string(plan.pacing.time - plan.pacing.delay, '[h]:m:ss') }}</b></b-col>
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
        <b-col><b>{{ sec2string((event.startTime + plan.pacing.time) % 86400, 'am/pm') }}</b></b-col>
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
        <b-col><b>{{ sec2string(fPace(plan.pacing.pace), 'mm:ss') }}</b> *</b-col>
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
        <b-col><b>{{ sec2string(fPace(plan.pacing.np), 'mm:ss') }}</b> *,**</b-col>
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
        <b-col><b>{{ sec2string(fPace(plan.pacing.time / course.totalDistance()), 'mm:ss') }}</b></b-col>
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
    <b-list-group-item v-if="showPaceInfo && plan.pacing.delay">
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
        <b-col><b>{{ plan.pacing.delays.length }} stop<span v-if="aidStationCount>1">s</span></b></b-col>
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
        <b-col><b>{{ sec2string(plan.pacing.delay, '[h]:m:ss') }}</b></b-col>
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
            :course-distance="course.totalDistance()"
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
        <b-col><b>{{ sec2string(fPace(plan.pacing.np), 'mm:ss') }}</b> *</b-col>
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
            <b>{{ gradeFactor - 1 | percentWithPace(plan, $units) }}</b>
          </p>
          <p class="mb-1">
            Steepest Climb:
            <b>{{ maxGrade.toFixed(1) }}%</b> grade
            [<b>{{ gF(maxGrade) - 1 | percentWithPace(plan, $units) }}</b>]
          </p>
          <p class="mb-1">
            Steepest Descent:
            <b>{{ minGrade.toFixed(1) }}%</b> grade
            [<b>{{ gF(minGrade) - 1 | percentWithPace(plan, $units) }}</b>]
          </p>
        </b-col>
      </b-row>
    </b-list-group-item>
    <b-list-group-item v-if="$math.round(altitudeFactor, 3) > 1">
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
            <b>{{ altitudeFactor - 1 | percentWithPace(plan, $units) }}</b>
          </p>
          <p class="mb-1">
            Highest Altitude Factor:
            <b>{{ aF(maxAltitude) - 1 | percentWithPace(plan, $units) }}</b>
            at
            <b>{{ $units.altf(maxAltitude, 0) | commas }} {{ $units.alt }}</b>
          </p>
          <p class="mb-1">
            Lowest Altitude Factor:
            <b>{{ aF(minAltitude) - 1 | percentWithPace(plan, $units) }}</b>
            at
            <b>{{ $units.altf(minAltitude, 0) | commas }} {{ $units.alt }}</b>
          </p>
        </b-col>
      </b-row>
    </b-list-group-item>
    <b-list-group-item v-if="$math.round(terrainFactor, 3) > 1">
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
            <b>{{ terrainFactor - 1 | percentWithPace(plan, $units) }}</b>
          </p>
          <p class="mb-1">
            Hardest Terrain:
            <b>{{ maxTF | percentWithPace(plan, $units) }}</b>
            over
            <b>{{ $units.distf(maxTFdist, 2) }} {{ $units.dist }}</b>
          </p>
          <p class="mb-1">
            Easiest Terrain:
            <b>{{ minTF | percentWithPace(plan, $units) }}</b>
            over
            <b>{{ $units.distf(minTFdist, 2) }} {{ $units.dist }}</b>
          </p>
        </b-col>
      </b-row>
    </b-list-group-item>
    <b-list-group-item v-if="showPaceInfo && $math.round(plan.pacing.factors.hF, 3) > 1">
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
            :kilometers="plan.splits.kilometers"
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
            <b>{{ plan.pacing.factors.hF - 1 | percentWithPace(plan, $units) }}</b>
          </p>
          <p class="mb-1">
            Highest Heat Factor:
            <b>{{ plan.pacing.fstats.max.hF - 1 | percentWithPace(plan, $units) }}</b>
          </p>
          <p class="mb-1">
            Lowest Heat Factor:
            <b>{{ plan.pacing.fstats.min.hF - 1 | percentWithPace(plan, $units) }}</b>
          </p>
        </b-col>
      </b-row>
    </b-list-group-item>
    <b-list-group-item v-if="showPaceInfo && $math.round(plan.pacing.factors.dark, 3) > 1">
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
          <b>{{ plan.pacing.factors.dark - 1 | percentWithPace(plan, $units) }}</b>
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
            {{ sec2string(plan.pacing.sunTime.day, 'hh:mm:ss') }}&nbsp;
            ({{ $units.distf(plan.pacing.sunDist.day, 2) }} {{ $units.dist }})
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
            {{ sec2string(plan.pacing.sunTime.twilight, 'hh:mm:ss') }}&nbsp;
            ({{ $units.distf(plan.pacing.sunDist.twilight, 2) }} {{ $units.dist }})
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
            {{ sec2string(plan.pacing.sunTime.dark, 'hh:mm:ss') }}&nbsp;
            ({{ $units.distf(plan.pacing.sunDist.dark, 2) }} {{ $units.dist }})
          </b>
        </b-col>
      </b-row>
    </b-list-group-item>
    <b-list-group-item>
      <p
        v-if="showPaceInfo && !plan.pacing.delay"
        class="mb-1"
      >
        No Delays
      </p>
      <p
        v-if="$math.round(altitudeFactor, 3) <= 1"
        class="mb-1"
      >
        No Altitude Effects
      </p>
      <p
        v-if="$math.round(terrainFactor, 3) <= 1"
        class="mb-1"
      >
        No Terrain Effects
      </p>
      <p
        v-if="showPaceInfo && $math.round(plan.pacing.factors.hF, 3) <= 1"
        class="mb-1"
      >
        No Heat Effects
      </p>
      <p
        v-if="showPaceInfo && $math.round(plan.pacing.factors.dark, 3) <= 1"
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
import DriftChart from './DriftChart.vue'
import HeatChart from './HeatChart.vue'
export default {
  components: {
    DriftChart,
    HeatChart
  },
  filters: {
    percentWithPace (val, plan, units) {
      let str = `${(val > 0 ? '+' : '')}${(val * 100).toFixed(1)}% `
      if (plan && plan.pacing && plan.pacing.np) {
        if (val !== 0) {
          const fact = val > 0 ? 1 : -1
          val = fact * val
          const dPace = val * plan.pacing.np / units.distScale
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
      default () { return null }
    },
    points: {
      type: Array,
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
    terrainFactors: {
      type: Array,
      required: true
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
      return this.plan.pacing.np * this.$core.nF.dF(0, this.plan.drift, this.course.totalDistance())
    },
    endPace: function () {
      return this.plan.pacing.np * this.$core.nF.dF(this.course.totalDistance(), this.plan.drift, this.course.totalDistance())
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
    maxTF: function () {
      const max = Math.max.apply(
        Math,
        this.terrainFactors.map(x => { return x.tF })
      )
      return max / 100
    },
    minTF: function () {
      const min = Math.min.apply(
        Math,
        this.terrainFactors.map(x => { return x.tF })
      )
      return min / 100
    },
    maxTFdist: function () {
      const da = this.terrainFactors.map(x => {
        if (this.$math.round(x.tF / 100, 2) === this.$math.round(this.maxTF, 2)) {
          return x.end - x.start
        } else {
          return 0
        }
      })
      const d = da.reduce((a, b) => a + b, 0)
      return d
    },
    minTFdist: function () {
      const da = this.terrainFactors.map(x => {
        if (this.$math.round(x.tF / 100, 2) === this.$math.round(this.minTF, 2)) {
          return x.end - x.start
        } else {
          return 0
        }
      })
      const d = da.reduce((a, b) => a + b, 0)
      return d
    },
    showPaceInfo: function () {
      return Boolean(this.plan && this.plan.pacing && this.plan.pacing.time)
    },
    normString: function () {
      const a = ['grade']
      if (this.$math.round(this.altitudeFactor, 3) > 1) {
        a.push('altitude')
      }
      if (this.$math.round(this.terrainFactor, 3) > 1) {
        a.push('terrain')
      }
      if (this.showPaceInfo && this.$math.round(this.plan.pacing.factors.hF, 3) > 1) {
        a.push('heat')
      }
      if (this.showPaceInfo && this.$math.round(this.plan.pacing.factors.dark, 3) > 1) {
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
    },
    gradeFactor: function () {
      return this.reducer('gF')
    },
    terrainFactor: function () {
      return this.reducer('tF')
    },
    altitudeFactor: function () {
      return this.reducer('aF')
    },
    segments: function () {
      if (this.showPaceInfo && this.plan && this.plan.splits && this.plan.splits.segments) {
        return this.plan.splits.segments
      } else {
        return this.course.splits.segments
      }
    }
  },
  async created () {
    this.userCount = await api.courseUserCount(this.course._id)
  },
  methods: {
    reducer: function (field) {
      if (!this.segments.length || !this.segments[0].factors) return 0
      const tot = this.segments.reduce((v, x) => {
        return v + (x.len * x.factors[field])
      }, 0)
      return tot / this.course.totalDistance()
    },
    fPace: function (p) {
      return p / this.$units.distScale
    },
    sec2string: function (s, f) {
      return sec2string(s, f)
    },
    gF: function (grade) { return this.$core.nF.gF(grade) },
    aF: function (alt) { return this.$core.nF.aF(alt, this.course.altModel) }
  }
}
</script>
