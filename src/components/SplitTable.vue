<template>
  <b-table
    :items="splits"
    :fields="fields"
    primary-key="start._id"
    selectable
    select-mode="single"
    @row-selected="selectRow"
    hover
    foot-clone
    small
  >
    <template slot="FOOT_end">&nbsp;</template>
    <template slot="FOOT_gain">{{ course.gain | formatAlt(units.altScale) }}</template>
    <template slot="FOOT_loss">{{ course.loss | formatAlt(units.altScale) }}</template>
    <template slot="FOOT_grade">&nbsp;</template>
    <template slot="FOOT_time">{{ (pacing.time - pacing.delay)| formatTime }}</template>
  </b-table>
</template>

<script>
import timeUtil from '../../shared/timeUtilities'
export default {
  props: ['course', 'splits', 'units', 'plan', 'pacing'],
  filters: {
    formatAlt (val, altScale) {
      return (val * altScale).toFixed(0)
    },
    formatTime (val) {
      if (!val) { return '' }
      return timeUtil.sec2string(val, '[h]:m:ss')
    }
  },
  computed: {
    fields: function () {
      var f = [
        {
          key: 'end',
          label: 'Split [' + this.units.dist + ']',
          formatter: (value, key, item) => {
            return (value * this.units.distScale).toFixed(2)
          },
          thClass: 'text-right',
          tdClass: 'text-right'
        },
        {
          key: 'gain',
          label: 'Gain [' + this.units.alt + ']',
          formatter: (value, key, item) => {
            return (value * this.units.altScale).toFixed(0)
          },
          thClass: 'text-right',
          tdClass: 'text-right'
        },
        {
          key: 'loss',
          label: 'Loss [' + this.units.alt + ']',
          formatter: (value, key, item) => {
            return (value * this.units.altScale).toFixed(0)
          },
          thClass: 'text-right',
          tdClass: 'text-right'
        },
        {
          key: 'grade',
          label: 'Grade',
          formatter: (value, key, item) => {
            return (value).toFixed(2) + '%'
          },
          thClass: 'd-none d-md-table-cell text-right',
          tdClass: 'd-none d-md-table-cell text-right'
        }
      ]
      if (this.splits[0].time) {
        f.push({
          key: 'time',
          label: 'Moving Time',
          formatter: (value, key, item) => {
            return timeUtil.sec2string(value, '[h]:m:ss')
          },
          thClass: 'text-right',
          tdClass: 'text-right'
        })
      }
      return f
    }
  },
  methods: {
    selectRow: function (s) {
      if (s.length) {
        this.$emit('select', [s[0].start, s[0].end])
      } else {
        this.$emit('select', [])
      }
    }
  }
}
</script>
