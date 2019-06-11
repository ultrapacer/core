<template>
<b-list-group>
  <b-list-group-item>
    <h5 class="mb-1">Pacing Calculation Basis</h5>
    <p class="mb-1">{{ methods[plan.pacingMethod] }}
      of <b>{{ pacingTargetF }}</b>
    </p>
  </b-list-group-item>
  <b-list-group-item>
    <h5 class="mb-1">Time</h5>
    <p class="mb-1">
      Total Time:
      <b>{{ sec2string(fPace(pacing.time), '[h]:m:ss') }}</b>
    </p>
    <p class="mb-1">
      Moving Time:
      <b>{{ sec2string(fPace(pacing.time - pacing.delay), '[h]:m:ss') }}</b>
    </p>
  </b-list-group-item>
  <b-list-group-item>
    <h5 class="mb-1">Moving Paces</h5>
    <p class="mb-1">
      Average Pace:
      <b>{{ sec2string(fPace(pacing.pace), 'mm:ss') }}</b>
    </p>
    <p class="mb-1">
      Grade Normalized Pace:
      <b>{{ sec2string(fPace(pacing.gap), 'mm:ss') }}</b>
    </p>
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
        gap: 'Grade Adjusted Pace'
      }
    }
  },
  watch: {
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
          this.plan.pacingMethod === 'gap'
        ) {
          s = s / this.units.distScale
          return timeUtil.sec2string(s, 'mm:ss')
        } else {
          return timeUtil.sec2string(s, 'hh:mm:ss')
        }
      } else {
        return ''
      }
    }
  },
  methods: {
    fPace: function (p) {
      return p = p / this.units.distScale
    },
    sec2string: function (s, f) {
      return timeUtil.sec2string(s, f)
    }
  }
}
</script>
