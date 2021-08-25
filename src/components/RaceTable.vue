<template>
  <b-table
    :items="races"
    :fields="fields"
    primary-key="_id"
    hover
    small
    @row-clicked="goToRace"
  >
    <template #head(distance)>
      Dist. [{{ $units.dist }}]
    </template>
    <template #head(gain)>
      Gain [{{ $units.alt }}]
    </template>
    <template #head(loss)>
      Loss [{{ $units.alt }}]
    </template>
    <template #head(actions)>
&nbsp;
    </template>
    <template #cell(actions)="row">
      <router-link
        :to="{
          name: 'Race',
          params: {
            permalink: row.item.link
          }
        }"
      >
        <b-button
          class="mr-1"
          variant="success"
        >
          <v-icon name="arrow-right" />
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
  props: {
    races: {
      type: Array,
      required: true
    }
  },
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
            const m = moment(value).tz(item.eventTimezone)
            return m.format('M/D/YYYY')
          }
        },
        {
          class: 'text-truncate coursetitlecolumn',
          key: 'name',
          label: 'Name',
          sortable: true
        },
        {
          key: 'distance',
          sortable: true,
          formatter: (value, key, item) => {
            return this.$units.distf(item.totalDistance(), 2)
          }
        },
        {
          key: 'gain',
          sortable: true,
          formatter: (value, key, item) => {
            return this.$units.altf(item.totalGain(), 0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
          },
          class: 'd-none d-sm-table-cell'
        },
        {
          key: 'loss',
          sortable: true,
          formatter: (value, key, item) => {
            return this.$units.altf(item.totalLoss(), 0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
          },
          class: 'd-none d-sm-table-cell'
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
    },
    async goToRace (course) {
      this.$router.push({
        name: 'Race',
        params: {
          permalink: course.link
        }
      })
    }
  }
}
</script>
