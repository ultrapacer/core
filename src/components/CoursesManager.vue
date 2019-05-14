<template>
  <div class="container-fluid mt-4">
    <h1 class="h1">Courses</h1>
    <div v-if="initializing" class="d-flex justify-content-center mb-3">
      <b-spinner label="Loading..." ></b-spinner>
    </div>
    <b-row v-if="!initializing">
      <b-col>
        <b-table :items="courses" :fields="fields" primary-key="_id" hover>
          <template slot="HEAD_distance">Distance [{{ user.distUnits }}]</template>
          <template slot="HEAD_elevation">Elevation [{{ user.elevUnits }}]</template>
          <template slot="HEAD_actions">&nbsp;</template>
          <template slot="actions" slot-scope="row">
            <b-button size="sm" @click="goToCourse(row.item)" class="mr-2" variant="outline-primary">
              View
            </b-button>
            <b-button size="sm" @click="populateCourseToEdit(row.item)" class="mr-2">
              Edit
            </b-button>
            <b-button size="sm" @click="deleteCourse(row.item._id)" class="mr-2" variant="danger">
              Delete
            </b-button>
          </template>
        </b-table>
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
            <b-form-group label="Privacy">
              <b-form-checkbox v-model="model.public" value="true" unchecked-value="false">
                Visible to public
              </b-form-checkbox>
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
              <b-btn type="submit" variant="success" :disabled="saving">
                 <b-spinner v-show="saving" small></b-spinner>
                 Save Course
               </b-btn>
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
  title: 'Courses',
  props: ['user'],
  data () {
    return {
      initializing: true,
      saving: false,
      editing: false,
      courses: [],
      model: {},
      file: null,
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
            return '+' + (item.gain * this.altScale).toFixed(0) + '/' +  (item.loss * this.altScale).toFixed(0)
          }
        },
        {
          key: 'actions',
          label: 'Actions'
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
    async populateCourseToEdit (course) {
      this.model = Object.assign({}, course)
      this.editing = true
    },
    async saveCourse () {
      this.saving = true
      if (this.model._id) {
        await api.updateCourse(this.model._id, this.model)
      } else {
        const formData = new FormData()
        formData.append('file', this.file)
        formData.append('model', JSON.stringify(this.model))
        await api.createCourse(formData)
      }
      await this.refreshCourses()
      this.saving = false
      this.editing = false
      this.model = {} // reset form
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
