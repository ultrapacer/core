<template>
  <div class="container-fluid mt-4">
    <h1 class="h1 d-none d-md-block">Courses</h1>
    <div v-if="initializing" class="d-flex justify-content-center mb-3">
      <b-spinner label="Loading..." ></b-spinner>
    </div>
    <b-row v-if="!initializing">
      <b-col>
        <b-table :items="courses" :fields="fields" primary-key="_id" @row-clicked="goToCourse" hover>
          <template slot="HEAD_distance">Distance [{{ user.distUnits }}]</template>
          <template slot="HEAD_elevation">Elevation [{{ user.elevUnits }}]</template>
          <template slot="HEAD_actions">&nbsp;</template>
          <template slot="actions" slot-scope="row">
            <b-button size="sm" @click="editCourse(row.item)" class="mr-1">
              <v-icon name="edit"></v-icon><span class="d-none d-md-inline">Edit</span>
            </b-button>
            <b-button size="sm" @click="deleteCourse(row.item)" class="mr-1">
              <v-icon name="trash"></v-icon><span class="d-none d-md-inline">Delete</span>
            </b-button>
          </template>
        </b-table>
        <div>
          <b-btn variant="success" @click.prevent="newCourse()">
            <v-icon name="plus"></v-icon>
            <span>New Course</span>
          </b-btn>
        </div>
      </b-col>
    </b-row>
    <course-edit :course="course" @refresh="refreshCourses" @delete="deleteCourse"></course-edit>
  </div>
</template>

<script>
import api from '@/api'
import CourseEdit from './CourseEdit'
export default {
  title: 'Courses',
  props: ['user'],
  components: {
    CourseEdit
  },
  data () {
    return {
      initializing: true,
      course: {},
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
          key: 'elevation',
          formatter: (value, key, item) => {
            return '+' + (item.gain * this.altScale).toFixed(0) + '/' + (item.loss * this.altScale).toFixed(0)
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
    this.courses = await api.getCourses()
    this.initializing = false
  },
  methods: {
    async refreshCourses () {
      this.courses = await api.getCourses()
    },
    async goToCourse (course) {
      this.$router.push({path: '/course/' + course._id})
    },
    async newCourse () {
      this.course = {}
    },
    async editCourse (course) {
      this.course = Object.assign({}, course)
    },
    async deleteCourse (course, cb) {
      setTimeout(async () => {
        if (confirm('Are you sure you want to delete this course?\n' + course.name)) {
          await api.deleteCourse(course._id)
          var index = this.courses.findIndex(x => x._id === course._id)
          if (index > -1) {
            this.courses.splice(index, 1)
          }
          cb()
        } else {
          cb(new Error('not deleted'))
        }
      }, 100)
    }
  }
}
</script>
