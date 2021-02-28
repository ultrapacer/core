<template>
  <div>
    <b-modal
      ref="modal"
      centered
      :title="(model._id ? 'Edit' : 'New') + ' Plan'"
      hide-header-close
      :no-close-on-esc="this.$status.processing"
      :no-close-on-backdrop="this.$status.processing"
      @hidden="clear"
      @cancel="clear"
      @ok="handleOk"
    >
      <form
        ref="planform"
        @submit.prevent=""
      >
        <b-input-group
          prepend="Name"
          class="mb-2"
          size="sm"
        >
          <b-form-input
            v-model="model.name"
            type="text"
            size="sm"
            required
          />
        </b-input-group>
        <form-tip v-if="showTips">
          Required: title for this plan; for example "A goal" or "Qualify" or "24-hour finish".
        </form-tip>
        <b-input-group
          prepend="Pacing Method"
          class="mb-2"
          size="sm"
        >
          <b-form-select
            v-model="model.pacingMethod"
            type="number"
            :options="pacingMethods"
            size="sm"
            required
          />
        </b-input-group>
        <form-tip v-if="showTips">
          Required: pacing method for this plan; see Docs.
        </form-tip>
        <b-input-group
          :prepend="targetLabel"
          class="mb-2"
          size="sm"
        >
          <b-form-input
            ref="planformtimeinput"
            v-model="model.pacingTargetF"
            v-mask="targetMask"
            type="text"
            min="0"
            :placeholder="targetPlaceholder"
            size="sm"
            required
            @change="checkTargetFormat"
          />
        </b-input-group>
        <form-tip v-if="showTips">
          Required: {{ targetPopover }}
        </form-tip>
        <b-input-group
          prepend="Aid Station Delay"
          class="mb-2"
          size="sm"
        >
          <b-form-input
            v-model="model.waypointDelayF"
            v-mask="'##:##'"
            type="text"
            min="0"
            placeholder="mm:ss"
            :formatter="format_hhmm"
            lazy-formatter
            size="sm"
            required
          />
        </b-input-group>
        <form-tip v-if="showTips">
          Optional: aid station delay or time spent at each aid station. Also
          applies to water sources.
        </form-tip>
        <b-form-group
          v-if="Boolean(course.eventStart)"
          :class="customStart ? 'mb-0' : 'mb-2'"
        >
          <b-form-radio
            v-model="customStart"
            size="sm"
            :value="false"
            @input="customStartDefaults"
          >
            Use course start (<b>{{ course.eventStart | datetime(course.eventTimezone) }}</b>), or
          </b-form-radio>
          <b-form-radio
            v-model="customStart"
            size="sm"
            :value="true"
            @input="customStartDefaults"
          >
            Use custom start<span v-if="customStart">, defined below:</span>
          </b-form-radio>
          <form-tip v-if="showTips">
            Optional: specify a different date/time for this Plan.
          </form-tip>
        </b-form-group>
        <form-date-time
          v-if="customStart || !Boolean(course.eventStart)"
          v-model="moment"
          :class="(Boolean(course.eventStart)) ? 'pl-3' : ''"
          :show-tips="showTips"
        >
          <template #date-tip>
            Optional: start date of your activity; many pacing factors will only be applied if a date and time are specified.
          </template>
        </form-date-time>
        <b-form-checkbox
          v-model="enableDrift"
          :value="true"
          size="sm"
          class="mb-2"
          :unchecked-value="false"
        >
          Apply pace drift
        </b-form-checkbox>
        <form-tip v-if="showTips && !enableDrift">
          Optional: enable to add a linear change in speed throughout the race.
        </form-tip>
        <b-form-group
          v-if="enableDrift"
          class="mb-0 pl-3"
        >
          <b-input-group
            prepend="Pace drift"
            append="%"
            class="mb-2"
            size="sm"
          >
            <b-form-input
              v-model="model.drift"
              type="text"
              size="sm"
              required
            />
          </b-input-group>
          <form-tip v-if="showTips">
            Optional: linear change in speed throughout race. For
            example, 10% means you begin the race 10% faster than you finish.
            Negative value for negative split.
          </form-tip>
        </b-form-group>
        <b-form-group
          v-if="Boolean(course.eventStart) || (moment !== null && Number(moment.format('YYYY') > 1970))"
          class="mb-0"
        >
          <b-form-checkbox
            v-model="hF.enabled"
            :value="true"
            size="sm"
            class="mb-2"
            :unchecked-value="false"
          >
            Apply heat factor
          </b-form-checkbox>
          <form-tip v-if="showTips">
            Optional: pace modifier for heat and sun exposure. Requires date
            and time to be specified.
          </form-tip>
          <b-form-group
            v-if="hF.enabled"
            class="mb-0 pl-3"
          >
            <b-input-group
              prepend="Baseline"
              append="%"
              class="mb-2"
              size="sm"
            >
              <b-form-input
                v-model="hF.baseline"
                class="mb-n2"
              />
            </b-input-group>
            <form-tip v-if="showTips">
              Optional: pace modifier for heat; baseline factor is consistent
              throughout the whole event. See Docs.
            </form-tip>
            <b-input-group
              prepend="Maximum"
              append="%"
              class="mb-2"
              size="sm"
            >
              <b-form-input
                v-model="hF.max"
                class="mb-n2"
              />
            </b-input-group>
            <form-tip v-if="showTips">
              Optional: pace modifier for heat; maximum heat factor in addition
              to Baseline above. See Docs.
            </form-tip>
          </b-form-group>
        </b-form-group>
        <b-input-group
          prepend="Notes"
          class="mb-2"
          size="sm"
        >
          <b-form-textarea
            v-model="model.description"
            rows="2"
            size="sm"
          />
        </b-input-group>
        <form-tip v-if="showTips">
          Optional: any miscellaneous notes for this Plan.
        </form-tip>
      </form>
      <template #modal-footer="{ ok, cancel }">
        <div
          style="text-align: left; flex: auto"
        >
          <b-button
            size="sm"
            variant="warning"
            @click="$refs.help.show()"
          >
            Docs
          </b-button>
          <b-button
            size="sm"
            variant="warning"
            @click="toggleTips()"
          >
            Tips
          </b-button>
        </div>
        <b-button
          v-if="model._id"
          variant="danger"
          @click="remove"
        >
          Delete
        </b-button>
        <b-button
          variant="secondary"
          @click="cancel()"
        >
          Cancel
        </b-button>
        <b-button
          variant="primary"
          @click="ok()"
        >
          {{ $auth.isAuthenticated() ? 'Save' : 'Go' }}
        </b-button>
      </template>
    </b-modal>
    <b-modal
      ref="help"
      :title="`Plan ${model._id ? 'Edit' : 'Create'} Help`"
      size="lg"
      scrollable
      ok-only
    >
      <help-doc class="documentation" />
    </b-modal>
    <b-toast
      ref="toast-new-plan"
      :title="'New plan for ' + course.name"
      toaster="b-toaster-bottom-right"
      solid
      variant="info"
      auto-hide-delay="5000"
    >
      {{ newPlanToastMsg }}Login or Signup to ultraPacer to save or share your new plan for "{{ course.name }}".
    </b-toast>
  </div>
</template>

<script>
import api from '@/api'
import moment from 'moment-timezone'
import { sec2string, string2sec } from '../util/time'
import FormDateTime from './FormDateTime'
import FormTip from './FormTip'
import HelpDoc from '@/docs/plan.md'
export default {
  components: {
    FormDateTime,
    FormTip,
    HelpDoc
  },
  filters: {
    datetime: function (val, tz) {
      const m = moment(val).tz(tz)
      return m.format('M/D/YYYY | h:mm A')
    }
  },
  props: {
    course: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      defaults: {
        pacingMethod: 'time',
        waypointDelay: 60,
        drift: null,
        heatModel: null
      },
      model: {},
      moment: null,
      pacingMethods: [
        { value: 'time', text: 'Elapsed Time' },
        { value: 'pace', text: 'Average Pace' },
        { value: 'np', text: 'Normalized Pace' }
      ],
      hF: {
        enabled: false,
        baseline: '',
        max: ''
      },
      customStart: false,
      enableDrift: false,
      showTips: false,
      timezones: moment.tz.names(),
      newPlanToastMsg: ''
    }
  },
  computed: {
    targetLabel: function () {
      let str = ''
      const pacingMethod = this.pacingMethods.find(
        pm => pm.value === this.model.pacingMethod
      )
      if (pacingMethod) {
        str = pacingMethod.text
        if (
          this.model.pacingMethod === 'pace' ||
          this.model.pacingMethod === 'np'
        ) {
          str = `${str} [/${this.$units.dist}]`
        }
      }
      return str
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
    },
    targetPopover: function () {
      return `${this.targetLabel}: enter target as ${this.targetPlaceholder}`
    }
  },
  watch: {
    'course.eventStart': function (v) {
      // because course.eventStart isn't always ready at form show
      this.customStart = !v
    },
    enableDrift: function (val) {
      if (!val) this.model.drift = null
    }
  },
  methods: {
    async show (plan) {
      this.showTips = false
      this.moment = null
      if (typeof (plan) !== 'undefined') {
        this.model = Object.assign({}, plan)
      } else {
        this.model = Object.assign({}, this.defaults)
      }
      if (this.model.pacingTarget) {
        let s = this.model.pacingTarget
        if (
          this.model.pacingMethod === 'pace' ||
          this.model.pacingMethod === 'np'
        ) {
          s = s / this.$units.distScale
          this.model.pacingTargetF = sec2string(s, 'mm:ss')
        } else {
          this.model.pacingTargetF = sec2string(s, 'hh:mm:ss')
        }
      } else {
        this.model.pacingTargetF = ''
      }
      this.model.waypointDelayF = sec2string(
        this.model.waypointDelay,
        'mm:ss'
      )
      const tz = this.model.eventTimezone || this.course.eventTimezone || moment.tz.guess()
      if (this.model.eventStart) {
        this.moment = moment(this.model.eventStart).tz(tz)
        this.customStart = true
      } else {
        this.moment = moment(0).tz(tz)
        this.customStart = false
      }
      if (this.model.heatModel !== null) {
        this.hF.max = this.model.heatModel.max
        this.hF.baseline = this.model.heatModel.baseline || 0
        this.hF.enabled = true
      } else {
        this.hF.enabled = false
      }
      this.enableDrift = Boolean(this.model.drift)
      this.$refs.modal.show()
    },
    handleOk (bvModalEvt) {
      bvModalEvt.preventDefault()
      if (this.$refs.planform.reportValidity()) {
        this.save()
      }
    },
    async save () {
      if (this.$status.processing) { return }
      this.$status.processing = true
      this.model.pacingTarget = string2sec(this.model.pacingTargetF)
      if (
        this.model.pacingMethod === 'pace' ||
        this.model.pacingMethod === 'np'
      ) {
        this.model.pacingTarget = this.$units.distf(this.model.pacingTarget)
      }
      if (this.customStart || !this.course.eventStart) {
        this.model.eventTimezone = this.moment.tz()
        if (Number(this.moment.format('YYYY') > 1970)) {
          this.model.eventStart = this.moment.toDate()
        } else {
          this.model.eventStart = null
        }
      } else {
        this.model.eventStart = null
        this.model.eventTimezone = null
      }
      if (this.hF.enabled) {
        this.model.heatModel = {
          max: this.hF.max,
          baseline: this.hF.baseline
        }
      } else {
        this.model.heatModel = null
      }
      this.model.waypointDelay = string2sec(this.model.waypointDelayF)
      let p = {}
      if (this.$auth.isAuthenticated()) {
        if (this.model._id) {
          p = await api.updatePlan(this.model._id, this.model)
          this.$ga.event('Plan', 'edit',
            this.course.public ? this.course.name : 'private'
          )
        } else {
          this.model._course = this.course._id
          p = await api.createPlan(this.model)
          this.$ga.event('Plan', 'create',
            this.course.public ? this.course.name : 'private'
          )
          if (String(p._user._id) !== String(this.course._user)) {
            this.newPlanToastMsg = `View, edit, and add plans for "${this.course.name}" next time you log in by selecting "My Courses" in the top menu.`
            this.$refs['toast-new-plan'].show()
          }
        }
      } else {
        p = { ...this.model }
        this.newPlanToastMsg = `Login or Signup to ultraPacer to save or share your new plan for "${this.course.name}".`
        this.$refs['toast-new-plan'].show()
        this.$ga.event('Plan', 'temporary',
          this.course.public ? this.course.name : 'private'
        )
      }
      await this.$emit('refresh', p, () => {
        this.$status.processing = false
        this.clear()
        this.$refs.modal.hide()
      })
    },
    clear () {
      this.model = Object.assign({}, this.defaults)
    },
    checkTargetFormat (val) {
      this.validateTime(this.$refs.planformtimeinput, val)
    },
    async remove () {
      this.$emit('delete', this.model, async (err) => {
        if (!err) {
          this.clear()
          this.$refs.modal.hide()
        }
      })
    },
    validateTime (el, val, max1 = null) {
      let pass = true
      let ph = ''
      if (el.required || val.length) {
        if (el.hasOwnProperty._props !== undefined) {
          ph = el._props.placeholder
        } else {
          ph = el.placeholder
        }
        if (val.length === ph.length) {
          const arr = val.split(':')
          for (let i = arr.length - 1; i > 0; i--) {
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
        el.setCustomValidity(`Enter time as "${ph}"`)
      }
    },
    format_hhmm (value, event) {
      let v = value
      if (value.length && value.indexOf(':') === -1) {
        if (value.length === 1) {
          v = `0${value}:00`
        } else if (value.length === 2) {
          v = `${value}:00`
        } else if (value.length === 3) {
          const s = `0${value}`
          v = s.slice(0, 2) + ':' + s.slice(2)
        } else if (value.length === 4) {
          v = value.slice(0, 2) + ':' + value.slice(2)
        }
      }
      this.validateTime(event.target, v, 24)
      return v
    },
    customStartDefaults: function (val) {
      const dt = this.course.eventStart || 0
      const tz = this.course.eventTimezone || moment.tz.guess()
      this.moment = moment(dt).tz(tz)
    },
    toggleTips () {
      this.showTips = !this.showTips
    }
  }
}
</script>
