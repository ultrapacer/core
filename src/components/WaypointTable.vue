<template>
  <b-table :items="waypoints" :fields="fields" primary-key="_id" @row-clicked="toggleRowDetails" hover small>
    <template slot="actions" slot-scope="row">
      <b-button size="sm" @click="editFn(row.item)" class="mr-1">
        <v-icon name="edit"></v-icon><span class="d-none d-md-inline">Edit</span>
      </b-button>
      <b-button size="sm" @click="delFn(row.item._id)" class="mr-1">
        <v-icon name="trash"></v-icon><span class="d-none d-md-inline">Delete</span>
      </b-button>
    </template>
    <template slot="row-details" slot-scope="row">
      <b-card>
        <b-row class="mb-2">
          <b-button size="sm" class="mr-2" variant="outline-primary">&lt;&lt;&lt;</b-button>
          <b-button size="sm" class="mr-2" variant="outline-primary">&lt;&lt;</b-button>
          <b-button size="sm" class="mr-2" variant="outline-primary">&lt;</b-button>
          <b-button size="sm" class="mr-2" variant="outline-primary">&gt;</b-button>
          <b-button size="sm" class="mr-2" variant="outline-primary">&gt;&gt;</b-button>
          <b-button size="sm" class="mr-2" variant="outline-primary">&gt;&gt;&gt;</b-button>
        </b-row>
      </b-card>
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
          label: '',
          tdClass: 'actionButtonColumn'
        })
      }
      return f
    }
  },
  methods: {
    toggleRowDetails: function (row) {
      // To toggle:
      this.$set(row, '_showDetails', !row._showDetails)
    }
  }
}
</script>
