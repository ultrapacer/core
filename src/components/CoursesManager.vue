<template>
  <div
    class="container-fluid mt-4"
    style="max-width:60rem"
  >
    <h1 class="h1 d-none d-md-block">
      My Courses
    </h1>
    <div
      v-if="initializing"
      class="d-flex justify-content-center mb-3"
    >
      <b-spinner label="Loading..." />
    </div>
    <b-row v-if="!initializing">
      <b-col>
        <b-table
          :items="courses"
          :fields="fields"
          primary-key="_id"
          hover
          @row-clicked="goToCourse"
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
            <b-button
              v-if="$user._id==row.item._user"
              size="sm"
              class="mr-1"
              @click="editCourse(row.item)"
            >
              <v-icon name="edit" />
              <span class="d-none d-md-inline">Edit</span>
            </b-button>
            <b-button
              size="sm"
              class="mr-1"
              @click="deleteCourse(row.item)"
            >
              <v-icon name="trash" />
              <span
                v-if="$user._id==row.item._user"
                class="d-none d-md-inline"
              >
                Del.
              </span>
              <span
                v-else
                class="d-none d-md-inline"
              >Remove</span>
            </b-button>
            <router-link
              :to="row.item.link ? {
                name: 'Race',
                params: {
                  permalink: row.item.link
                }
              } : {
                name: 'Course',
                params: {
                  course: row.item._id
                }
              }"
            >
              <b-button
                size="sm"
                class="mr-1"
                variant="success"
              >
                <v-icon name="arrow-right" />
                <span class="d-none d-md-inline">Go!</span>
              </b-button>
            </router-link>
          </template>
        </b-table>
        <div>
          <b-button
            variant="success"
            @click.prevent="newCourse()"
          >
            <v-icon name="plus" />
            <span>New Course</span>
          </b-button>
        </div>
      </b-col>
    </b-row>
    <course-edit
      ref="courseEdit"
      @refresh="refreshCourses"
      @delete="deleteCourse"
    />
    <delete-modal
      ref="delModal"
    />
    <vue-headful
      description="ultraPacer is a web app for creating courses and pacing plans for ultramarathons and trail adventures that factor in grade, terrain, altitude, heat, nighttime, and fatigue."
      title="My Courses - ultraPacer"
    />
  </div>
</template>

<script>
import api from '@/api'
import DeleteModal from './DeleteModal'
export default {
  title: 'My Courses',
  components: {
    CourseEdit: () => import(/* webpackPrefetch: true */ './CourseEdit.vue'),
    DeleteModal
  },
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
            return this.$units.distf(value, 2)
          }
        },
        {
          key: 'gain',
          sortable: true,
          formatter: (value, key, item) => {
            return this.$units.altf(value, 0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
          },
          thClass: 'd-none d-sm-table-cell',
          tdClass: 'd-none d-sm-table-cell'
        },
        {
          key: 'loss',
          sortable: true,
          formatter: (value, key, item) => {
            return this.$units.altf(value, 0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
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
  async created () {
    this.$status.calculating = true
    this.courses = await api.getCourses()
    this.initializing = false
    this.$status.calculating = false
  },
  methods: {
    async refreshCourses (callback) {
      this.courses = await api.getCourses()
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
    async newCourse () {
      this.$refs.courseEdit.show({})
    },
    async editCourse (course) {
      this.$refs.courseEdit.show(course)
    },
    async deleteCourse (course, cb) {
      this.$refs.delModal.show(
        {
          type: 'course',
          object: course,
          verb: this.$user._id === course._user ? 'delete' : 'remove'
        },
        async () => {
          await api.deleteCourse(course._id)
          const index = this.courses.findIndex(x => x._id === course._id)
          if (index > -1) {
            this.courses.splice(index, 1)
          }
        },
        (err) => {
          if (typeof (cb) === 'function') {
            if (err) cb(err)
            else cb()
          }
        }
      )
    },
    async copyCourse (id) {
      await api.copyCourse(id)
      this.refreshCourses()
    }
  }
}
</script>
