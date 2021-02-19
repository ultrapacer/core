<template>
  <div>
    <b-modal
      ref="modal"
      centered
      :title="(model._id ? 'Edit' : 'New') + ' Plan'"
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
          <help-button
            message="Name: title for this plan; for example 'A goal' or 'Qualify' or '24-hour finish'.'"
          />
        </b-input-group>
        <b-input-group
          prepend="Pacing method"
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
          <help-button
            :message="'Pacing methods:\n - Elapsed time: computes splits to complete the event at the specified elapsed time.\n - Average pace: computes splits to make an average overall pace.\n - Normalized pace: computes splits for a pace normalized for grade, altitude, heat, and terrain.'"
          />
        </b-input-group>
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
          <help-button :message="targetPopover" />
        </b-input-group>

        <div v-if="!Boolean(course.eventStart)">
          <b-form-group
            v-if="customStart"
            :class="(course.eventStart) ? 'mb-0 pl-3' : 'mb-0'"
          >
            <b-input-group
              prepend="Event Date"
              class="mb-2"
              size="sm"
            >
              <b-form-input
                v-model="eventDate"
                type="date"
                :required="Boolean(eventDate) || hF.enabled"
              />
            </b-input-group>
            <b-input-group
              prepend="Start Time"
              class="mb-2"
              size="sm"
            >
              <b-form-input
                v-model="eventTime"
                type="time"
                :required="Boolean(eventDate) || hF.enabled"
              />
            </b-input-group>
            <b-input-group
              prepend="Timezone"
              class="mb-2"
              size="sm"
            >
              <b-form-select
                v-model="model.eventTimezone"
                :options="timezones"
                :required="Boolean(eventTime) || hF.enabled"
              />
            </b-input-group>
          </b-form-group>
        </div>

        <b-input-group
          prepend="Aid station delay"
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
          <help-button
            message="Aid station delay: time spent at each aid station."
          />
        </b-input-group>
        <b-input-group
          prepend="Pace drift [%]"
          class="mb-2"
          size="sm"
        >
          <b-form-input
            v-model="model.drift"
            type="text"
            size="sm"
            required
          />
          <help-button
            message="Pace drift: linear decrease in speed throughout race. For example, 10% means you begin the race 10% faster than you finish."
          />
        </b-input-group>
        <b-form-checkbox
          v-model="hF.enabled"
          v-b-popover.hover.bottomright.d250.v-info="{
            customClass: isMobile ? 'd-none' : '',
            content: 'Heat factor: pace modifier for heat and sun exposure.'
          }"
          :value="true"
          size="sm"
          class="mb-2"
          :unchecked-value="false"
        >
          Apply heat factor
        </b-form-checkbox>
        <b-form-group
          v-if="hF.enabled"
          class="mb-0"
          style="padding-left: 1em"
        >
          <b-input-group
            prepend="Baseline [%]"
            class="mb-2"
            size="sm"
          >
            <b-form-input
              v-model="hF.baseline"
              class="mb-n2"
            />
            <help-button
              message="Baseline heat factor: pace modifier for heat; baseline factor is consistent throughout the whole event."
            />
          </b-input-group>
          <b-input-group
            prepend="Maximum [%]"
            class="mb-2"
            size="sm"
          >
            <b-form-input
              v-model="hF.max"
              class="mb-n2"
            />
            <help-button
              message="Maximum heat factor: pace modifier for heat; maximum heat factor at the hottest part of the day, increasing from baseline 30 minutes after sunrise and returning to baseline 2 hours after sunset."
            />
          </b-input-group>
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

        <div v-if="Boolean(course.eventStart)">
          <b-form-radio
            v-if="Boolean(course.eventStart)"
            v-model="customStart"
            size="sm"
            class="mb-0"
            :value="false"
            @change="customStartDefaults"
          >
            Use course start (<b>{{ course.eventStart | datetime(course.eventTimezone) }}</b>), or
          </b-form-radio>
          <b-form-radio
            v-if="Boolean(course.eventStart)"
            v-model="customStart"
            size="sm"
            class="mb-0"
            :value="true"
            @change="customStartDefaults"
          >
            Use custom start<span v-if="customStart">, defined below:</span>
          </b-form-radio>
          <b-form-group
            v-if="customStart"
            :class="(course.eventStart) ? 'mb-0 pl-3' : 'mb-0'"
          >
            <b-input-group
              prepend="Event Date"
              class="mb-2"
              size="sm"
            >
              <b-form-input
                v-model="eventDate"
                type="date"
                :required="Boolean(eventDate) || hF.enabled"
              />
            </b-input-group>
            <b-input-group
              prepend="Start Time"
              class="mb-2"
              size="sm"
            >
              <b-form-input
                v-model="eventTime"
                type="time"
                :required="Boolean(eventDate) || hF.enabled"
              />
            </b-input-group>
            <b-input-group
              prepend="Timezone"
              class="mb-2"
              size="sm"
            >
              <b-form-select
                v-model="model.eventTimezone"
                :options="timezones"
                :required="Boolean(eventTime) || hF.enabled"
              />
            </b-input-group>
          </b-form-group>
        </div>
      </form>
      <template #modal-footer="{ ok, cancel }">
        <div
          v-if="model._id"
          style="text-align: left; flex: auto"
        >
          <b-button
            size="sm"
            variant="danger"
            @click="remove"
          >
            Delete
          </b-button>
        </div>
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
          {{ $auth.isAuthenticated() ? 'Save' : 'Generate' }} Plan
        </b-button>
      </template>
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
import HelpButton from './HelpButton'
export default {
  components: {
    HelpButton
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
        drift: 0,
        startTime: null,
        heatModel: null,
        eventStart: null,
        eventTimezone: moment.tz.guess()
      },
      model: {},
      pacingMethods: [
        { value: 'time', text: 'Elapsed time' },
        { value: 'pace', text: 'Average pace' },
        { value: 'np', text: 'Normalized pace' }
      ],
      hF: {
        enabled: false,
        baseline: '',
        max: ''
      },
      customStart: false,
      eventDate: null,
      eventTime: null,
      timezones: moment.tz.names(),
      newPlanToastMsg: ''
    }
  },
  computed: {
    isMobile: function () {
      return screen.width < 992
    },
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
    }
  },
  methods: {
    async show (plan) {
      if (typeof (plan) !== 'undefined') {
        this.model = Object.assign({}, plan)
        if (!this.model.eventTimezone) { this.model.eventTimezone = moment.tz.guess() }
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
      if (this.model.eventStart) {
        const m = moment(this.model.eventStart).tz(this.model.eventTimezone)
        this.eventDate = m.format('YYYY-MM-DD')
        this.eventTime = m.format('kk:mm')
        this.customStart = true
      } else {
        this.eventDate = null
        this.eventTime = null
        this.customStart = !this.course.eventStart
      }
      if (this.model.heatModel !== null) {
        this.hF.max = this.model.heatModel.max
        this.hF.baseline = this.model.heatModel.baseline || 0
        this.hF.enabled = true
      } else {
        this.hF.enabled = false
      }
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
      if (this.customStart && this.eventTime && this.eventDate) {
        this.model.eventStart = moment.tz(`${this.eventDate} ${this.eventTime}`, this.model.eventTimezone).toDate()
      } else {
        this.model.eventStart = null
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
      if (val && Boolean(this.course.eventStart)) {
        const m = moment(this.course.eventStart).tz(this.course.eventTimezone)
        this.eventDate = m.format('YYYY-MM-DD')
        this.eventTime = m.format('kk:mm')
        this.model.eventTimezone = this.course.eventTimezone
      } else {
        this.eventDate = null
        this.eventTime = null
        this.model.eventStart = null
        this.model.eventTimezone = moment.tz.guess()
      }
    }
  }
}
</script>
