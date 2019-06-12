<template>
  <b-table
    :items="segments"
    :fields="fields"
    primary-key="start._id"
    selectable
    select-mode="single"
    @row-selected="selectRow"
    hover
    foot-clone
    small
  >
    <template slot="FOOT_start.name">&nbsp;</template>
    <template slot="FOOT_end.name">&nbsp;</template>
    <template slot="FOOT_len">{{ course.distance | formatDist(units.distScale) }}</template>
    <template slot="FOOT_gain">{{ course.gain | formatAlt(units.altScale) }}</template>
    <template slot="FOOT_loss">{{ course.loss | formatAlt(units.altScale) }}</template>
    <template slot="FOOT_grade">&nbsp;</template>
    <template slot="FOOT_start.terrainIndex">&nbsp;</template>
    <template slot="FOOT_time">{{ time | formatTime }}</template>
    <template slot="actions" slot-scope="row">
      <b-button size="sm" @click="editFn(row.item.start)" class="mr-1">
        <v-icon name="edit"></v-icon><span class="d-none d-md-inline">Edit</span>
      </b-button>
    </template>
  </b-table>
</template>

<script>
import timeUtil from '../../shared/timeUtilities'
export default {
  props: ['course', 'segments', 'units', 'owner', 'editFn', 'pacing'],
  filters: {
    formatDist (val, distScale) {
      return (val * distScale).toFixed(2)
    },
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
          key: 'start.name',
          label: 'Start'
        },
        {
          key: 'end.name',
          label: 'End',
          thClass: 'd-none d-md-table-cell',
          tdClass: 'd-none d-md-table-cell'
        },
        {
          key: 'len',
          label: 'Length [' + this.units.dist + ']',
          formatter: (value, key, item) => {
            return (value * this.units.distScale).toFixed(2)
          },
          thClass: 'text-right',
          tdClass: 'text-right'
        },
        {
          key: 'gain',
          label: `Gain [${this.units.alt}]`,
          formatter: (value, key, item) => {
            return (value * this.units.altScale).toFixed(0)
          },
          thClass: 'd-none d-md-table-cell text-right',
          tdClass: 'd-none d-md-table-cell text-right'
        },
        {
          key: 'loss',
          label: 'Loss [' + this.units.alt + ']',
          formatter: (value, key, item) => {
            return (value * this.units.altScale).toFixed(0)
          },
          thClass: 'd-none d-md-table-cell text-right',
          tdClass: 'd-none d-md-table-cell text-right'
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
      if (this.segments[0].time) {
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
      if (this.segments[0].time) {
        var t = 0
        this.segments.forEach(s => { t += s.time })
        return t
      } else {
        return 0
      }
    }
  },
  methods: {
    selectRow: function (s) {
      if (s.length) {
        this.$emit('select', [s[0].start.location, s[0].end.location])
      } else {
        this.$emit('select', [])
      }
    }
  }
}
</script>
