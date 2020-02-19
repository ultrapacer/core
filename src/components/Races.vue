<template>
  <div class="container-fluid mt-4">
    <h1 class="h1 d-none d-md-block">Race Database</h1>
    <div v-if="initializing" class="d-flex justify-content-center mb-3">
      <b-spinner label="Loading..." ></b-spinner>
    </div>
    <b-row v-if="!initializing">
      <b-col>
        <b-table
          :items="races"
          :fields="fields"
          primary-key="_id"
          @row-clicked="goToCourse"
          hover
          >
          <template slot="HEAD_distance">
            Distance [{{ user.distUnits }}]
          </template>
          <template slot="HEAD_elevation">
            Elevation [{{ user.elevUnits }}]
          </template>
        </b-table>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import api from '@/api'
export default {
  title: 'Races',
  props: ['user'],
  data () {
    return {
      initializing: true,
      courses: [],
      courseEditor: false,
      fields: [
        {
          key: 'name',
          label: 'Name',
          sortable: true
        },
        {
          key: 'distance',
          sortable: true,
          formatter: (value, key, item) => {
            return (value * this.distScale).toFixed(2)
          }
        },
        {
          key: 'gain',
          sortable: true,
          formatter: (value, key, item) => {
            return (value * this.altScale).toFixed(0)
              .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
          },
          thClass: 'd-none d-sm-table-cell',
          tdClass: 'd-none d-sm-table-cell'
        },
        {
          key: 'loss',
          sortable: true,
          formatter: (value, key, item) => {
            return (value * this.altScale).toFixed(0)
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
  computed: {
    distScale: function () {
      if (this.user.distUnits === 'mi') {
        return 0.621371
      } else {
        return 1
      }
    },
    altScale: function () {
      if (this.user.elevUnits === 'ft') {
        return 3.28084
      } else {
        return 1
      }
    }
  },
  async created () {
    this.races = await api.getRaces()
    this.initializing = false
  },
  methods: {
    async refreshRaces (callback) {
      this.courses = await api.getRaces()
      if (typeof callback === 'function') callback()
    },
    async goToCourse (course) {
      if (course.link) {
        this.$router.push({
          name: 'Race',
          params: {
            permalink: course.link
          }
        })
      } else {
        this.$router.push({
          name: 'Course',
          params: {
            course: course._id
          }
        })
      }
    },
  }
}
</script>
