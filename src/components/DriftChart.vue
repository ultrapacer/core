<template>
  <plan-chart
    v-if="chartData.datasets"
    ref="chart"
    :chart-data="chartData"
    :options="chartOptions"
    :width="350"
    :height="100"
  />
</template>

<script>
import PlanChart from './PlanChart.js'
import { adjust } from '../../core/driftFactor'
export default {
  components: {
    PlanChart
  },
  props: {
    drift: {
      type: [Array, Number],
      default: 0
    },
    courseDistance: {
      type: Number,
      required: true
    }
  },
  computed: {
    stepSize: function () {
      return Number(this.$units.distf(this.courseDistance)) > 10 ? 5 : 1
    },
    chartOptions: function () {
      const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          xAxes: [{
            type: 'linear',
            position: 'bottom',
            ticks: {
              stepSize: this.stepSize,
              callback: (value, index, values) => {
                if (index === values.length - 1) {
                  return this.$units.dist
                } else if (
                  value % this.stepSize === 0 &&
                  values[values.length - 1] - value > 0.8 * this.stepSize
                ) {
                  return value
                } else {
                  return ''
                }
              },
              max: Number(this.$units.distf(this.courseDistance))
            }
          }],
          yAxes: [{
            display: true,
            position: 'left',
            id: 'y-axis-1',
            ticks: {
              callback: function (value, index, values) {
                return value + '%'
              }
            }
          }]
        },
        tooltips: {
          enabled: false
        },
        legend: {
          display: false
        }
      }
      return chartOptions
    },
    chartData: function () {
      const d = [{ x: 0, y: 0 }]
      if (!Array.isArray(this.drift)) {
        d[0].y = -this.drift / 2
        d.push({ x: Number(this.$units.distf(this.courseDistance)), y: this.drift / 2 })
      } else if (this.drift) {
        let arr = []
        arr = this.drift.map(v => { return { ...v } })
        arr = arr.filter(v => !isNaN(v.onset) && !isNaN(v.value))
        let last = -adjust(arr, this.courseDistance)
        d[0].y = last
        arr.forEach(i => {
          d.push({ x: this.$units.distf(i.onset), y: last })
          if (i.type === 'step') {
            d.push({ x: this.$units.distf(i.onset), y: last + i.value })
          }
          last += i.value
        })
        d.push({ x: Number(this.$units.distf(this.courseDistance)), y: last })
      }
      return {
        datasets: [
          {
            data: d,
            tension: 0,
            borderColor: this.$colors.brown2,
            backgroundColor: window.Color(this.$colors.brown2).alpha(0.5).rgbString()
          }
        ]
      }
    }
  },
  mounted () {
    this.$refs.chart.update()
  }
}
</script>
