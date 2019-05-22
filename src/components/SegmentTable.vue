<template>
  <b-table :items="segments" :fields="fields" primary-key="start._id" hover foot-clone small>
    <template slot="FOOT_start.name">&nbsp;</template>
    <template slot="FOOT_end.name">&nbsp;</template>
    <template slot="FOOT_len"><div class="text-sm-right">{{ course.distance | formatDist(units.distScale) }}</div></template>
    <template slot="FOOT_gain"><div class="text-sm-right">{{ course.gain | formatAlt(units.altScale) }}</div></template>
    <template slot="FOOT_loss"><div class="text-sm-right">{{ course.loss | formatAlt(units.altScale) }}</div></template>
    <template slot="FOOT_grade">&nbsp;</template>
    <template slot="FOOT_start.terrainIndex">&nbsp;</template>
    <template slot="FOOT_time"><div class="text-sm-right">{{ pacing.time | formatTime }}</div></template>
    <template slot="actions" slot-scope="row">
      <b-button size="sm" @click="editFn(row.item.start)" class="mr-1">
        <v-icon name="edit"></v-icon><span class="d-none d-md-inline">Edit</span>
      </b-button>
    </template>
  </b-table>
</template>

<script>
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
          key: 'start.name',
          label: 'Start',
          thClass: 'text-sm-center'
        },
        {
          key: 'end.name',
          label: 'End',
          thClass: 'd-none d-md-table-cell text-sm-center',
          tdClass: 'd-none d-md-table-cell'
        },
        {
          key: 'len',
          label: 'Length [' + this.units.dist + ']',
          formatter: (value, key, item) => {
            return (value * this.units.distScale).toFixed(2)
          },
          thClass: 'text-sm-center',
          tdClass: 'text-sm-right'
        },
        {
          key: 'gain',
          label: 'Gain [' + this.units.alt + ']',
          formatter: (value, key, item) => {
            return (value * this.units.altScale).toFixed(0)
          },
          thClass: 'd-none d-md-table-cell text-sm-center',
          tdClass: 'd-none d-md-table-cell text-sm-right'
        },
        {
          key: 'loss',
          label: 'Loss [' + this.units.alt + ']',
          formatter: (value, key, item) => {
            return (value * this.units.altScale).toFixed(0)
          },
          thClass: 'd-none d-md-table-cell text-sm-center',
          tdClass: 'd-none d-md-table-cell text-sm-right'
        },
        {
          key: 'grade',
          label: 'Grade',
          formatter: (value, key, item) => {
            return (value).toFixed(2) + '%'
          },
          thClass: 'd-none d-md-table-cell text-sm-center',
          tdClass: 'd-none d-md-table-cell'
        },
        {
          key: 'start.terrainIndex',
          label: 'Terrain',
          thClass: 'text-sm-center',
          tdClass: 'text-sm-center'
        }
      ]
      if (this.segments[0].time) {
        f.push({
          key: 'time',
          formatter: (value, key, item) => {
            var date = new Date(null)
            date.setSeconds(value)
            if (value > 3600) {
              return date.toISOString().substr(11, 8)
            } else {
              return date.toISOString().substr(14, 5)
            }
          },
          thClass: 'text-sm-center',
          tdClass: 'text-sm-right'
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
    }
  }
}
</script>
