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
            :options="Object.keys(pacingMethods).map(k=>{return {value:k, text:pacingMethods[k].text}})"
            required
            @change="pacingMethodChange"
          />
        </b-input-group>
        <form-tip v-if="showTips">
          Required: pacing method for this plan; see Docs.
        </form-tip>
        <b-input-group
          :prepend="pacingMethods[model.pacingMethod].text"
          :append="pacingMethods[model.pacingMethod].type==='pace'?`[/${$units.dist}]`:''"
          class="mt-1"
        >
          <time-input
            v-model="model.pacingTarget"
            :format="pacingMethods[model.pacingMethod].format"
            :scale="pacingMethods[model.pacingMethod].type==='pace' ? 1/ $units.distScale : 1"
            required
          />
        </b-input-group>
        <form-tip v-if="showTips">
          Required: enter {{ pacingMethods[model.pacingMethod].text }} as
          {{ pacingMethods[model.pacingMethod].format }}
        </form-tip>
        <b-input-group
          prepend="Aid Station Delay"
          class="mt-1"
        >
          <time-input
            v-model="model.waypointDelay"
            format="mm:ss"
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
import DateTimeInput from '../forms/DateTimeInput'
import DriftInput from '../forms/DriftInput'
import FormTip from '../forms/FormTip'
import HeatInput from '../forms/HeatInput'
import TimeInput from '../forms/TimeInput'
import HelpDoc from '@/docs/plan.md'
export default {
  components: {
    DateTimeInput,
    DriftInput,
    FormTip,
    HeatInput,
    HelpDoc,
    TimeInput
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
        heatModel: null,
        pacingTarget: null
      },
      model: {
        pacingMethod: 'time',
        pacingTarget: null
      },
      moment: null,
      pacingMethods: {
        time: {
          text: 'Elapsed Time',
          type: 'time',
          format: `${'h'.repeat(this.course.dist > 250 ? 3 : 2)}:mm:ss`
        },
        pace: { text: 'Average Pace', type: 'pace', format: 'mm:ss' },
        np: { text: 'Normalized Pace', type: 'pace', format: 'mm:ss' }
      },
      customStart: false,
      enableDrift: false,
      enableHeat: true,
      showTips: false,
      timezones: moment.tz.names(),
      newPlanToastMsg: ''
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
            if (!this.$course.owner) {
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
        this.$error.handle(error, 'PlanEdit|save')
      }
    },
    clear () {
      this.enableDrift = false
      this.model = Object.assign({}, this.defaults)
    },
    async remove () {
      this.$emit('delete', this.model, async (err) => {
        if (!err) {
          this.clear()
          this.$refs.modal.hide()
        }
      })
    },
    customStartDefaults: function (val) {
      const dt = this.course.eventStart || 0
      const tz = this.course.eventTimezone || moment.tz.guess()
      this.moment = moment(dt).tz(tz)
    },
    toggleTips () {
      this.showTips = !this.showTips
    },
    pacingMethodChange () {
      // clear out target when method changes:
      this.$nextTick(() => { this.$set(this.model, 'pacingTarget', null) })
    }
  }
}
</script>
