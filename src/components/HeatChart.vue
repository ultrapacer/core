<template>
  <plan-chart
    v-if="sun && chartData.datasets"
    ref="chart"
    :chart-data="chartData"
    :options="chartOptions"
    :width="350"
    :height="100"
  />
</template>

<script>
import PlanChart from './PlanChart.js'
export default {
  components: {
    PlanChart
  },
  props: {
    heatModel: {
      type: Object,
      default: () => { return null }
    },
    sun: {
      type: Object,
      default: () => { return null }
    },
    kilometers: {
      type: Array,
      default: () => { return null }
    }
  },
  computed: {
    ps: function () {
      // get distance and tod pairs from kilometer splits
      if (this.kilometers && this.kilometers.length && this.kilometers[0].tod) {
        const p = [{
          loc: 0,
          tod: this.kilometers[0].tod - this.kilometers[0].time
        }]
        this.kilometers.forEach(x => {
          p.push({
            loc: x.end,
            tod: this.kilometers[0].tod + x.elapsed
          })
        })
        return p
      } else {
        return null
      }
    },
    showDistance: function () {
      return Boolean(this.ps && this.ps.length && this.ps[0].tod)
    },
    stepSize: function () {
      if (this.showDistance) {
        return Number(this.$units.distf(this.ps[this.ps.length - 1].loc)) > 10 ? 5 : 1
      } else {
        return 4
      }
    },
    chartOptions: function () {
      const o = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          xAxes: [{
            type: 'linear',
            position: 'bottom',
            label: 'Distance',
            ticks: {
              stepSize: this.stepSize,
              callback: (value, index, values) => {
                if (index === values.length - 1) {
                  return this.showDistance ? this.$units.dist : value + ' hrs'
                } else if (
                  value % this.stepSize === 0 &&
                    values[values.length - 1] - value > 0.8 * this.stepSize
                ) {
                  return value
                } else {
                  return ''
                }
              },
              max: this.showDistance ? Number(this.$units.distf(this.ps[this.ps.length - 1].loc)) : 24
            }
          }],
          yAxes: [{
            display: true,
            position: 'left',
            id: 'y-axis-1',
            ticks: {
              min: 0,
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
      return o
    },
    start: function () {
      return this.$math.round(this.sun.rise, 0) + 1800
    },
    stop: function () {
      return this.$math.round(this.sun.set, 0) + 3600
    },
    model: function () {
      let m = []
      if (this.heatModel) {
        if (this.heatModel.baseline === this.heatModel.max) {
          m = [
            {
              x: 0,
              y: Number(this.heatModel.baseline) || 0
            },
            {
              x: 24 * 3600,
              y: Number(this.heatModel.baseline) || 0
            }
          ]
        } else {
          // set up the heat mode object
          const model = { ...this.heatModel }
          model.start = this.start
          model.stop = this.stop

          // first point of model (midnight)
          m = [
            {
              x: 0,
              y: Number(this.heatModel.baseline) || 0
            },
            {
              x: this.start,
              y: Number(this.heatModel.baseline) || 0
            }
          ]

          // create curve section between start and stop
          for (let i = 1; i < 50; i++) {
            m.push({
              x: (this.start + (i * ((this.stop - this.start) / 50))),
              y: this.$math.round((this.$core.nF.hF(this.start + (i * ((this.stop - this.start) / 50)), model) - 1) * 100, 4)
            })
          }

          // add last point of model (midnight again)
          m.push(
            {
              x: this.stop,
              y: Number(this.heatModel.baseline) || 0
            },
            {
              x: 24 * 3600,
              y: Number(this.heatModel.baseline) || 0
            }
          )
        }
      }
      return m
    },
    modelByDistance: function () {
      let m = []
      if (this.heatModel && this.showDistance) {
        const rollovers = Math.floor(this.ps[this.ps.length - 1].tod / 86400, 1)
        let model2 = this.model
        for (let r = 0; r < rollovers; r++) {
          model2 = [...model2.filter((m, i) => i < model2.length - 1),
            ...this.model.filter((m, i) => i > 0).map((m) => {
              return { x: m.x + 24 * 3600 * (r + 1), y: m.y }
            })
          ]
        }
        const i2 = model2.findIndex(m => m.x > this.ps[this.ps.length - 1].tod)
        model2 = model2.filter((m, i) => i <= i2)

        const locs = this.$math.interpArray(
          this.ps.map(x => { return x.tod }),
          this.ps.map(x => { return x.loc }),
          model2.map(x => { return x.x })
        )
        m = locs.map((x, i) => { return { x: x, y: model2[i].y } })
      }
      return m
    },
    xys: function () {
      if (this.heatModel) {
        if (this.showDistance) {
          // format distance units:
          return this.modelByDistance.map(x => {
            const y = { ...x }
            y.x = this.$units.distf(y.x)
            return y
          })
        } else {
          // (no distance / time of day pairs)
          // format seconds to hours
          return this.model.map(x => {
            const y = { ...x }
            y.x = y.x / 3600
            return y
          })
        }
      } else {
        return []
      }
    },
    radii: function () {
      const min = Math.min(...this.xys.map(x => { return this.$math.round(x.y, 4) }))
      const radii = this.xys.map(x => { return this.$math.round(x.y, 4) === min ? 3 : 0 })
      radii[0] = 3
      radii[radii.length - 1] = 3
      return radii
    },
    chartData: function () {
      return {
        datasets: [
          {
            data: this.xys,
            tension: 0,
            borderColor: this.$colors.brown2,
            backgroundColor: window.Color(this.$colors.brown2).alpha(0.5).rgbString(),
            radius: this.radii
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
