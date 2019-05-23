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
      <form ref="planform" @submit.prevent="">
        <b-form-group label="Name">
          <b-form-input type="text" v-model="model.name" required></b-form-input>
        </b-form-group>
        <b-form-group label="Pacing Method">
          <b-form-select type="number" v-model="model.pacingMethod" :options="pacingMethods" required></b-form-select>
        </b-form-group>
        <b-form-group v-bind:label="targetLabel">
          <b-form-input ref="planformtimeinput" type="text" v-model="model.pacingTargetFormatted" min="0" v-mask="'##:##:##'" placeholder="hh:mm:ss" required @change="checktimeformat"></b-form-input>
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
      if (this.model.pacingTarget) {
        var d = new Date(null)
        d.setSeconds(this.model.pacingTarget)
        this.model.pacingTargetFormatted = d.toISOString().substr(11, 8)
      } else {
        this.model.pacingTargetFormatted = ''
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
      if (this.$refs.planform.reportValidity()) {
        this.save()
      }
    },
    async save () {
      if (this.saving) { return }
      this.saving = true
      var arr = this.model.pacingTargetFormatted.split(':')
      this.model.pacingTarget = 3600 * Number(arr[0]) + 60 * Number(arr[1]) + Number(arr[2])
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
    },
    checktimeformat (val) {
      console.log(val)
      var pass = true
      if (val.length === 8) {
        var arr = val.split(':')
        if (Number(arr[1]) >= 60 || Number(arr[2]) >= 60) {
          pass = false
        }
      } else {
        pass = false
      }
      if (pass) {
        this.$refs.planformtimeinput.setCustomValidity('')
      } else {
        this.$refs.planformtimeinput.setCustomValidity('Enter time in "hh:mm:ss".')
      }
    }
  }
}
</script>
