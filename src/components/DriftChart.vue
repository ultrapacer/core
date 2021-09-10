<template>
  <Chart
    v-if="chartData.datasets"
    ref="chart"
    :data="chartData"
    :options="chartOptions"
    type="line"
    style="width:350px; height:100px"
    :height="100"
  />
</template>

<script>
import Chart from 'vue-chartjs3'
import { adjust } from '../../core/driftFactor'
export default {
  components: {
    Chart
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
          x: {
            type: 'linear',
            position: 'bottom',
            ticks: {
              stepSize: this.stepSize,
              callback: (value, index, values) => {
                if (index === values.length - 1) {
                  return this.$units.dist
                } else if (
                  value % this.stepSize === 0 &&
                  values[values.length - 1].value - value > 0.8 * this.stepSize
                ) {
                  return value
                } else {
                  return ''
                }
              }
            },
            max: Number(this.$units.distf(this.courseDistance))
          },
          'y-axis-1': {
            display: true,
            position: 'left',
            ticks: {
              callback: function (value, index, values) {
                return value + '%'
              }
            }
          }
        },
        tooltips: {
          enabled: false
        },
        plugins: {
          legend: {
            display: false
          },
          crosshair: {
            line: {
              color: this.$colors.red2.hex,
              width: 2
            },
            sync: {
              enabled: true,
              group: 1
            }
          },
          backgroundColorPlugin: false
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
            borderColor: this.$colors.brown2.rgb,
            backgroundColor: this.$colors.brown2.transparentize(),
            fill: 'origin'
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
