<template>
  <b-table
    :items="races"
    :fields="fields"
    primary-key="_id"
    hover
    small
    >
    <template slot="HEAD_distance">
      Dist. [{{ units.dist }}]
    </template>
    <template slot="HEAD_gain">
      Gain [{{ units.alt }}]
    </template>
    <template slot="HEAD_loss">
      Loss [{{ units.alt }}]
    </template>
    <template slot="HEAD_actions">&nbsp;</template>
      <template slot="actions" slot-scope="row">
        <router-link
          :to="{
            name: 'Race',
            params: {
              permalink: row.item.link
            }
          }"
        >
        <b-button
            size="sm"
            class="mr-1"
            variant="success"
          >
          <v-icon name="arrow-right"></v-icon>
          <span class="d-none d-md-inline">Go!</span>
        </b-button>
        </router-link>
      </template>
  </b-table>
</template>

<script>
import api from '@/api'
import moment from 'moment-timezone'
export default {
  title: 'Races',
  props: ['units', 'races'],
  data () {
    return {
      initializing: true,
      courses: [],
      courseEditor: false,
      fields: [
        {
          key: 'eventStart',
          label: 'Date',
          sortable: true,
          formatter: (value, key, item) => {
            let m = moment(value).tz(item.eventTimezone)
            return m.format('M/D/YYYY')
          }
        },
        {
          key: 'name',
          label: 'Name',
          sortable: true
        },
        {
          key: 'distance',
          sortable: true,
          formatter: (value, key, item) => {
            return (value * this.units.distScale).toFixed(2)
          }
        },
        {
          key: 'gain',
          sortable: true,
          formatter: (value, key, item) => {
            return (value * this.units.altScale).toFixed(0)
              .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
          },
          thClass: 'd-none d-sm-table-cell',
          tdClass: 'd-none d-sm-table-cell'
        },
        {
          key: 'loss',
          sortable: true,
          formatter: (value, key, item) => {
            return (value * this.units.altScale).toFixed(0)
              .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
          },
          thClass: 'd-none d-sm-table-cell',
          tdClass: 'd-none d-sm-table-cell'
        },
        {
          key: 'actions',
          label: 'Actions',
          tdClass: 'actionButtonColumn'
        }
      ]
    }
  },
  methods: {
    async refreshRaces (callback) {
      this.courses = await api.getRaces()
      if (typeof callback === 'function') callback()
    }
  }
}
</script>
