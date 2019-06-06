<template>
  <div>
    <b-modal
      id="segment-edit-modal"
      centered
      :static="true"
      v-bind:title="(model._id ? 'Edit' : 'New') + ' Segment'"
      @hidden="clear"
      @cancel="clear"
      @ok="handleOk"
    >
      <form ref="segmentform" @submit.prevent="">
        <b-form-group label="Terrain">
          <b-form-input type="number" v-model="model.terrainIndex" min="0" step="0" required></b-form-input>
        </b-form-group>
        <b-form-group label="Notes">
          <b-form-textarea rows="4" v-model="model.segmentNotes"></b-form-textarea>
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
  props: ['segment'],
  data () {
    return {
      model: {},
      saving: false
    }
  },
  watch: {
    segment: function (val) {
      if (val._id) {
        this.model = Object.assign({}, val)
      } else {
        this.model = {}
      }
      this.$bvModal.show('segment-edit-modal')
    }
  },
  methods: {
    handleOk (bvModalEvt) {
      bvModalEvt.preventDefault()
      if (this.$refs.segmentform.reportValidity()) {
        this.save()
      }
    },
    async save () {
      if (this.saving) { return }
      this.saving = true
      await api.updateSegment(this.model._id, this.model)
      await this.$emit('refresh', () => {
        this.saving = false
        this.clear()
        this.$bvModal.hide('segment-edit-modal')
      })
    },
    clear () {
      this.model = {}
    }
  }
}
</script>
