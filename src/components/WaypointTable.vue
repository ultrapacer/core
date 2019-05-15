<template>
  <b-table :items="waypoints" :fields="fields" primary-key="_id" hover small>
    <template slot="actions" slot-scope="row">
      <b-button size="sm" @click="$emit('populateWaypointToEdit', row.item)" class="mr-2">
        Edit
      </b-button>
      <b-button size="sm" @click="$emit('deleteWaypoint' row.item._id)" class="mr-2" variant="danger">
        Delete
      </b-button>
    </template>
  </b-table>
</template>

<script>
export default {
  props: ['course', 'segments', 'units'],
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
      return [
        {
          key: 'name',
        },
        {
          key: 'location',
          label: 'Location [' + this.units.dist + ']',
          formatter: (value, key, item) => {
            return (value * this.units.distScale).toFixed(2)
          }
        },
        {
          key: 'elevation',
          label: 'Elevation [' + this.units.alt + ']',
          formatter: (value, key, item) => {
            return (value * this.units.altScale).toFixed(0)
          }
        },
        {
          key: 'actions',
          label: ''
        }
      ]
    }
  }
}
</script>
