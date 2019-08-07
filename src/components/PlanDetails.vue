<template>
<b-list-group v-if="plan && plan.name && pacing && pacing.time">
  <b-list-group-item>
    <h5 class="mb-1">Pacing Calculation Basis</h5>
    <p class="mb-1"><b>{{ methods[plan.pacingMethod] }}</b>
      of <b>{{ pacingTargetF }}</b>
    </p>
  </b-list-group-item>
  <b-list-group-item>
    <h5 class="mb-1">Time</h5>
    <p class="mb-1">
      Total Time:
      <b>{{ sec2string(pacing.time, '[h]:m:ss') }}</b>
    </p>
    <p class="mb-1">
      Moving Time:
      <b>{{ sec2string(pacing.time - pacing.delay, '[h]:m:ss') }}</b>
    </p>
  </b-list-group-item>
  <b-list-group-item>
    <h5 class="mb-1">Paces</h5>
    <p class="mb-1">
      Average Pace:
      <b>{{ sec2string(fPace(pacing.pace), 'mm:ss') }}</b> *
    </p>
    <p class="mb-1">
      Average Normalized Pace:
      <b>{{ sec2string(fPace(pacing.np), 'mm:ss') }}</b> *,**
    </p>
    <p class="mb-1">
      Average Overall Pace:
      <b>{{ sec2string(fPace(pacing.time / course.distance), 'mm:ss') }}</b>
    </p>
    <small>&nbsp; * While Moving</small><br/>
    <small>&nbsp; ** Normalized for Grade, Altitude, & Terrain</small>
  </b-list-group-item>
  <b-list-group-item v-if="pacing.delay">
    <h5 class="mb-1">Delays</h5>
    <p class="mb-1">
      Typical Aid Station Delay:
      <b>{{ sec2string(plan.waypointDelay, '[h]:m:ss') }}</b>
    </p>
    <p class="mb-1">
      Number of Aid Stations:
      <b>{{ aidStationCount }}</b>
    </p>
    <p class="mb-1">
      Total Aid Station Delay:
      <b>{{ sec2string(pacing.delay, '[h]:m:ss') }}</b>
    </p>
  </b-list-group-item>
  <b-list-group-item v-if="plan.drift">
    <h5 class="mb-1">Pace Drift</h5>
    <p class="mb-1">
      Pace Drift:
      <b>{{ plan.drift }} %</b>
    </p>
    <p class="mb-1">
      Starting Pace:
      <b>{{ sec2string(fPace(startPace), 'mm:ss') }}</b> *
    </p>
    <p class="mb-1">
      Average Pace:
      <b>{{ sec2string(fPace(pacing.np), 'mm:ss') }}</b> *
    </p>
    <p class="mb-1">
      Ending Pace:
      <b>{{ sec2string(fPace(endPace), 'mm:ss') }}</b> *
    </p>
    <small>&nbsp; * Normalized for Grade, Altitude, & Terrain</small>
  </b-list-group-item>
  <b-list-group-item>
    <h5 class="mb-1">Grade Effects</h5>
    <p class="mb-1">
      Overall Grade Factor:
      <b>{{ pacing.factors.gF - 1 | percentWithPace(pacing.np, units) }}</b>
    </p>
    <p class="mb-1">
      Steepest Climb:
      <b>{{ maxGrade.toFixed(1) }}%</b> grade
      [<b>{{ maxGF / 100 | percentWithPace(pacing.np, units) }}</b>]
    </p>
    <p class="mb-1">
      Steepest Descent:
      <b>{{ minGrade.toFixed(1) }}%</b> grade
      [<b>{{ minGF / 100 | percentWithPace(pacing.np, units) }}</b>]
    </p>
  </b-list-group-item>
  <b-list-group-item v-if="maxAltFactor || minAltFactor">
    <h5 class="mb-1">Altitude Effects</h5>
    <p class="mb-1">
      Average Altitude Factor:
      <b>{{ pacing.factors.aF - 1 | percentWithPace(pacing.np, units) }}</b>
    </p>
    <p class="mb-1">
      Highest Altitude Factor:
      <b>{{ maxAltFactor / 100 | percentWithPace(pacing.np, units) }}</b>
      at
      <b>{{ maxAltitude | formatAlt(units.altScale) }} {{ units.alt }}</b>
    </p>
    <p class="mb-1">
      Lowest Altitude Factor:
      <b>{{ minAltFactor / 100 | percentWithPace(pacing.np, units) }}</b>
      at
      <b>{{ minAltitude | formatAlt(units.altScale) }} {{ units.alt }}</b>
    </p>
  </b-list-group-item>
  <b-list-group-item v-if="maxTF || minTF">
    <h5 class="mb-1">Terrain Effects</h5>
    <p class="mb-1">
      Overall Terrain Factor:
      <b>{{ pacing.factors.tF - 1 | percentWithPace(pacing.np, units) }}</b>
    </p>
    <p class="mb-1">
      Hardest Terrain:
      <b>{{ maxTF / 100 | percentWithPace(pacing.np, units) }}</b>
      over
      <b>{{ maxTFdist | formatDist(units.distScale) }} {{ units.dist }}</b>
    </p>
    <p class="mb-1">
      Easiest Terrain:
      <b>{{ minTF / 100 | percentWithPace(pacing.np, units) }}</b>
      over
      <b>{{ minTFdist | formatDist(units.distScale) }} {{ units.dist }}</b>
    </p>
  </b-list-group-item>
  <b-list-group-item >
    <p v-if="!pacing.delay" class="mb-1">No Delays</p>
    <p v-if="!plan.drift" class="mb-1">No Pace Drift</p>
    <p v-if="!maxAltFactor && !minAltFactor" class="mb-1">No Altitude Effects</p>
    <p v-if="!maxTF && !minTF" class="mb-1">No Terrain Effects</p>
  </b-list-group-item>
</b-list-group>
</template>

<script>
import timeUtil from '../../shared/timeUtilities'
import nF from '../../shared/normFactor'
import {round} from '../../shared/utilities'
export default {
  props: ['plan', 'pacing', 'units', 'course'],
  data () {
    return {
      methods: {
        time: 'Finish Time',
        pace: 'Average Pace',
        np: 'Normalized Pace'
      }
    }
  },
  computed: {
    aidStationCount: function () {
      return this.course.waypoints.filter(wp => wp.type === 'aid').length
    },
    pacingTargetF: function () {
      if (this.plan.pacingTarget) {
        var s = this.plan.pacingTarget
        if (
          this.plan.pacingMethod === 'pace' ||
          this.plan.pacingMethod === 'np'
        ) {
          s = s / this.units.distScale
          return timeUtil.sec2string(s, 'mm:ss')
        } else {
          return timeUtil.sec2string(s, 'hh:mm:ss')
        }
      } else {
        return ''
      }
    },
    startPace: function () {
      return this.pacing.np * (1 - this.plan.drift / 200)
    },
    endPace: function () {
      return this.pacing.np * (1 + this.plan.drift / 200)
    },
    maxAltitude: function () {
      var m = Math.max.apply(
        Math,
        this.course.points.map(x => { return x.alt })
      )
      return m
    },
    maxAltFactor: function () {
      return round(
        (nF.altFactor(this.maxAltitude, this.pacing.altModel) - 1) * 100,
        2
      )
    },
    minAltitude: function () {
      var m = Math.min.apply(
        Math,
        this.course.points.map(x => { return x.alt })
      )
      return m
    },
    minAltFactor: function () {
      return round(
        (nF.altFactor(this.minAltitude, this.pacing.altModel) - 1) * 100,
        2
      )
    },
    maxGrade: function () {
      var max = Math.max.apply(
        Math,
        this.course.points.map(x => { return x.grade })
      )
      return max
    },
    maxGF: function () {
      return round(
        (nF.gradeFactor(this.maxGrade) - 1) * 100,
        2
      )
    },
    minGrade: function () {
      var min = Math.min.apply(
        Math,
        this.course.points.map(x => { return x.grade })
      )
      return min
    },
    minGF: function () {
      return round(
        (nF.gradeFactor(this.minGrade) - 1) * 100,
        2
      )
    },
    maxTF: function () {
      var m = Math.max.apply(
        Math,
        this.pacing.tFs.map(x => { return x.tF })
      )
      return m
    },
    maxTFdist: function () {
      let da = this.pacing.tFs.map(x => {
        if (x.tF === this.maxTF) {
          return x.end - x.start
        } else {
          return 0
        }
      })
      let d = da.reduce((a, b) => a + b, 0)
      return d
    },
    minTF: function () {
      var m = Math.min.apply(
        Math,
        this.pacing.tFs.map(x => { return x.tF })
      )
      return m
    },
    minTFdist: function () {
      let da = this.pacing.tFs.map(x => {
        if (x.tF === this.minTF) {
          return x.end - x.start
        } else {
          return 0
        }
      })
      let d = da.reduce((a, b) => a + b, 0)
      return d
    }
  },
  filters: {
    formatAlt (val, altScale) {
      return (val * altScale).toFixed(0)
    },
    formatDist (val, distScale) {
      return (val * distScale).toFixed(2)
    },
    percentWithPace (val, np, units) {
      let str = `${(val > 0 ? '+' : '')}${(val * 100).toFixed(1)}% `
      if (val !== 0) {
        let fact = val > 0 ? 1 : -1
        val = fact * val
        let dPace = val * np / units.distScale
        str = `${str} (${timeUtil.sec2string(dPace, '[h]:m:ss')} min/${units.dist})`
      }
      return str
    }
  },
  methods: {
    fPace: function (p) {
      return p / this.units.distScale
    },
    sec2string: function (s, f) {
      return timeUtil.sec2string(s, f)
    }
  }
}
</script>
