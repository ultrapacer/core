<template>
  <b-table :items="segments" :fields="fields" primary-key="start._id" hover foot-clone small>
    <template slot="FOOT_start.name">&nbsp;</template>
    <template slot="FOOT_end.name">&nbsp;</template>
    <template slot="FOOT_len">{{ course.distance | formatDist(units.distScale) }}</template>
    <template slot="FOOT_gain">{{ course.gain | formatAlt(units.altScale) }}</template>
    <template slot="FOOT_loss">{{ course.loss | formatAlt(units.altScale) }}</template>
    <template slot="FOOT_grade">&nbsp;</template>
    <template slot="FOOT_start.terrainIndex">&nbsp;</template>
    <template slot="actions" slot-scope="row">
      <b-button size="sm" @click="editFn(row.item.start)" class="mr-2">
        Edit
      </b-button>
    </template>
  </b-table>
</template>

<script>
export default {
  props: ['course', 'segments', 'units', 'owner', 'editFn'],
  filters: {
    formatDist (val, distScale) {
      return (val * distScale).toFixed(2)
    },
    formatAlt (val, altScale) {
      return (val * altScale).toFixed(0)
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
          label: 'End'
        },
        {
          key: 'len',
          label: 'Length [' + this.units.dist + ']',
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
          }
        },
        {
          key: 'start.terrainIndex',
          label: 'Terrain'
        }
      ]
      if (this.owner) {
        f.push({
          key: 'actions',
          label: ''
        })
      }
      return f
    }
  }
}
</script>
