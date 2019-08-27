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
        <b-form-group label="Name" label-size="sm">
          <b-form-input type="text" v-model="model.name" size="sm" required>
          </b-form-input>
        </b-form-group>
        <b-form-group label="Pacing Method" label-size="sm">
          <b-form-select
              type="number"
              v-model="model.pacingMethod"
              :options="pacingMethods"
               size="sm"
              required>
          </b-form-select>
        </b-form-group>
        <b-form-group v-bind:label="targetLabel" label-size="sm">
          <b-form-input
              ref="planformtimeinput"
              type="text"
              v-model="model.pacingTargetF"
              min="0"
              v-mask="targetMask"
              v-bind:placeholder="targetPlaceholder"
              size="sm"
              required
              @change="checkTargetFormat"
            ></b-form-input>
        </b-form-group>
        <b-form-group label="Start Time [hh:mm (24-hour)]" label-size="sm">
          <b-form-input
              ref="starttimeinput"
              type="text"
              v-model="model.startTimeF"
              min="0"
              v-mask="'##:##'"
              placeholder="hh:mm"
              size="sm"
              @change="checkStartFormat"
          ></b-form-input>
        </b-form-group>
        <b-form-group label="Pace drift [%]" label-size="sm">
          <b-form-input type="text" v-model="model.drift" size="sm" required>
          </b-form-input>
        </b-form-group>
        <b-form-group label="Temperature Model" label-size="sm">
          <b-form-input
              ref="tempModelInput"
              type="text"
              v-model="model.tempModelF"
              size="sm"
              @change="checkTempFormat"
            ></b-form-input>
        </b-form-group>
        <b-form-group label="Typical Aid Station Delay [mm:ss]" label-size="sm">
          <b-form-input
            ref="planformdelayinput"
            type="text"
            v-model="model.waypointDelayF"
            min="0"
            v-mask="'##:##'"
            placeholder="mm:ss"
           size="sm"
            required
            @change="checkDelayFormat"
          ></b-form-input>
        </b-form-group>
        <b-form-group label="Description" label-size="sm">
          <b-form-textarea rows="4" v-model="model.description" size="sm">
          </b-form-textarea>
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
  props: ['course', 'units'],
  data () {
    return {
      defaults: {
        pacingMethod: 'time',
        waypointDelay: 60,
        drift: 0,
        startTime: null,
        tempModel: null
      },
      model: {},
      pacingMethods: [
        { value: 'time', text: 'Finish Time' },
        { value: 'pace', text: 'Average Pace' },
        { value: 'np', text: 'Normalized Pace' }
      ],
      saving: false,
      deleting: false
    }
  },
  computed: {
    targetLabel: function () {
      var str = ' [hh:mm:ss]'
      if (
        this.model.pacingMethod === 'pace' ||
        this.model.pacingMethod === 'np'
      ) {
        str = ` [(mm:ss)/${this.units.dist}]`
      }
      for (var i = 0; i < this.pacingMethods.length; i++) {
        if (this.pacingMethods[i].value === this.model.pacingMethod) {
          return this.pacingMethods[i].text + str
        }
      }
    },
    targetPlaceholder: function () {
      if (
        this.model.pacingMethod === 'pace' ||
        this.model.pacingMethod === 'np'
      ) {
        return 'mm:ss'
      } else {
        return 'hh:mm:ss'
      }
    },
    targetMask: function () {
      if (
        this.model.pacingMethod === 'pace' ||
        this.model.pacingMethod === 'np'
      ) {
        return '##:##'
      } else {
        return '##:##:##'
      }
    }
  },
  methods: {
    async show (plan) {
      if (typeof (plan) !== 'undefined') {
        this.model = Object.assign({}, plan)
      } else {
        this.model = Object.assign({}, this.defaults)
      }
      if (this.model.pacingTarget) {
        var s = this.model.pacingTarget
        if (
          this.model.pacingMethod === 'pace' ||
          this.model.pacingMethod === 'np'
        ) {
          s = s / this.units.distScale
          this.model.pacingTargetF = timeUtil.sec2string(s, 'mm:ss')
        } else {
          this.model.pacingTargetF = timeUtil.sec2string(s, 'hh:mm:ss')
        }
      } else {
        this.model.pacingTargetF = ''
      }
      this.model.waypointDelayF = timeUtil.sec2string(
        this.model.waypointDelay,
        'mm:ss'
      )
      this.model.startTimeF = ''
      if (this.model.startTime !== null) {
        this.model.startTimeF = timeUtil.sec2string(
          this.model.startTime,
          'hh:mm'
        )
      }
      this.model.tempModelF = ''
      if (this.model.tempModel !== null) {
        this.model.tempModelF = JSON.stringify(this.model.tempModel)
      }
      this.$bvModal.show('plan-edit-modal')
    },
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
      if (
        this.model.pacingMethod === 'pace' ||
        this.model.pacingMethod === 'np'
      ) {
        this.model.pacingTarget = this.model.pacingTarget * this.units.distScale
      }
      if (this.model.startTimeF.length) {
        this.model.startTime = timeUtil.string2sec(`${this.model.startTimeF}:00`)
      } else {
        this.model.startTime = null
      }
      if (this.model.tempModelF.length) {
        this.model.tempModel = JSON.parse(this.model.tempModelF)
      } else {
        this.model.tempModel = null
      }
      this.model.waypointDelay = timeUtil.string2sec(this.model.waypointDelayF)
      var p = {}
      if (this.model._id) {
        p = await api.updatePlan(this.model._id, this.model)
      } else {
        this.model._course = this.course._id
        p = await api.createPlan(this.model)
      }
      await this.$emit('refresh', p, () => {
        this.saving = false
        this.clear()
        this.$bvModal.hide('plan-edit-modal')
      })
    },
    clear () {
      this.model = Object.assign({}, this.defaults)
    },
    checkTargetFormat (val) {
      this.validateTime(this.$refs.planformtimeinput, val)
    },
    checkStartFormat (val) {
      this.validateTime(this.$refs.starttimeinput, val, 24)
    },
    checkDelayFormat (val) {
      this.validateTime(this.$refs.planformdelayinput, val)
    },
    checkTempFormat (val) {
      if (!this.model.tempModelF.length) {
        this.$refs.tempModelInput.setCustomValidity('')
        return
      }
      try {
        JSON.parse(this.model.tempModelF)
        this.$refs.tempModelInput.setCustomValidity('')
      } catch (err) {
        this.$refs.tempModelInput.setCustomValidity(err)
      }
    },
    async remove () {
      this.deleting = true
      this.$emit('delete', this.model, async (err) => {
        if (!err) {
          this.clear()
          this.$bvModal.hide('plan-edit-modal')
        }
        this.deleting = false
      })
    },
    validateTime (el, val, max1 = null) {
      var pass = true
      if (el.required || val.length) {
        if (val.length === el._props.placeholder.length) {
          var arr = val.split(':')
          for (var i = arr.length - 1; i > 0; i--) {
            if (Number(arr[i]) >= 60) {
              pass = false
            }
          }
          if (max1 && Number(arr[0]) > max1) {
            pass = false
          }
        } else {
          pass = false
        }
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
