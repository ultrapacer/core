<template>
  <b-table
    ref="table"
    :busy="busy"
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
    <template slot="FOOT_gain">
      {{ gain | formatAlt(units.altScale) }}
    </template>
    <template slot="FOOT_loss">
      {{ loss | formatAlt(units.altScale) }}
    </template>
    <template slot="FOOT_grade">&nbsp;</template>
    <template slot="FOOT_time">
      {{ time | formatTime }}
    </template>
  </b-table>
</template>

<script>
import { calcSegments } from '../../shared/utilities'
import timeUtil from '../../shared/timeUtilities'
export default {
  props: ['course', 'units', 'plan', 'pacing', 'busy'],
  data () {
    return {
      clearing: false
    }
  },
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
    splits: function () {
      // generate array of breaks in km
      let p = this.course.points
      var tot = p[p.length - 1].loc * this.units.distScale
      let breaks = [0]
      var i = 1
      while (i < tot) {
        breaks.push(i / this.units.distScale)
        i++
      }
      if (tot / this.units.distScale > breaks[breaks.length - 1]) {
        breaks.push(tot / this.units.distScale)
      }
      return calcSegments(p, breaks, this.pacing)
    },
    gain: function () {
      let v = this.splits.reduce((t, x) => { return t + x.gain }, 0)
      if (this.course.scales) {
        v = v * this.course.scales.gain
      }
      return v
    },
    loss: function () {
      let v = this.splits.reduce((t, x) => { return t + x.loss }, 0)
      if (this.course.scales) {
        v = v * this.course.scales.loss
      }
      return v
    },
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
            let scale = 1
            if (this.course.scales) {
              scale = this.course.scales.gain
            }
            return (value * scale * this.units.altScale).toFixed(0)
          },
          thClass: 'text-right',
          tdClass: 'text-right'
        },
        {
          key: 'loss',
          label: 'Loss [' + this.units.alt + ']',
          formatter: (value, key, item) => {
            let scale = 1
            if (this.course.scales) {
              scale = this.course.scales.loss
            }
            return (value * scale * this.units.altScale).toFixed(0)
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
    },
    time: function () {
      if (this.splits[0].time) {
        var t = 0
        this.splits.forEach(s => { t += s.time })
        return t
      } else {
        return 0
      }
    }
  },
  methods: {
    clear: async function () {
      this.clearing = true
      await this.$refs.table.clearSelected()
      this.clearing = false
    },
    selectRow: function (s) {
      if (this.clearing) return
      if (s.length) {
        this.$emit('select', 'split', [s[0].start, s[0].end])
      } else {
        this.$emit('select', 'split', [])
      }
    }
  }
}
</script>
