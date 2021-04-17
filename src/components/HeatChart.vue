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
import { round, interp } from '@/util/math'
import PlanChart from './PlanChart.js'
import { heatFactor } from '../util/heatFactor.js'
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
            tod: x.tod % 86400
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
      return round(this.sun.rise, 0) + 1800
    },
    stop: function () {
      return round(this.sun.set, 0) + 3600
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
              y: round((heatFactor(this.start + (i * ((this.stop - this.start) / 50)), model) - 1) * 100, 4)
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
      const m = []
      if (this.heatModel) {
        // if we have distance / time-of-day pairs, map it to distance
        if (this.showDistance) {
          // interpolate heat factor for distance 0
          let j = this.model.findIndex(p => p.x > this.ps[0].tod) - 1
          m.push({
            x: 0,
            y: interp(
              this.model[j].x,
              this.model[j + 1].x,
              this.model[j].y,
              this.model[j + 1].y,
              this.ps[0].tod
            )
          })

          // figure out if we have multiple days (rollovers)
          const rollovers = []
          let ri = 0
          while (ri !== -1 && ri < this.ps.length - 1) {
            ri = this.ps.findIndex((p, k) => k > 0 && this.ps[k - 1].tod > p.tod && k > ri)
            if (ri >= 0) {
              rollovers.push(ri)
            }
          }
          let lastr = 0
          let nextr = rollovers[0] - 1 || this.ps.length - 1

          // map curved sections to interpolated distances for each day
          let i = 0
          for (let r = 0; r <= rollovers.length; r++) {
            const df = this.model.filter(p =>
              p.x > this.ps[lastr].tod &&
              p.x < this.ps[nextr].tod &&
              p.x !== 24 * 3600
            )
            i = lastr
            lastr = Math.min(nextr + 1, this.ps.length - 1)
            nextr = rollovers[r + 1] - 1 || this.ps.length - 1
            //
            df.forEach(p => {
              while (i < this.ps.length - 1 && this.ps[i + 1].tod <= p.x) {
                i += 1
              }
              m.push({
                x: interp(
                  this.ps[i].tod,
                  this.ps[i + 1].tod,
                  this.ps[i].loc,
                  this.ps[i + 1].loc,
                  p.x
                ),
                y: p.y
              })
            })
          }

          // interpolate heat factor for final distance
          j = this.model.findIndex(p => p.x > this.ps[this.ps.length - 1].tod) - 1
          m.push({
            x: this.ps[this.ps.length - 1].loc,
            y: interp(
              this.model[j].x,
              this.model[j + 1].x,
              this.model[j].y,
              this.model[j + 1].y,
              this.ps[this.ps.length - 1].tod
            )
          })
        }
      }
      return m
    },
    xys: function () {
      let xys = []
      if (this.heatModel) {
        if (this.showDistance) {
          // format distance units:
          xys = this.modelByDistance.map(x => {
            const y = { ...x }
            y.x = this.$units.distf(y.x)
            return y
          })
        } else {
          // (no distance / time of day pairs)
          // format seconds to hours
          xys = this.model.map(x => {
            const y = { ...x }
            y.x = y.x / 3600
            return y
          })
        }
      }
      return xys
    },
    radii: function () {
      const min = Math.min(...this.xys.map(x => { return round(x.y, 4) }))
      const radii = this.xys.map(x => { return round(x.y, 4) === min ? 3 : 0 })
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
