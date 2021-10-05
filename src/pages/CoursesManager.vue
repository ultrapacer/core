<template>
  <div
    class="primary-page"
    style="max-width:60rem"
  >
    <b-row>
      <b-col class="title-row">
        <h1
          class="h1 d-none d-md-block"
          style="float:left"
        >
          My Courses
        </h1>
        <b-button
          class="create-button mt-2 mb-2"
          variant="success"
          @click.prevent="newCourse()"
        >
          <v-icon name="plus" />
          <span>New Course</span>
        </b-button>
      </b-col>
    </b-row>
    <b-row
      v-if="courses.length"
      ref="coursesTable"
    >
      <b-col>
        <b-table
          :items="courses"
          :fields="fields"
          primary-key="_id"
          hover
          small
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
            <div>
              <b-button
                v-if="$user._id==row.item._user"
                class="mr-1"
                @click="editCourse(row.item)"
              >
                <v-icon name="edit" />
                <span class="d-none d-md-inline">Edit</span>
              </b-button>
              <b-button
                class="mr-1"
                @click="deleteCourse(row.item)"
              >
                <v-icon name="trash" />
                <span class="d-none d-md-inline">
                  {{ $user._id==row.item._user ? 'Del' : 'Remove' }}
                </span>
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
                  class="mr-1"
                  variant="success"
                >
                  <v-icon name="arrow-right" />
                  <span class="d-none d-md-inline">Go!</span>
                </b-button>
              </router-link>
            </div>
          </template>
        </b-table>
      </b-col>
    </b-row>
    <course-edit
      ref="courseEdit"
      @afterEdit="refreshCourses"
      @afterCreate="goToCourse"
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
import DeleteModal from '../components/DeleteModal'
export default {
  title: 'My Courses',
  components: {
    CourseEdit: () => import(/* webpackPrefetch: true */ '../components/CourseEdit.vue'),
    DeleteModal
  },
  data () {
    return {
      courses: [],
      courseEditor: false,
      fields: [
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
            return this.$units.distf(item.scaledDist, 2)
          }
        },
        {
          key: 'gain',
          sortable: true,
          formatter: (value, key, item) => {
            return this.$units.altf(item.scaledGain, 0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
          },
          class: 'd-none d-sm-table-cell'
        },
        {
          key: 'loss',
          sortable: true,
          formatter: (value, key, item) => {
            return this.$units.altf(item.scaledLoss, 0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
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
  watch: {
    '$user._id': async function (v) {
      if (v) {
        await this.refreshCourses()
        this.$status.loading = false
      }
    }
  },
  async created () {
    this.$status.loading = true
    if (this.$user._id) {
      await this.refreshCourses()
      this.$status.loading = false
    }
  },
  methods: {
    async refreshCourses (callback) {
      this.$status.processing = true
      const courses = await api.getCourses()
      courses.sort((a, b) => {
        if (a.name.toLowerCase() < b.name.toLowerCase()) { return -1 }
        if (a.name.toLowerCase() > b.name.toLowerCase()) { return 1 }
        return 0
      })
      this.courses = courses.map(c => { return new this.$core.courses.Course(c) })
      if (typeof callback === 'function') callback()
      this.$status.processing = false
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
      this.$refs.courseEdit.show()
    },
    async editCourse (course) {
      this.$status.processing = true
      this.$refs.courseEdit.show(course._id)
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
<style>
.create-button {
  @media (max-width: 767px) {
    width: 100%;
  }
  @media (min-width: 768px) {
    float: right;
  }
}
.title-row {
  @media (max-width: 767px) {
    text-align: center;
  }
}
</style>
