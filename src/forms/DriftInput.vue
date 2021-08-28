<template>
  <div>
    <selectable-label-input
      v-model="driftModel"
      :options="driftModels"
      @input="update"
    >
      <b-input-group
        v-if="driftModel===1"
        append="%"
      >
        <b-form-input
          v-model="basic"
          type="number"
          required
          step="0.01"
          @change="basic = Number(basic) || 0; update();"
        />
      </b-input-group>
      <div style="width: 100%">
        <b-table
          v-if="driftModel===2"
          class="tinytable"
          :items="advanced"
          :fields="fields"
          fixed
          small
        >
          <template #cell(onset)="row">
            <b-form-input
              v-model="row.item.onset"
              type="number"
              required
              :min="onsetMin(row.index)"
              :max="onsetMax(row.index)"
              step="0.01"
              @change="onsetChange(row.item.onset, row.index)"
            />
          </template>
          <template #cell(value)="row">
            <b-form-input
              v-model="row.item.value"
              type="number"
              required
              step="0.01"
              @change="row.item.value = Number(row.item.value) || 0; update()"
            />
          </template>
          <template #cell(type)="row">
            <b-form-select
              v-model="row.item.type"
              class="form-control"
              :options="types"
              required
              @change="update"
            />
          </template>
          <template #cell(action)="row">
            <div
              class="ml-2"
              style="text-align:left"
            >
              <b-button
                v-if="advanced.length > 1"
                class="mr-1"
                @click="delRow(row.index)"
              >
                <v-icon name="trash" />
              </b-button>
              <b-button
                v-if="advanced.length -1 === row.index"
                variant="success"
                class="mr-1"
                @click="advanced.push({type: 'linear'})"
              >
                <v-icon name="plus" />
              </b-button>
            </div>
          </template>
        </b-table>
        <div
          v-if="driftModel===2"
          style="text-align: right"
        />
        <div style="height:100px; width: 100%">
          <drift-chart
            ref="chart"
            :drift="value"
            :course-distance="courseDistance"
            class="mt-1"
          />
        </div>
      </div>
    </selectable-label-input>
    <form-tip v-if="showTips && driftModel===1">
      Optional: linear change in speed throughout race. For
      example, 10% means you begin the race 10% faster than you finish.
      Negative value for negative split.
    </form-tip>
    <form-tip v-if="showTips && driftModel===2">
      Optional: change(s) in speed throughout race, with each change beginning
      at the distance in the "At" column. A step change happens immediately;
      whereas a linear change gradually takes effect until the next breakpoint.
      See the docs for more help.
    </form-tip>
  </div>
</template>

<script>
import DriftChart from '../components/DriftChart.vue'
import FormTip from './FormTip'
import SelectableLabelInput from './SelectableLabelInput'
import { adjust } from '../../core/driftFactor'
export default {
  components: {
    DriftChart,
    FormTip,
    SelectableLabelInput
  },
  props: {
    value: {
      type: [Array, Number],
      default: 0
    },
    showTips: {
      type: Boolean,
      default: false
    },
    courseDistance: {
      type: Number,
      required: true
    }
  },
  data () {
    return {
      basic: 0,
      driftModel: 1,
      driftModels: [
        { value: 1, text: 'Basic' },
        { value: 2, text: 'Adv.' }
      ],
      types: [
        { value: 'linear', text: 'Linear' },
        { value: 'step', text: 'Step' }
      ],
      advanced: [],
      fields: [
        {
          key: 'onset',
          label: `At [${this.$units.dist}]`
        },
        {
          key: 'value',
          label: 'Change [%]'
        },
        {
          key: 'type',
          label: 'Model'
        },
        {
          key: 'action',
          label: '',
          tdClass: 'actionButtonColumn'
        }
      ]
    }
  },
  mounted () {
    this.setDrift(this.value)
  },
  methods: {
    delRow (i) {
      this.advanced.splice(i, 1)
      this.update()
    },
    onsetChange (v, i) {
      // make sure its a number:
      let val = Number(v) || 0

      // make sure its within min/max allowed
      val = Math.max(val, this.onsetMin(i))
      val = Math.min(val, this.onsetMax(i))
      this.advanced[i].onset = Number(val.toFixed(2))

      // refresh chart
      this.update()
    },
    onsetMin (i) {
      // >= 0 and less than the next row onset
      return i > 0 ? this.advanced[i - 1].onset + 0.01 : 0
    },
    onsetMax (i) {
      // less than the course distance and the next row onset
      return i < this.advanced.length - 1
        ? this.advanced[i + 1].onset - 0.01
        : Number(this.$units.distf(this.courseDistance, 2))
    },
    setDrift (v) {
      // initialie the value of drift into either basic or array
      this.driftModel = Array.isArray(v) ? 2 : 1
      if (this.driftModel === 1) {
        this.basic = Number(v) || 0
        this.advanced = [{
          onset: 0,
          value: this.basic,
          type: 'linear'
        }]
      } else {
        this.driftModel = 2
        this.advanced = v.map(x => {
          const y = { ...x }
          y.onset = Number(this.$units.distf(y.onset, 2))
          return y
        })
        this.basic = Number((2 * adjust(v, this.courseDistance)).toFixed(2))
      }
    },
    update () {
      // update returned value of drift model
      let v
      if (this.driftModel === 1) {
        v = Number(this.basic) || 0
        this.advanced = [{
          onset: 0,
          value: v,
          type: 'linear'
        }]
      } else {
        v = this.advanced.map(x => {
          const y = { ...x }
          y.onset = Number(x.onset) / this.$units.distScale
          y.value = Number(x.value)
          return y
        })
        v.sort((a, b) =>
          a.onset - b.onset
        )
        this.basic = Number((2 * adjust(v, this.courseDistance)).toFixed(2))
      }
      this.$emit(
        'input',
        v
      )
    }
  }
}
</script>

<style>
  .tinytable td, .tinytable th{
    padding: 0 !important;
  }
</style>
