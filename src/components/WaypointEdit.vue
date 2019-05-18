<template>
  <div>
    <b-modal
      id="waypoint-edit-modal"
      centered
      :static="true"
      v-bind:title="(model._id ? 'Edit Waypoint' : 'New Waypoint')"
      @hidden="clearModal"
      @cancel="clearModal"
      @ok="handleOk"
    >
      <form @submit.prevent="">
        <b-form-group label="Name">
          <b-form-input type="text" v-model="waypointToEdit.name"></b-form-input>
        </b-form-group>
        <b-form-group v-bind:label="'Location [' + units.dist + ']'" v-show="waypointToEdit.type != 'start' && waypointToEdit.type != 'finish'">
          <b-form-input type="number" step="0.001" v-model="waypointLoc" min="0" v-bind:max="course.distance"></b-form-input>
        </b-form-group>
        <b-form-group label="Type">
          <b-form-select type="number" v-model="waypointToEdit.type" :options="waypointTypes"></b-form-select>
        <b-form-group>
        <b-form-group label="Description">
          <b-form-textarea rows="4" v-model="waypointToEdit.description"></b-form-textarea>
        </b-form-group>
      </form>
      <template slot="modal-ok" slot-scope="{ ok }">
        <b-spinner v-show="saving" small></b-spinner>
        Save Waypoint
      </template>
    </b-modal>
  </div>
</template>

<script>
import api from '@/api'
export default {
  props: ['waypoint'],
  data (
    return {
      file: null,
      model: {},
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
      this.$bvModal.show('waypoint-edit-modal')
    }
  },
  methods: {
    handleOk(bvModalEvt) {
      // Prevent modal from closing
      bvModalEvt.preventDefault()
      // Trigger submit handler
      this.saveWaypoint()
    },
    async saveWaypoint () {
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
      this.clearModal()
      this.$bvModal.hide('course-edit-modal')
    },
    clearModal() {
      this.model = {}
    }
  }
}
</script>
