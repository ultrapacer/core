<template>
  <div>
    <b-modal
      id="plan-edit-modal"
      centered
      v-bind:title="(model._id ? 'Edit' : 'New') + ' Plan'"
      @hidden="clear"
      @cancel="clear"
      @ok="handleOk"
    >
      <form @submit.prevent="">
        <b-form-group label="Name">
          <b-form-input type="text" v-model="model.name"></b-form-input>
        </b-form-group>
        <b-form-group label="Pacing Method">
          <b-form-select type="number" v-model="model.pacingMethod" :options="pacingMethods"></b-form-select>
        </b-form-group>
        <b-form-group v-bind:label="targetLabel">
          <b-form-input type="number" v-model="model.pacingTarget" min="0"></b-form-input>
        </b-form-group>
        <b-form-group label="Description">
          <b-form-textarea rows="4" v-model="model.description"></b-form-textarea>
        </b-form-group>
      </form>
      <template slot="modal-ok" slot-scope="{ ok }">
        <b-spinner v-show="saving" small></b-spinner>
        Save Plan
      </template>
    </b-modal>
  </div>
</template>

<script>
import api from '@/api'
import gap from '../../shared/gap'
export default {
  props: ['course', 'plan', 'points'],
  data () {
    return {
      defaults: {
        pacingMethod: 'time'
      },
      model: {},
      pacingMethods: [
        { value: 'time', text: 'Finish Time' },
        { value: 'pace', text: 'Average Pace' },
        { value: 'gap', text: 'Grade Adjusted Pace' }
      ],
      saving: false
    }
  },
  watch: {
    plan: function (val) {
      if (this.plan._id) {
        this.model = Object.assign({}, val)
      } else {
        this.model = Object.assign({}, this.defaults)
      }
      this.$bvModal.show('plan-edit-modal')
    }
  },
  computed: {
    targetLabel: function () {
      for (var i = 0; i < this.pacingMethods.length; i++) {
        if (this.pacingMethods[i].value === this.model.pacingMethod) {
          return this.pacingMethods[i].text
        }
      }
    }
  },
  methods: {
    handleOk (bvModalEvt) {
      bvModalEvt.preventDefault()
      this.save()
    },
    async save () {
      if (this.saving) { return }
      this.saving = true
      var p = {}
      if (this.model._id) {
        p = await api.updatePlan(this.model._id, this.model)
      } else {
        this.model._course = this.course._id
        p = await api.createPlan(this.model)
      }
      await this.$emit('refresh', p)
      this.saving = false
      this.clear()
      this.$bvModal.hide('plan-edit-modal')
    },
    clear () {
      this.model = Object.assign({}, this.defaults)
    }
  }
}
</script>
