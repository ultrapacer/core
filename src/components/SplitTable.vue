<template>
  <b-table :items="splits" :fields="fields" hover foot-clone small>
    <template slot="FOOT_end">&nbsp;</template>
    <template slot="FOOT_gain">{{ course.gain | formatAlt(units.altScale) }}</template>
    <template slot="FOOT_loss">{{ course.loss | formatAlt(units.altScale) }}</template>
    <template slot="FOOT_grade">&nbsp;</template>
    <template slot="FOOT_time">{{ plan.time }}</template>
  </b-table>
</template>

<script>
export default {
  props: ['course', 'splits', 'units', 'plan'],
  filters: {
    formatAlt (val, altScale) {
      return (val * altScale).toFixed(0)
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
          }
        },
        {
          key: 'gain',
          label: 'Gain [' + this.units.alt + ']',
          formatter: (value, key, item) => {
            return (value * this.units.altScale).toFixed(0)
          }
        },
        {
          key: 'loss',
          label: 'Loss [' + this.units.alt + ']',
          formatter: (value, key, item) => {
            return (value * this.units.altScale).toFixed(0)
          }
        },
        {
          key: 'grade',
          label: 'Grade',
          formatter: (value, key, item) => {
            return (value).toFixed(2) + '%'
          },
          thClass: 'd-none d-md-table-cell',
          tdClass: 'd-none d-md-table-cell'
        }
      ]
      if (this.splits[0].time) {
        f.push({
          key: 'time'
        })
      }
      return f
    }
  }
}
</script>
