<template>
  <div>
    <b-modal
      id="track-edit-modal"
      centered
      v-bind:title="(model._id ? 'Edit' : 'New') + ' Course'"
      @hidden="clear"
      @cancel="clear"
      @ok="handleOk"
    >
      <form ref="trackform" @submit.prevent="">
        <b-form-group label="Source">
          <b-form-radio v-model="source" value="gpx">GPX file</b-form-radio>
          <b-form-radio v-model="source" value="stravaRoute">Strava Route</b-form-radio>
          <b-form-radio v-model="source" value="stravaActivity">Strava Activity</b-form-radio>
        </b-form-group>
        <b-form-group label="GPX File" v-if="source==='gpx'">
          <b-form-file
              :state="Boolean(file)"
              v-model="file"
              placeholder="Choose a GPX file..."
              drop-placeholder="Drop GPX file here..."
              accept=".gpx"
              required
            ></b-form-file>
        </b-form-group>
      </form>
    </b-modal>
  </div>
</template>

<script>
import api from '@/api'
export default {
  props: ['course'],
  data () {
    return {
      file: null,
      saving: false
    }
  },
  watch: {
    course: function (val) {
      if (val._id) {
        this.model = Object.assign({}, val)
      } else {
        this.model = {}
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
      if (this.model._id) {
        await api.updateCourse(this.model._id, this.model)
      } else {
        const formData = new FormData()
        formData.append('file', this.file)
        formData.append('model', JSON.stringify(this.model))
        await api.createCourse(formData)
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
