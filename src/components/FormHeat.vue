<template>
  <b-input-group
    prepend="Heat"
  >
    <div
      class="form-control input-group"
      style="height: auto"
    >
      <b-input-group
        prepend="Base"
        append="%"
      >
        <b-form-input
          v-model="base"
          class="mb-n2"
          :min="0"
          type="number"
          step="0.1"
          @change="baseChange"
        />
      </b-input-group>
      <form-tip v-if="showTips">
        Optional: pace modifier for heat; baseline factor is consistent
        throughout the whole event. See Docs.
      </form-tip>
      <b-input-group
        prepend="Max"
        append="%"
        class="mt-1"
      >
        <b-form-input
          v-model="max"
          class="mb-n2"
          :min="0"
          type="number"
          step="0.1"
          @change="maxChange"
        />
      </b-input-group>
      <form-tip v-if="showTips">
        Optional: pace modifier for heat; maximum heat factor in addition
        to Baseline above. See Docs.
      </form-tip>

      <div style="height:100px; width: 100%">
        <heat-chart
          ref="chart"
          :heat-model="value"
          :sun="sun"
          class="mt-1"
        />
      </div>
    </div>
  </b-input-group>
</template>

<script>
import { round } from '@/util/math'
import HeatChart from './HeatChart.vue'
import FormTip from './FormTip'
export default {
  components: {
    HeatChart,
    FormTip
  },
  props: {
    value: {
      type: Object,
      default: () => { return null }
    },
    showTips: {
      type: Boolean,
      default: false
    },
    sun: {
      type: Object,
      default: () => { return {} }
    }
  },
  data () {
    return {
      base: 0,
      max: 0
    }
  },
  mounted () {
    this.setHeat(this.value)
  },
  methods: {
    baseChange (v) {
      // make sure its within min/max allowed
      this.base = Number(v) || 0
      this.base = Math.max(0, this.base)
      this.max = Math.max(this.max, this.base)

      // refresh chart
      this.update()
    },
    maxChange (v) {
      // make sure its within min/max allowed
      this.max = Number(v) || this.base
      this.max = Math.max(0, this.max)
      this.base = Math.min(this.max, this.base)

      // refresh chart
      this.update()
    },
    setHeat (v) {
      // initialie the value of drift into either basic or array
      if (v) {
        this.base = v.baseline || 0
        this.max = v.max || this.base
      } else {
        this.base = 0
        this.max = 0
      }
    },
    update () {
      // update returned value of drift model
      let v = null
      if (this.base > 0 || this.max > 0) {
        v = {
          baseline: round(this.base, 1),
          max: round(this.max, 1)
        }
      }
      this.$emit(
        'input',
        v
      )
    }
  }
}
</script>
