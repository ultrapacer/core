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
        <b-input-group
          prepend="Name"
          class="mb-2"
          size="sm"
          v-b-popover.hover.bottomright.d250.v-info="
            'Name: title for this plan; for example \'A goal\' or \'Qualify\' or \'24-hour finish\'.'
          "
        >
          <b-form-input type="text" v-model="model.name" size="sm" required>
          </b-form-input>
        </b-input-group>
        <b-input-group
          prepend="Pacing method"
          class="mb-2"
          size="sm"
          v-b-popover.hover.bottomright.d250.v-info="
            'Pacing methods:\n - Finish time: computes splits to complete the event at the specified elapsed time.\n - Average pace: computes splits to make an average overall pace.\n - Normalized pace: computes splits for a pace normalized for grade, altitude, heat, and terrain.'
          "
        >
          <b-form-select
            type="number"
            v-model="model.pacingMethod"
            :options="pacingMethods"
             size="sm"
            required
           >
          </b-form-select>
        </b-input-group>
        <b-input-group
          v-bind:prepend="targetLabel"
          v-bind:append="targetAppend"
          class="mb-2"
          size="sm"
          v-b-popover.hover.bottomright.d250.v-info="targetPopover"
        >
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
        </b-input-group>

        <b-form-checkbox
          v-if="Boolean(course.eventStart)"
          v-model="customStart"
          @change="customStartDefaults"
          size="sm"
          class="mb-2"
          :value="true"
          :unchecked-value="false"
          v-b-popover.hover.bottomright.d250.v-info="
            'If unchecked, defined your own start date and time, below'
          "
        >
          Custom start time [override {{ course.eventStart | datetime(course.eventTimezone) }}]
        </b-form-checkbox>
        <b-form-group v-if="customStart" class="mb-0" :style="(course.eventStart) ? 'padding-left: 1em' : ''">
          <b-input-group
            prepend="Event Date"
            class="mb-2"
            size="sm"
          >
            <b-form-input
              type="date"
              v-model="eventDate"
              :required="Boolean(eventDate)"
            >
            </b-form-input>
          </b-input-group>
          <b-input-group
            prepend="Start Time"
            class="mb-2"
            size="sm"
          >
            <b-form-input
              type="time"
              v-model="eventTime"
              :required="Boolean(eventDate)"
            >
            </b-form-input>
          </b-input-group>
          <b-input-group
            prepend="Timezone"
            class="mb-2"
            size="sm"
          >
            <b-form-select
              :options="timezones"
              v-model="model.eventTimezone"
              :required="Boolean(eventTime)"
            >
            </b-form-select>
          </b-input-group>
        </b-form-group>

        <b-input-group
          prepend="Aid station delay"
          class="mb-2"
          size="sm"
          v-b-popover.hover.bottomright.d250.v-info="
            'Aid station delay: time spent at each aid station.'
          "
        >
          <b-form-input
            type="text"
            v-model="model.waypointDelayF"
            min="0"
            v-mask="'##:##'"
            placeholder="mm:ss"
            :formatter="format_hhmm"
            lazy-formatter
            size="sm"
            required
          ></b-form-input>
        </b-input-group>
        <b-input-group
            prepend="Pace drift"
            append=" %"
            class="mb-2"
            size="sm"
            v-b-popover.hover.bottomright.d250.v-info="
              'Pace drift: linear decrease in speed throughout race. For example, 10% means you begin the race 10% faster than you finish.'
            "
          >
          <b-form-input type="text" v-model="model.drift" size="sm" required>
          </b-form-input>
        </b-input-group>
        <b-form-checkbox
          v-model="hF.enabled"
          :value="true"
            size="sm"
            class="mb-2"
          :unchecked-value="false"
          v-b-popover.hover.bottomright.d250.v-info="
            'Heat factor: pace modifier for heat and sun exposure.\nNOTE: Using a heat factor slows down the calculation time of this tool.'
          "
        >
          Apply heat factor
        </b-form-checkbox>
        <b-form-group v-if="hF.enabled" class="mb-0" style="padding-left: 1em">
          <b-input-group prepend="Baseline" append=" %" class="mb-2" size="sm"
            v-b-popover.hover.bottomright.d250.v-info="
              'Baseline heat factor: pace modifier for heat; baseline factor is consistent throughout the whole event.'
            "
          >
            <b-form-input v-model="hF.baseline" class="mb-n2">
            </b-form-input>
          </b-input-group>
          <b-input-group prepend="Maximum" append="%" class="mb-2" size="sm"
            v-b-popover.hover.bottomright.d250.v-info="
              'Maximum heat factor: pace modifier for heat; maximum heat factor at the hottest part of the day, increasing from baseline 30 minutes after sunrise and returning to baseline 2 hours after sunset.'
            "
          >
            <b-form-input v-model="hF.max" class="mb-n2">
            </b-form-input>
          </b-input-group>
        </b-form-group>
        <b-input-group prepend="Notes" class="mb-2" size="sm">
          <b-form-textarea rows="4" v-model="model.description" size="sm">
          </b-form-textarea>
        </b-input-group>
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
import moment from 'moment-timezone'
import {sec2string, string2sec} from '../util/time'
export default {
  props: ['course', 'units'],
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
        { value: 'time', text: 'Finish time' },
        { value: 'pace', text: 'Average pace' },
        { value: 'np', text: 'Normalized pace' }
      ],
      saving: false,
      deleting: false,
      hF: {
        enabled: false,
        baseline: '',
        max: ''
      },
      customStart: false,
      eventDate: null,
      eventTime: null,
      timezones: moment.tz.names()
    }
  },
  computed: {
    targetLabel: function () {
      for (var i = 0; i < this.pacingMethods.length; i++) {
        if (this.pacingMethods[i].value === this.model.pacingMethod) {
          return this.pacingMethods[i].text
        }
      }
    },
    targetAppend: function () {
      var str = 'elapsed'
      if (
        this.model.pacingMethod === 'pace' ||
        this.model.pacingMethod === 'np'
      ) {
        str = `/${this.units.dist}`
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
        let m = moment(this.model.eventStart).tz(this.model.eventTimezone)
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
      this.model.pacingTarget = string2sec(this.model.pacingTargetF)
      if (
        this.model.pacingMethod === 'pace' ||
        this.model.pacingMethod === 'np'
      ) {
        this.model.pacingTarget = this.model.pacingTarget * this.units.distScale
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
      var p = {}
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
          this.$bvToast.toast(`View, edit, and add plans for "${this.course.name}" next time you log in by selecting "Courses" in the top menu.`, {
            title: `New plan for "${this.course.name}!`,
            toaster: 'b-toaster-bottom-right',
            solid: true,
            variant: 'info',
            'auto-hide-delay': 5000
          })
        }
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
        var ph = ''
        if (el.hasOwnProperty('_props')) {
          ph = el._props.placeholder
        } else {
          ph = el.placeholder
        }
        if (val.length === ph.length) {
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
          let s = `0${value}`
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
        let m = moment(this.course.eventStart).tz(this.course.eventTimezone)
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
  },
  filters: {
    datetime: function (val, tz) {
      let m = moment(val).tz(tz)
      return m.format('M/D/YYYY | h:mm A')
    }
  }
}
</script>
