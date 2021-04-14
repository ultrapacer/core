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
import { adjust } from '../util/driftFactor.js'
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
  data () {
    return {
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          xAxes: [{
            type: 'linear',
            position: 'bottom',
            ticks: {
              stepSize: 5,
              callback: function (value, index, values) {
                if (value % 5 === 0) {
                  return value
                } else {
                  return ''
                }
              },
              max: this.$units.distf(this.courseDistance) + 0.01
            }
          }],
          yAxes: [{
            display: true,
            position: 'left',
            id: 'y-axis-1'
          }]
        },
        tooltips: {
          enabled: false
        },
        legend: {
          display: false
        }
      }
    }
  },
  computed: {
    chartData: function () {
      const d = [{ x: 0, y: 0 }]
      if (!Array.isArray(this.drift)) {
        d[0].y = -this.drift / 2
        d.push({ x: this.$units.distf(this.courseDistance), y: this.drift / 2 })
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
        d.push({ x: this.$units.distf(this.courseDistance), y: last })
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
