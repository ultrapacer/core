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
        The <b>{{ course.name }}</b> course covers <b>{{ $units.distf(course.scaledDist, 1) }} {{ $units.dist }}</b> with <b>{{ $units.altf(course.scaledGain, 0) | commas }} {{ $units.alt }}</b> of climbing.
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
      <details-row
        description="Date/Time"
        :value="event.start | datetime(event.timezone)"
      />
      <details-row
        description="Dawn"
        :value="sec2string(event.sun.dawn,'am/pm')"
      />
      <details-row
        description="Sunrise"
        :value="sec2string(event.sun.rise, 'am/pm')"
      />
      <details-row
        description="Sunset"
        :value="sec2string(event.sun.set, 'am/pm')"
      />
      <details-row
        description="Dusk"
        :value="sec2string(event.sun.dusk, 'am/pm')"
      />
    </b-list-group-item>

    <b-list-group-item v-if="showPaceInfo">
      <h5 class="mb-1">
        Time
      </h5>
      <details-row
        description="Total Time"
        :value="sec2string(plan.pacing.time, '[h]:m:ss')"
      />
      <details-row
        description="Moving Time"
        :value="sec2string(plan.pacing.time - plan.pacing.delay, '[h]:m:ss')"
      />
      <details-row
        v-if="event.startTime"
        description="Start Time"
        :value="sec2string(event.startTime, 'am/pm')"
      />
      <details-row
        v-if="event.startTime"
        description="Finish Time"
        :value="sec2string((event.startTime + plan.pacing.time) % 86400, 'am/pm')"
      />
    </b-list-group-item>

    <b-list-group-item v-if="showPaceInfo">
      <h5 class="mb-1">
        Paces
      </h5>
      <details-row
        description="Average"
        :value="sec2string(fPace(plan.pacing.pace), 'mm:ss') + ' *'"
      />
      <details-row
        description="Normalized"
        :value="sec2string(fPace(plan.pacing.np), 'mm:ss') + ' *,**'"
      />
      <details-row
        description="Overall"
        :value="sec2string(fPace(plan.pacing.time / course.dist), 'mm:ss')"
      />
      <details-row description="">
        <template #value>
          <small>&nbsp; * While Moving</small><br>
          <small>&nbsp; ** Normalized for {{ normString }}</small>
        </template>
      </details-row>
    </b-list-group-item>

    <b-list-group-item v-if="showPaceInfo && plan.pacing.delay">
      <h5 class="mb-1">
        Aid Station Delays
      </h5>
      <details-row
        description="Typical Delay"
        :value="sec2string(plan.waypointDelay, '[h]:m:ss')"
      />
      <details-row
        description="Quantity"
        :value="`${plan.pacing.delays.length} stop${aidStationCount>1?'s':''}`"
      />
      <details-row
        description="Total Delay"
        :value="sec2string(plan.pacing.delay, '[h]:m:ss')"
      />
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
            :course-distance="course.dist"
          />
        </b-container>
      </b-row>
      <details-row
        v-if="!Array.isArray(plan.drift)"
        description="Pace Drift"
        :value="plan.drift + '%'"
      />
      <details-row
        description="Starting Pace"
        :value="sec2string(fPace(startPace), 'mm:ss') + ' *'"
      />
      <details-row
        description="Average Pace"
        :value="sec2string(fPace(plan.pacing.np), 'mm:ss') + ' *'"
      />
      <details-row
        description="Ending Pace"
        :value="sec2string(fPace(endPace), 'mm:ss') + ' *'"
      />
      <details-row description="">
        <template #value>
          <small>&nbsp; * Normalized for {{ normString }}</small>
        </template>
      </details-row>
    </b-list-group-item>

    <b-list-group-item>
      <h5 class="mb-1">
        Grade Effects
      </h5>
      <details-row
        description="Overall Grade Factor"
        :value="percentWithPace(gradeFactor - 1)"
        :sizes="{cols:5, sm:4, lg:4, xl:3}"
      />
      <details-row
        description="Steepest Climb"
        :sizes="{cols:5, sm:4, lg:4, xl:3}"
      >
        <template #value>
          <b>{{ maxGrade.toFixed(1) }}%</b> grade
          [<b>{{ percentWithPace(gF(maxGrade) - 1) }}</b>]
        </template>
      </details-row>
      <details-row
        description="Steepest Descent"
        :sizes="{cols:5, sm:4, lg:4, xl:3}"
      >
        <template #value>
          <b>{{ minGrade.toFixed(1) }}%</b> grade
          [<b>{{ percentWithPace(gF(minGrade) - 1) }}</b>]
        </template>
      </details-row>
    </b-list-group-item>

    <b-list-group-item v-if="$math.round(altitudeFactor, 3) > 1">
      <h5 class="mb-1">
        Altitude Effects
      </h5>
      <details-row
        description="Average Altitude Factor"
        :value="percentWithPace(altitudeFactor - 1)"
        :sizes="{cols:5, sm:4, lg:5, xl:4}"
      />
      <details-row
        description="Highest Altitude Factor"
        :sizes="{cols:5, sm:4, lg:5, xl:4}"
      >
        <template #value>
          <b>{{ percentWithPace(aF(maxAltitude)) }}</b>
          at
          <b>{{ $units.altf(maxAltitude, 0) | commas }} {{ $units.alt }}</b>
        </template>
      </details-row>
      <details-row
        description="Lowest Altitude Factor"
        :sizes="{cols:5, sm:4, lg:5, xl:4}"
      >
        <template #value>
          <b>{{ percentWithPace(aF(minAltitude) - 1) }}</b>
          at
          <b>{{ $units.altf(minAltitude, 0) | commas }} {{ $units.alt }}</b>
        </template>
      </details-row>
    </b-list-group-item>

    <b-list-group-item v-if="$math.round(terrainFactor, 3) > 1">
      <h5 class="mb-1">
        Terrain Effects
      </h5>
      <details-row
        description="Overall Terrain Factor"
        :value="percentWithPace(terrainFactor - 1)"
        :sizes="{cols:5, sm:4, lg:5, xl:4}"
      />
      <details-row
        description="Hardest Terrain"
        :sizes="{cols:5, sm:4, lg:5, xl:4}"
      >
        <template #value>
          <b>{{ percentWithPace(maxTF) }}</b>
          over
          <b>{{ $units.distf(maxTFdist* course.distScale, 2) }} {{ $units.dist }}</b>
        </template>
      </details-row>
      <details-row
        description="Easiest Terrain"
        :sizes="{cols:5, sm:4, lg:5, xl:4}"
      >
        <template #value>
          <b>{{ percentWithPace(minTF) }}</b>
          over
          <b>{{ $units.distf(minTFdist* course.distScale, 2) }} {{ $units.dist }}</b>
        </template>
      </details-row>
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
      <details-row
        description="Average Heat Factor"
        :value="percentWithPace(plan.pacing.factors.hF - 1)"
        :sizes="{cols:5, sm:4, lg:5, xl:4}"
      />
      <details-row
        description="Highest Heat Factor"
        :value="percentWithPace(plan.pacing.fstats.max.hF - 1)"
        :sizes="{cols:5, sm:4, lg:5, xl:4}"
      />
      <details-row
        description="Lowest Heat Factor"
        :value="percentWithPace(plan.pacing.fstats.min.hF - 1)"
        :sizes="{cols:5, sm:4, lg:5, xl:4}"
      />
    </b-list-group-item>

    <b-list-group-item v-if="showPaceInfo && $math.round(plan.pacing.factors.dark, 3) > 1">
      <h5 class="mb-1">
        Darkness Effects
      </h5>
      <details-row
        description="Avg. Factor"
        :value="percentWithPace(plan.pacing.factors.dark - 1 )"
      />
      <details-row
        description="Daylight Time"
      >
        <template #value>
          <b>
            {{ sec2string(plan.pacing.sunTime.day, 'hh:mm:ss') }}&nbsp;
            ({{ $units.distf(plan.pacing.sunDist.day* course.distScale, 2) }} {{ $units.dist }})
          </b>
        </template>
      </details-row>
      <details-row
        description="Twilight Time"
      >
        <template #value>
          <b>
            {{ sec2string(plan.pacing.sunTime.twilight, 'hh:mm:ss') }}&nbsp;
            ({{ $units.distf(plan.pacing.sunDist.twilight* course.distScale, 2) }} {{ $units.dist }})
          </b>
        </template>
      </details-row>
      <details-row
        description="Dark Time"
      >
        <template #value>
          <b>
            {{ sec2string(plan.pacing.sunTime.dark, 'hh:mm:ss') }}&nbsp;
            ({{ $units.distf(plan.pacing.sunDist.dark* course.distScale, 2) }} {{ $units.dist }})
          </b>
        </template>
      </details-row>
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
import DetailsRow from './DetailsRow.vue'

export default {
  components: {
    DriftChart,
    HeatChart,
    DetailsRow
  },
  filters: {
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
      return this.plan.pacing.np * this.$core.nF.dF(0, this.plan.drift, this.course.dist)
    },
    endPace: function () {
      return this.plan.pacing.np * this.$core.nF.dF(this.course.dist, this.plan.drift, this.course.dist)
    },
    maxAltitude: function () {
      const m = Math.max.apply(
        Math,
        this.course.points.map(x => { return x.alt })
      )
      return m
    },
    minAltitude: function () {
      const m = Math.min.apply(
        Math,
        this.course.points.map(x => { return x.alt })
      )
      return m
    },
    maxGrade: function () {
      const max = Math.max.apply(
        Math,
        this.course.points.map(x => { return x.grade })
      )
      return max * (max > 0 ? this.course.gainScale : this.course.lossScale)
    },
    minGrade: function () {
      const min = Math.min.apply(
        Math,
        this.course.points.map(x => { return x.grade })
      )
      return min * (min > 0 ? this.course.gainScale : this.course.lossScale)
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
      return tot / this.course.dist
    },
    fPace: function (p) {
      return p / this.course.distScale / this.$units.distScale
    },
    percentWithPace (val) {
      let str = `${(val > 0 ? '+' : '')}${(val * 100).toFixed(1)}% `
      if (this.plan?.pacing?.np) {
        if (val !== 0) {
          const fact = val > 0 ? 1 : -1
          val = fact * val
          const dPace = val * this.plan.pacing.np / this.course.distScale / this.$units.distScale
          str = `${str} (${sec2string(dPace, '[h]:m:ss')} min/${this.$units.dist})`
        }
      }
      return str
    },
    sec2string: function (s, f) {
      return sec2string(s, f)
    },
    gF: function (grade) { return this.$core.nF.gF(grade * (grade > 0 ? this.course.gainScale : this.course.lossScale)) },
    aF: function (alt) { return this.$core.nF.aF(alt, this.course.altModel) }
  }
}
</script>
