<template>
  <b-table :items="waypoints" :fields="fields" primary-key="_id" hover small>
    <template slot="actions" slot-scope="row">
      <b-button size="sm" @click="editFn(row.item)" class="mr-2">
        Edit
      </b-button>
      <b-button size="sm" @click="delFn(row.item._id)" class="mr-2" variant="danger">
        Delete
      </b-button>
    </template>
  </b-table>
</template>

<script>
export default {
  props: ['course', 'waypoints', 'units', 'owner', 'editFn', 'delFn'],
  computed: {
    fields: function () {
      var f = [
        {
          key: 'name'
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
          },
          thClass: 'd-none d-sm-table-cell',
          tdClass: 'd-none d-sm-table-cell'
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
