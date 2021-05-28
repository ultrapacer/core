<template>
  <b-form-group class="mb-0">
    <b-input-group
      prepend="Event Date"
      class="mt-1"
    >
      <b-form-input
        v-model="date"
        type="date"
        :required="Boolean(date)"
        @change="update"
      />
    </b-input-group>
    <form-tip v-if="showTips">
      <slot name="date-tip" />
    </form-tip>
    <div v-if="Boolean(date)">
      <b-input-group
        prepend="Start Time"
        class="mt-1"
      >
        <b-form-input
          v-model="time"
          type="time"
          :required="Boolean(date)"
          @change="update"
        />
      </b-input-group>
      <form-tip v-if="showTips">
        Required if a date is entered; start time of activity.
      </form-tip>
    </div>
    <b-input-group
      prepend="Timezone"
      class="mt-1"
    >
      <b-form-select
        v-model="zone"
        :options="timezones"
        required
        @input="update"
      />
    </b-input-group>
    <form-tip v-if="showTips">
      Required: timezone for event/course.
    </form-tip>
  </b-form-group>
</template>

<script>
import moment from 'moment-timezone'
import FormTip from './FormTip'
export default {
  components: {
    FormTip
  },
  props: {
    value: {
      type: Object,
      required: true
    },
    showTips: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      date: null,
      time: null,
      zone: null,
      timezones: moment.tz.names()
    }
  },
  watch: {
    value: function (v) {
      this.setDateTime(v)
    }
  },
  mounted () {
    this.setDateTime(this.value)
  },
  methods: {
    setDateTime (v) {
      if (v) {
        this.zone = v.tz()
        if (Number(v.format('YYYY') > 1970)) {
          this.date = v.format('YYYY-MM-DD')
          this.time = v.format('kk:mm')
        }
      } else {
        this.date = null
        this.time = null
        this.zone = null
      }
    },
    update () {
      const dt = (this.date && this.time) ? `${this.date} ${this.time}` : 0
      this.$emit(
        'input',
        moment.tz(dt, this.zone)
      )
    }
  }
}
</script>
