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
      Average GNP:
      <b>{{ sec2string(fPace(pacing.gnp), 'mm:ss') }}</b> *,**
    </p>
    <p class="mb-1">
      Average Overall Pace:
      <b>{{ sec2string(fPace(pacing.time / course.distance), 'mm:ss') }}</b>
    </p>
    <small>&nbsp; *While Moving</small>
    <small>&nbsp; ** GNP: Grade Normalized Pace</small>
  </b-list-group-item>
  <b-list-group-item>
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
  <b-list-group-item>
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
      <b>{{ sec2string(fPace(pacing.gnp), 'mm:ss') }}</b> *
    </p>
    <p class="mb-1">
      Ending Pace:
      <b>{{ sec2string(fPace(endPace), 'mm:ss') }}</b> *
    </p>
    <small>&nbsp; *Grade Normalized</small>
  </b-list-group-item>
</b-list-group>
</template>

<script>
import timeUtil from '../../shared/timeUtilities'
export default {
  props: ['plan', 'pacing', 'units', 'course'],
  data () {
    return {
      methods: {
        time: 'Finish Time',
        pace: 'Average Pace',
        gnp: 'Grade Normalized Pace'
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
          this.plan.pacingMethod === 'gnp'
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
      return this.pacing.gnp * (1 - this.plan.drift / 200)
    },
    endPace: function () {
      return this.pacing.gnp * (1 + this.plan.drift / 200)
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
