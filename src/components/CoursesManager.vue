<template>
  <div class="container-fluid mt-4">
    <h1 class="h1">Courses</h1>
    <b-alert :show="loading" variant="info">Loading...</b-alert>
    <b-row>
      <b-col>
        <table class="table table-striped">
          <thead>
            <tr>
              <th>Name</th>
              <th>Distance [{{ user.distUnits }}]</th>
              <th>Elevation [{{ user.elevUnits }}]</th>
              <th>&nbsp;</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="course in courses" :key="course._id">
              <td>{{ course.name }}</td>
              <td>{{ course.distance | formatDist(distScale) }}</td>
              <td>+{{ course.gain | formatAlt(altScale) }}/{{ course.loss | formatAlt(altScale) }}</td>
              <td class="text-right">
                <router-link :to="'/course/?course='+course._id">Go</router-link> /
                <a href="#" @click.prevent="populateCourseToEdit(course)">Edit</a> /
                <a href="#" @click.prevent="deleteCourse(course._id)">Delete</a>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-show="!editing">
          <b-btn variant="success" @click.prevent="newCourse()">New Course</b-btn>
        </div>
      </b-col>
      <b-col v-show="editing" lg="3">
        <b-card :title="(model._id ? 'Edit Course' : 'New Course')">
          <form @submit.prevent="saveCourse">
            <b-form-group label="Name">
              <b-form-input type="text" v-model="model.name"></b-form-input>
            </b-form-group>
            <b-form-group label="Description">
              <b-form-textarea rows="4" v-model="model.description"></b-form-textarea>
            </b-form-group>
            <b-form-group label="GPX File" v-show="!model._id">
              <b-form-file
                  :state="Boolean(file)"
                  v-model="file"
                  placeholder="Choose a GPX file..."
                  drop-placeholder="Drop GPX file here..."
                  accept=".gpx"
                ></b-form-file>
            </b-form-group>
            <div>
              <b-btn type="submit" variant="success">Save Course</b-btn>
              <b-btn type="cancel" @click.prevent="cancelEdit()">Cancel</b-btn>
            </div>
          </form>
        </b-card>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import api from '@/api'
export default {
  props: ['user'],
  data () {
    return {
      loading: false,
      editing: false,
      courses: [],
      model: {},
      file: null
    }
  },
  filters: {
    formatDist (val, distScale) {
      return (val * distScale).toFixed(2)
    },
    formatAlt (val, altScale) {
      return (val * altScale).toFixed(0)
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
    this.loading = true
    this.courses = await api.getCourses()
    this.loading = false
  },
  methods: {
    async refreshCourses () {
      this.courses = await api.getCourses()
    },
    async populateCourseToEdit (course) {
      this.model = Object.assign({}, course)
      this.editing = true
    },
    async saveCourse () {
      if (this.model._id) {
        await api.updateCourse(this.model._id, this.model)
      } else {
        const formData = new FormData()
        formData.append('file', this.file)
        formData.append('model', JSON.stringify(this.model))
        await api.createCourse(formData)
      }
      this.model = {} // reset form
      await this.refreshCourses()
      this.editing = false
    },
    async deleteCourse (id) {
      if (confirm('Are you sure you want to delete this course?')) {
        // if we are editing a course we deleted, remove it from the form
        if (this.model._id === id) {
          this.model = {}
          this.editing = false
        }
        await api.deleteCourse(id)
        await this.refreshCourses()
      }
    },
    async cancelEdit () {
      this.model = {}
      this.editing = false
      await this.refreshCourses()
    },
    async newCourse () {
      this.model = {}
      this.editing = true
    }
  }
}
</script>
