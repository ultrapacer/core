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
        <b-form-group label="Description">
          <b-form-textarea rows="4" v-model="model.description"></b-form-textarea>
        </b-form-group>
        <b-form-group label="GPX File" v-if="!model._id">
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
export default {
  props: ['course'],
  data () {
    return {
      file: null,
      model: {},
      saving: false,
      deleting: false
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
