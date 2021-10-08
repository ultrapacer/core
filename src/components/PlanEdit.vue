<template>
  <div>
    <b-modal
      ref="modal"
      centered
      :title="(model._id ? 'Edit' : 'New') + ' Plan'"
      hide-header-close
      :no-close-on-esc="$status.processing"
      :no-close-on-backdrop="$status.processing"
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
        >
          <b-form-input
            v-model="model.name"
            type="text"
            required
          />
        </b-input-group>
        <form-tip v-if="showTips">
          Required: title for this plan; for example "A goal" or "Qualify" or "24-hour finish".
        </form-tip>
        <b-input-group
          prepend="Pacing Method"
          class="mt-1"
        >
          <b-form-select
            v-model="model.pacingMethod"
            type="number"
            :options="pacingMethods"
            required
          />
        </b-input-group>
        <form-tip v-if="showTips">
          Required: pacing method for this plan; see Docs.
        </form-tip>
        <b-input-group
          :prepend="targetLabel"
          class="mt-1"
        >
          <b-form-input
            ref="planformtimeinput"
            v-model="model.pacingTargetF"
            v-mask="targetMask"
            type="text"
            min="0"
            :placeholder="targetPlaceholder"
            required
            @change="checkTargetFormat"
          />
        </b-input-group>
        <form-tip v-if="showTips">
          Required: {{ targetPopover }}
        </form-tip>
        <b-input-group
          prepend="Aid Station Delay"
          class="mt-1"
        >
          <b-form-input
            v-model="model.waypointDelayF"
            v-mask="'##:##'"
            type="text"
            min="0"
            placeholder="mm:ss"
            :formatter="format_hhmm"
            lazy-formatter
            required
          />
        </b-input-group>
        <form-tip v-if="showTips">
          Optional: typical aid station delay or time spent at each aid station. Also
          applies to water sources. Unique delays for specific waypoints may be set in the
          Waypoints tab.
        </form-tip>
        <b-form-group
          v-if="Boolean(course.eventStart)"
          class="mt-1 mb-0"
        >
          <b-form-radio
            v-model="customStart"
            :value="false"
            @input="customStartDefaults"
          >
            Use course start (<b>{{ course.eventStart | datetime(course.eventTimezone) }}</b>), or
          </b-form-radio>
          <b-form-radio
            v-model="customStart"
            :value="true"
            @input="customStartDefaults"
          >
            Use custom start<span v-if="customStart">, defined below:</span>
          </b-form-radio>
          <form-tip v-if="showTips">
            Optional: specify a different date/time for this Plan.
          </form-tip>
        </b-form-group>
        <date-time-input
          v-if="customStart || !Boolean(course.eventStart)"
          v-model="moment"
          :class="(Boolean(course.eventStart)) ? 'pl-3' : ''"
          :show-tips="showTips"
        >
          <template #date-tip>
            Optional: start date of your activity; many pacing factors will only be applied if a date and time are specified.
          </template>
        </date-time-input>
        <b-form-checkbox
          v-model="enableDrift"
          :value="true"
          class="mt-1"
          :unchecked-value="false"
        >
          Apply pace drift
        </b-form-checkbox>
        <form-tip v-if="showTips && !enableDrift">
          Optional: enable to add a linear change in speed throughout the race.
        </form-tip>
        <drift-input
          v-if="enableDrift"
          v-model="model.drift"
          class="mt-1 pl-3"
          :show-tips="showTips"
          :course-distance="course.dist"
        />
        <b-form-group
          v-if="Boolean(course.eventStart) || (moment !== null && Number(moment.format('YYYY') > 1970))"
          class="mb-0"
        >
          <b-form-checkbox
            v-model="enableHeat"
            :value="true"
            class="mt-1"
            :unchecked-value="false"
          >
            Apply heat factor
          </b-form-checkbox>
          <form-tip v-if="showTips && !enableHeat">
            Optional: pace modifier for heat and sun exposure. Requires date
            and time to be specified.
          </form-tip>
          <heat-input
            v-if="enableHeat"
            v-model="model.heatModel"
            class="mt-1 pl-3"
            :show-tips="showTips"
            :sun="event.sun"
          />
        </b-form-group>
        <b-input-group
          prepend="Notes"
          class="mt-1"
        >
          <b-form-textarea
            v-model="model.description"
            rows="2"
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
      {{ newPlanToastMsg }}
    </b-toast>
  </div>
</template>

<script>
import api from '@/api'
import moment from 'moment-timezone'
import { sec2string, string2sec } from '../util/time'
import DateTimeInput from '../forms/DateTimeInput'
import DriftInput from '../forms/DriftInput'
import FormTip from '../forms/FormTip'
import HeatInput from '../forms/HeatInput'
import HelpDoc from '@/docs/plan.md'
export default {
  components: {
    DateTimeInput,
    DriftInput,
    FormTip,
    HeatInput,
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
    },
    event: {
      type: Object,
      default: () => { return {} }
    }
  },
  data () {
    return {
      defaults: {
        pacingMethod: 'time',
        waypointDelay: 120,
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
      customStart: false,
      enableDrift: false,
      enableHeat: true,
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
        return `${'h'.repeat(this.hoursDigits)}:mm:ss`
      }
    },
    targetMask: function () {
      if (
        this.model.pacingMethod === 'pace' ||
        this.model.pacingMethod === 'np'
      ) {
        return '##:##'
      } else {
        return `${'#'.repeat(this.hoursDigits)}:##:##`
      }
    },
    targetPopover: function () {
      return `${this.targetLabel}: enter target as ${this.targetPlaceholder}`
    },
    hoursDigits: function () {
      // for courses longer than 250 km, hours field takes up to 3 digits
      return this.course.dist > 250 ? 3 : 2
    }
  },
  watch: {
    'course.eventStart': function (v) {
      // because course.eventStart isn't always ready at form show
      this.customStart = !v
    },
    enableDrift: function (val) {
      if (!val) this.model.drift = null
    },
    enableHeat: function (val) {
      if (!val) this.model.heatModel = null
    }
  },
  methods: {
    async show (plan) {
      this.showTips = false
      this.moment = null

      // create new model instance
      this.model = { _course: this.course._id, ...this.defaults }

      // if plan is passed, copy over desired fields:
      if (typeof (plan) !== 'undefined') {
        const fields = [
          '_id', 'name', 'description', 'pacingMethod', 'pacingTarget',
          'drift', 'heatModel', 'waypointDelay', 'eventStart', 'eventTimezone'
        ]
        fields.forEach(f => { if (plan[f]) this.model[f] = plan[f] })
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
          this.model.pacingTargetF = sec2string(s, `${'h'.repeat(this.hoursDigits)}:mm:ss`)
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
      this.enableHeat = Boolean(this.model.heatModel !== null && this.event.sun)
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
      try {
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
        this.model.waypointDelay = string2sec(this.model.waypointDelayF)

        let p = {}
        if (this.$auth.isAuthenticated()) {
          if (this.model._id) {
            await api.updatePlan(this.model._id, this.model)
            p._id = this.model._id
            this.$gtage(this.$gtag, 'Plan', 'edit',
              this.course.public ? this.course.name : 'private'
            )
          } else {
            p = await api.createPlan(this.model)
            this.$gtage(this.$gtag, 'Plan', 'create',
              this.course.public ? this.course.name : 'private'
            )
            if (String(p._user._id) !== String(this.course._user)) {
              this.newPlanToastMsg = `View, edit, and add plans for "${this.course.name}" next time you log in by selecting "My Courses" in the top menu.`
              this.$refs['toast-new-plan'].show()
            }
          }
        } else {
          p = JSON.parse(JSON.stringify(this.model))
          this.newPlanToastMsg = `Login or Signup to ultraPacer to save or share your new plan for "${this.course.name}".`
          this.$refs['toast-new-plan'].show()
          this.$gtage(this.$gtag, 'Plan', 'temporary',
            this.course.public ? this.course.name : 'private'
          )
        }
        await this.$emit('refresh', p, () => {
          this.$status.processing = false
          this.clear()
          this.$refs.modal.hide()
        })
      } catch (error) {
        this.$status.processing = false
        this.$error.handle(this.$gtag, error, 'PlanEdit|save')
      }
    },
    clear () {
      this.enableDrift = false
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
