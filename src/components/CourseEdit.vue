<template>
  <div>
    <b-modal
      id="course-edit-modal"
      centered
      v-bind:title="(model._id ? 'Edit' : 'New') + ' Course'"
      @hidden="clear"
      @cancel="clear"
      @ok="handleOk"
    >
      <form ref="courseform" @submit.prevent="">
        <b-form-group label="Name">
          <b-form-input type="text" v-model="model.name" required></b-form-input>
        </b-form-group>
        <b-form-group label="Privacy">
          <b-form-checkbox v-model="model.public" value="true" unchecked-value="false">
            Visible to public
          </b-form-checkbox>
        </b-form-group>
        <b-form-group v-if="!showTrackForms" label="Source">
          {{ sources[course.track.source] }}: {{ course.track.name }} ()
        </b-form-group>
        <div v-if="showTrackForms">
          <b-form-group label="Source">
            <b-form-radio v-model="model.track.source" value="gpx">GPX file</b-form-radio>
            <b-form-radio v-model="model.track.source" value="stravaRoute" disabled>Strava Route</b-form-radio>
            <b-form-radio v-model="model.track.source" value="stravaActivity" disabled>Strava Activity</b-form-radio>
          </b-form-group>
          <b-form-group v-if="model.track.source==='gpx'">
            <b-form-file
                :state="Boolean(file)"
                v-model="file"
                placeholder="Choose a GPX file..."
                drop-placeholder="Drop GPX file here..."
                accept=".gpx"
                required
              ></b-form-file>
          </b-form-group>
          <b-form-group v-if="model.track.source==='stravaRoute'">
            <p class="lead">Strava integration coming soon...</p>
          </b-form-group>
          <b-form-group v-if="model.track.source==='stravaActivity'">
            <p class="lead">Strava integration coming soon...</p>
          </b-form-group>
        </div>
        <b-form-group label="Description">
          <b-form-textarea rows="4" v-model="model.description"></b-form-textarea>
        </b-form-group>
      </form>
      <template slot="modal-footer" slot-scope="{ ok, cancel }">
        <div v-if="model._id" style="text-align: left; flex: auto">
          <b-button size="sm" variant="danger" @click="remove">
            <b-spinner v-show="deleting" small></b-spinner>
            Delete
          </b-button>
        </div>
        <b-button variant="secondary" @click="cancel()">
          Cancel
        </b-button>
        <b-button variant="primary" @click="ok()">
          <b-spinner v-show="saving" small></b-spinner>
          Save Course
        </b-button>
      </template>
    </b-modal>
  </div>
</template>

<script>
import api from '@/api'
const gpxParse = require('gpx-parse')
export default {
  props: ['course'],
  data () {
    return {
      file: null,
      model: { track: { source: 'gpx' } },
      saving: false,
      deleting: false,
      showTrackForms: true,
      sources: {
        gpx: 'GPX File',
        stravaActivity: 'Strava Activity',
        stravaRoute: 'Strava Route'
      }
    }
  },
  watch: {
    course: function (val) {
      if (val._id) {
        this.model = Object.assign({}, val)
        this.showTrackForms = false
      } else {
        this.model = { track: { source: 'gpx' } }
        this.showTrackForms = true
      }
      this.$bvModal.show('course-edit-modal')
    }
  },
  methods: {
    handleOk (bvModalEvt) {
      bvModalEvt.preventDefault()
      if (this.$refs.courseform.reportValidity()) {
        this.save()
      }
    },
    async save () {
      if (this.saving) { return }
      this.saving = true
      if (this.model.track.source === 'gpx') {
        var reader = new FileReader()
        reader.onload = function(e) {
          var text = reader.result;
        }
        console.log(reader.readAsText(this.file))
       // gpxParse.parseGpx(reader.readAsText(this.file), function (error, data) {
         
        //  console.log(data)
        //})
        const formData = new FormData()
        formData.append('file', this.file)
        this.model.track.fileFormData = formData
        this.model.track.name = this.file.name
      }
      console.log(this.model)
      if (this.model._id) {
        await api.updateCourse(this.model._id, this.model)
      } else {
        await api.createCourse(this.model)
      }
      await this.$emit('refresh')
      this.saving = false
      this.clear()
      this.$bvModal.hide('course-edit-modal')
    },
    clear () {
      this.model = {}
    },
    async remove () {
      this.deleting = true
      this.$emit('delete', this.course, async (err) => {
        if (!err) {
          this.$bvModal.hide('course-edit-modal')
        }
        this.deleting = false
      })
    }
  }
}
</script>
