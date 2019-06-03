<template>
  <div>
    <b-modal
      id="track-edit-modal"
      centered
      v-bind:title="(model._id ? 'Edit' : 'New') + ' Track'"
      @hidden="clear"
      @cancel="clear"
      @ok="handleOk"
    >
      <form ref="trackform" @submit.prevent="">
        <b-form-group label="Source">
          <b-form-radio v-model="model.source" value="gpx">GPX file</b-form-radio>
          <b-form-radio v-model="model.source" value="stravaRoute">Strava Route</b-form-radio>
          <b-form-radio v-model="model.source" value="stravaActivity">Strava Activity</b-form-radio>
        </b-form-group>
        <b-form-group label="GPX File" v-if="source==='gpx'">
          <b-form-file
              :state="Boolean(file)"
              v-model="model.file"
              placeholder="Choose a GPX file..."
              drop-placeholder="Drop GPX file here..."
              accept=".gpx"
              required
            ></b-form-file>
        </b-form-group>
        <b-form-group label="Strava Route" v-if="source==='stravaRoute'">
        </b-form-group>
          <p class="lead">coming soon...</p>
        <b-form-group label="Strava Activity" v-if="source==='stravaActivity'">
          <p class="lead">coming soon...</p>
        </b-form-group>
      </form>
    </b-modal>
  </div>
</template>

<script>
import api from '@/api'
export default {
  props: ['track', 'course'],
  data () {
    return {
      file: null,
      saving: false
    }
  },
  watch: {
    track: function (val) {
      if (val._id) {
        this.model = Object.assign({}, val)
      } else {
        this.model = {}
      }
      this.$bvModal.show('track-edit-modal')
    }
  },
  methods: {
    handleOk (bvModalEvt) {
      bvModalEvt.preventDefault()
      if (this.$refs.trackform.reportValidity()) {
        this.save()
      }
    },
    async save () {
      if (this.saving) { return }
      this.saving = true
      if (this.model.source === 'gpx') {
        model.formData = new FormData()
        model.formData.append('file', this.file)
      }
      if (this.model._id) {
        var track = await api.updateCourse(this.model._id, this.model)
        this.$emit('updated', track)
      } else {
        var track = await api.createCourse(this.model)
        this.$emit('created', track)
      }
      this.saving = false
      this.clear()
      this.$bvModal.hide('track-edit-modal')
    },
    clear () {
      this.model = {}
    }
  }
}
</script>
