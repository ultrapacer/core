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
          <b-form-input
            ref="planformtimeinput"
            type="text"
            v-model="model.pacingTargetF"
            min="0"
            v-mask="targetMask"
            v-bind:placeholder="targetPlaceholder"
            required
            @change="checkTargetFormat"
          ></b-form-input>
        </b-form-group>
        <b-form-group label="Typical Aid Station Delay [mm:ss]">
          <b-form-input
            ref="planformdelayinput"
            type="text"
            v-model="model.waypointDelayF"
            min="0"
            v-mask="'##:##'"
            placeholder="mm:ss"
            required
            @change="checkDelayFormat"
          ></b-form-input>
        </b-form-group>
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
          Save Plan
        </b-button>
      </template>
    </b-modal>
  </div>
</template>

<script>
import api from '@/api'
import timeUtil from '../../shared/timeUtilities'
export default {
  props: ['course', 'plan', 'points', 'units'],
  data () {
    return {
      defaults: {
        pacingMethod: 'time',
        waypointDelay: 60
      },
      model: {},
      pacingMethods: [
        { value: 'time', text: 'Finish Time' },
        { value: 'pace', text: 'Average Pace' },
        { value: 'gap', text: 'Grade Adjusted Pace' }
      ],
      saving: false,
      deleting: false
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
        var s = this.model.pacingTarget
        if (this.model.pacingMethod === 'pace' || this.model.pacingMethod === 'gap') {
          s = s / this.units.distScale
          this.model.pacingTargetF = timeUtil.sec2string(s, 'mm:ss')
        } else {
          this.model.pacingTargetF = timeUtil.sec2string(s, 'hh:mm:ss')
        }
      } else {
        this.model.pacingTargetF = ''
      }
      this.model.waypointDelayF = timeUtil.sec2string(this.model.waypointDelay, 'mm:ss')
      this.$bvModal.show('plan-edit-modal')
    }
  },
  computed: {
    targetLabel: function () {
      var str = ' [hh:mm:ss]'
      if (this.model.pacingMethod === 'pace' || this.model.pacingMethod === 'gap') {
        str = ` [(mm:ss)/${this.units.dist}]`
      }
      for (var i = 0; i < this.pacingMethods.length; i++) {
        if (this.pacingMethods[i].value === this.model.pacingMethod) {
          return this.pacingMethods[i].text + str
        }
      }
    },
    targetPlaceholder: function () {
      if (this.model.pacingMethod === 'pace' || this.model.pacingMethod === 'gap') {
        return 'mm:ss'
      } else {
        return 'hh:mm:ss'
      }
    },
    targetMask: function () {
      if (this.model.pacingMethod === 'pace' || this.model.pacingMethod === 'gap') {
        return '##:##'
      } else {
        return '##:##:##'
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
      this.model.pacingTarget = timeUtil.string2sec(this.model.pacingTargetF)
      if (this.model.pacingMethod === 'pace' || this.model.pacingMethod === 'gap') {
        this.model.pacingTarget = this.model.pacingTarget * this.units.distScale
      }
      this.model.waypointDelay = timeUtil.string2sec(this.model.waypointDelayF)
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
    checkTargetFormat (val) {
      this.validateTime(this.$refs.planformtimeinput, val)
    },
    checkDelayFormat (val, ref) {
      this.validateTime(this.$refs.planformdelayinput, val)
    },
    async remove () {
      this.deleting = true
      this.$emit('delete', this.plan, async (err) => {
        if (!err) {
          this.clear()
          this.$bvModal.hide('plan-edit-modal')
        }
        this.deleting = false
      })
    },
    validateTime (el, val) {
      var pass = true
      if (val.length === el._props.placeholder.length) {
        var arr = val.split(':')
        for (var i = arr.length - 1; i > 0; i--) {
          if (Number(arr[i]) >= 60) {
            pass = false
          }
        }
      } else {
        pass = false
      }
      if (pass) {
        el.setCustomValidity('')
      } else {
        el.setCustomValidity(`Enter time as "${el._props.placeholder}"`)
      }
    }
  }
}
</script>
