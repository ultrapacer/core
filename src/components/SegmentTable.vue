<template>
  <b-table
    ref="table"
    :items="segments"
    :fields="fields"
    primary-key="startWaypoint._id"
    selectable
    select-mode="single"
    @row-selected="selectRow"
    hover
    foot-clone
    small
  >
    <template slot="FOOT_startWaypoint.name">&nbsp;</template>
    <template slot="FOOT_endWaypoint.name">&nbsp;</template>
    <template slot="FOOT_len">
      {{ course.distance | formatDist(units.distScale) }}
    </template>
    <template slot="FOOT_gain">
      {{ course.gain | formatAlt(units.altScale) }}
    </template>
    <template slot="FOOT_loss">
      {{ course.loss | formatAlt(units.altScale) }}
    </template>
    <template slot="FOOT_grade">&nbsp;</template>
    <template slot="FOOT_terrainFactor">
      +{{ ((pacing.factors.tF - 1) * 100).toFixed(1) }}%
    </template>
    <template slot="FOOT_time">
      {{ time | formatTime }}
    </template>
    <template slot="FOOT_pace">
      {{ pacing.pace / units.distScale | formatTime }}
    </template>
    <template slot="actions" slot-scope="row">
      <b-button size="sm" @click="editFn(row.item.startWaypoint)" class="mr-1">
        <v-icon name="edit"></v-icon><span class="d-none d-md-inline">Edit</span>
      </b-button>
    </template>
  </b-table>
</template>

<script>
import util from '../../shared/utilities'
import timeUtil from '../../shared/timeUtilities'
export default {
  props: ['course', 'units', 'owner', 'editFn', 'pacing'],
  data () {
    return {
      clearing: false,
      displayTier: 1
    }
  },
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
    segments: function () {
      if (!this.course.points) { return [] }
      if (!this.course.points.length) { return [] }
      if (!this.course.waypoints.length) { return [] }
      var breaks = []
      let wps = []
      this.course.waypoints.forEach( (x, i) => {
        if (
          i === 0 ||
          i === il - 1 ||
          x.tier <= this.displayTier
        ) {
          breaks.push(x.location)
          wps.push(x)
        }
      })
      let arr = util.calcSegments(this.course.points, breaks, this.pacing)
      splits.forEach( (x, i) => {
        splits[i].startWaypoint = wps[i]
        splits[i].endWaypoint = wps[i + 1]
      })
      return arr
    },
    fields: function () {
      var f = [
        {
          key: 'startWaypoint.name',
          label: 'Start'
        },
        {
          key: 'endWaypoint.name',
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
      if (this.pacing.factors.tF > 1) {
        f.push({
          key: 'terrainFactor',
          label: 'Terrain Factor',
          formatter: (value, key, item) => {
            return '+' + (value).toFixed(0) + '%'
          },
          thClass: 'd-none d-md-table-cell text-right',
          tdClass: 'd-none d-md-table-cell text-right'
        })
      }
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
        f.push({
          key: 'pace',
          label: `Pace [min/${this.units.dist}]`,
          formatter: (value, key, item) => {
            let l = item.len * this.units.distScale
            return timeUtil.sec2string(item.time / l, '[h]:m:ss')
          },
          thClass: 'text-right',
          tdClass: 'text-right'
        })
      }
      if (this.owner) {
        f.push({
          key: 'actions',
          label: '',
          tdClass: 'actionButtonColumn'
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
    clear: async function () {
      this.clearing = true
      await this.$refs.table.clearSelected()
      this.clearing = false
    },
    selectRow: function (s) {
      if (this.clearing) return
      if (s.length) {
        this.$emit(
          'select',
          'segment',
          [s[0].start, s[0].end]
        )
      } else {
        this.$emit('select', 'segment', [])
      }
    }
  }
}
</script>
