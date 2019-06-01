<template>
  <b-table :items="splits" :fields="fields" hover foot-clone small>
    <template slot="FOOT_end">&nbsp;</template>
    <template slot="FOOT_gain">{{ course.gain | formatAlt(units.altScale) }}</template>
    <template slot="FOOT_loss">{{ course.loss | formatAlt(units.altScale) }}</template>
    <template slot="FOOT_grade">&nbsp;</template>
    <template slot="FOOT_time">{{ (pacing.time - pacing.delay)| formatTime }}</template>
  </b-table>
</template>

<script>
export default {
  props: ['course', 'splits', 'units', 'plan', 'pacing'],
  filters: {
    formatAlt (val, altScale) {
      return (val * altScale).toFixed(0)
    },
    formatTime (val) {
      if (!val) { return '' }
      var date = new Date(null)
      date.setSeconds(val)
      if (val > 3600) {
        return date.toISOString().substr(11, 8)
      } else {
        return date.toISOString().substr(14, 5)
      }
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
            var date = new Date(null)
            date.setSeconds(value)
            if (value > 3600) {
              return date.toISOString().substr(11, 8)
            } else {
              return date.toISOString().substr(14, 5)
            }
          },
          thClass: 'text-right',
          tdClass: 'text-right'
        })
      }
      return f
    }
  }
}
</script>
