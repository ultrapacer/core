<template>
  <div>
    <Chart
      v-if="chartData.datasets && chartData.datasets.length && chartProfile.length"
      ref="profile"
      :data="chartData"
      :options="chartOptions"
      type="line"
      :style="printing ? 'width: 9.9in; height: 7.25in' : 'height: 300px'"
    />
    <div style=" width: 100%; display: flex; justify-content: flex-end;">
      <img
        v-if="course && course.source && course.source.alt === 'google'"
        src="../assets/powered_by_google_on_white.png"
        style="margin-top: -50px; position: absolute; padding-right: 38px;"
      >
    </div>
  </div>
</template>
<script>
import timeUtil from '../util/time'
import Chart from 'vue-chartjs3'
import { Chart as ChartJs, Interaction } from 'chart.js'
import { CrosshairPlugin, Interpolate } from 'chartjs-plugin-crosshair'
ChartJs.register(CrosshairPlugin)
Interaction.modes.interpolate = Interpolate

export default {
  components: {
    Chart
  },
  props: {
    course: {
      type: Object,
      required: true
    },
    printing: {
      type: Boolean,
      default: false
    },
    waypoints: {
      type: Array,
      default () { return [] }
    },
    plan: {
      type: Object,
      required: true
    },
    showActual: {
      type: Boolean,
      default: false
    },
    focus: {
      type: Array,
      default () { return [] }
    }
  },
  data () {
    return {
      chartProfile: [],
      chartGrade: [],
      pmax: 500
    }
  },
  computed: {
    chartOptions: function () {
      this.$logger('CourseProfile|chartOptions')

      // average altitude, for min/max y-axis-1 scale
      let avgAlt = this.course.track.map(p => { return p.alt }).reduce((a, b) => a + b) / this.course.track.length
      avgAlt = this.$math.round(this.$units.altf(avgAlt) / 20, 0) * 20

      const opts = {
        animation: {
          duration: 0
        },

        responsive: true,
        maintainAspectRatio: false,
        height: '100px',
        scales: {
          x: {
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
              }
            },
            max: this.$units.distf(this.course.scaledDist)
          },

          'y-axis-1': {
            display: true,
            position: 'left',
            suggestedMin: avgAlt - (this.$units.alt === 'ft' ? 100 : 50),
            suggestedMax: avgAlt + (this.$units.alt === 'ft' ? 100 : 50),
            grid: { display: !this.showActual }
          },
          'y-axis-2': {
            type: 'linear',
            display: !this.showActual,
            position: 'right',
            suggestedMin: -2,
            suggestedMax: 2,
            grid: { display: false }
          },
          'y-axis-3': {
            type: 'linear',
            display: this.showActual,
            position: 'right',
            title: {
              display: true,
              text: '<- Ahead | Behind ->',
              padding: 0
            },
            ticks: {
              callback: function (value, index, values) {
                const sign = value >= 0 ? '' : '-'
                return sign + timeUtil.sec2string(Math.abs(value), '[h]:m:ss')
              },
              stepSize: 60,
              maxTicksLimit: 12
            }
          }

        },
        plugins: {
          legend: {
            display: false
          },

          tooltip: {
            mode: 'nearest',
            intersect: true,
            displayColors: false,
            filter: function (tooltipItem) {
              return tooltipItem.datasetIndex === 0
            },

            callbacks: {
              label: function (tooltipItem, data) {
                return tooltipItem.raw.label
              },
              title: function (tooltipItem, data) {
                if (!tooltipItem.length) { return '' }
                return tooltipItem[0].raw.title
              }
            }
          },
          crosshair: {
            line: {
              color: this.$colors.red2.hex,
              width: 2
            },
            sync: {
              enabled: true,
              group: 1
            },
            zoom: {
              enabled: false
            }
          }
        },
        onClick: this.click
      }

      return opts
    },
    chartData: function () {
      this.$logger('CourseProfile|chartData')
      const datasets = [
        this.chartWaypoints,
        {
          data: this.chartFocus,
          pointRadius: 0,
          pointHoverRadius: 0,
          borderColor: this.$colors.red2.rgb,
          borderWidth: 2,
          backgroundColor: this.$colors.red2.transparentize(),
          fill: this.showActual ? false : 'origin',
          yAxisID: 'y-axis-1'
        },
        {
          data: this.chartProfile,
          pointRadius: 0,
          pointHoverRadius: 0,
          borderColor: this.$colors.blue1.rgb,
          borderWidth: 2,
          backgroundColor: this.$colors.blue1.transparentize(),
          fill: this.showActual ? false : 'origin',
          yAxisID: 'y-axis-1'
        },
        {
          data: this.chartGrade,
          pointRadius: 0,
          pointHoverRadius: 0,
          backgroundColor: this.$colors.red2.transparentize(0.25),
          fill: this.showActual ? false : 'origin',
          showLine: true,
          yAxisID: 'y-axis-2'
        }
      ]
      if (this.showActual) {
        datasets.push({
          data: this.comparePoints,
          pointRadius: 0,
          pointHoverRadius: 0,
          borderColor: this.$colors.green2.rgb,
          borderWidth: 2,
          backgroundColor: this.$colors.green2.transparentize(),
          fill: 'origin',
          showLine: true,
          yAxisID: 'y-axis-3'
        })
      }
      return {
        datasets: datasets
      }
    },
    chartFocus: function () {
      const cF = []
      this.chartProfile.forEach(xy => {
        if (
          xy.x / this.course.distScale >= this.$units.distf(this.focus[0]) &&
          xy.x / this.course.distScale <= this.$units.distf(this.focus[1])
        ) {
          cF.push(xy)
        }
      })
      return cF
    },
    xs: function () {
      return Array(this.pmax + 1).fill(0).map((e, i) => i++ * this.course.dist / this.pmax)
    },
    comparePoints: function () {
      if (this.showActual) {
        const mbs = this.$math.wlslr(
          this.course.points.map(p => { return p.loc }),
          this.course.points.map(p => { return p.elapsed - p.actual.elapsed }),
          this.xs,
          2 * this.course.dist / this.pmax
        )
        const arr = []
        this.xs.forEach((x, i) => {
          arr.push({
            x: this.$units.distf(x * this.course.distScale),
            y: mbs[i][0] * this.xs[i] + mbs[i][1]
          })
        })
        this.$logger('CourseProfile|comparePoints updated')
        return arr
      } else {
        this.$logger('CourseProfile|comparePoints updated (empty)')
        return []
      }
    },
    chartWaypoints: function () {
      this.$logger('CourseProfile|chartWaypoints')
      if (!this.waypoints.length) { return [] }
      return {
        data: this.waypoints.map(wp => {
          return {
            x: this.$units.distf(wp.loc * this.course.distScale),
            y: this.$units.altf(wp.alt),
            label:
              wp.name + ' [' +
              this.$units.distf(wp.loc * this.course.distScale, 1) +
              this.$units.dist + ']',
            title: this.$waypointTypes[wp.type].text,
            waypoint: wp
          }
        }),
        pointBackgroundColor: this.waypoints.map(wp => {
          return this.$waypointTypes[wp.type].backgroundColor.transparentize()
        }),
        borderColor: this.waypoints.map(wp => {
          return this.$waypointTypes[wp.type].color.rgb
        }),
        pointBorderWidth: Array(this.waypoints.length).fill(2),
        fill: false,
        pointRadius: 6,
        pointStyle: Array(this.waypoints.length).fill('circle'),
        pointHoverRadius: 10,
        showLine: false
      }
    }
  },
  watch: {
    'plan.pacing.sunEventsByLoc': function (v) {
      this.update()
    }
  },
  async created () {
    ChartJs.register({
      id: 'backgroundColorPlugin',
      beforeDraw: (chart, other) => {
        if (!this.plan.pacing || !this.plan.pacing.sunEventsByLoc || !this.plan.pacing.sunEventsByLoc.length) return
        const rules = this.plan.pacing.sunEventsByLoc.map(br => {
          return {
            loc: this.$units.distf(br.loc),
            sunType: br.sunType
          }
        })
        const ctx = chart.ctx
        const yaxis = chart.scales['y-axis-2']
        const xaxis = chart.scales.x
        function distToPixels (d) {
          return d / (xaxis.max) * xaxis.width + xaxis.left
        }
        const colors = {
          day: this.$colors.white.transparentize(),
          twilight: this.$colors.black.transparentize(0.15),
          dark: this.$colors.black.transparentize(0.3)
        }
        rules.forEach((r, i) => {
          const x1 = distToPixels(r.loc)
          const x2 = distToPixels(i < rules.length - 1 ? rules[i + 1].loc : xaxis.max)
          if (r.sunType === 'twilight') {
            const grd = ctx.createLinearGradient(x1, 0, x2, 0)
            if (
              (i > 0 && rules[i - 1].sunType === 'day') ||
                    (i < rules.length - 1 && rules[i + 1].sunType === 'dark')
            ) {
              grd.addColorStop(0, colors.day)
              grd.addColorStop(1, colors.dark)
            } else {
              grd.addColorStop(0, colors.dark)
              grd.addColorStop(1, colors.day)
            }
            ctx.fillStyle = grd
          } else {
            ctx.fillStyle = colors[r.sunType]
          }
          ctx.fillRect(x1, yaxis.top, x2 - x1, yaxis.height)
        })
      }
    })
    ChartJs.register({
      id: 'setHighlightPointPlugin',
      afterEvent: (chart, e) => {
        const x = chart.scales.x.getValueForPixel(e.event.x)
        this.setHighlightPoint(x)
      }
    })
    this.updateChartProfile()
  },
  beforeDestroy () {
    this.$logger('CourseProfile|beforeDestroy')
    ChartJs.unregister({ id: 'setHighlightPointPlugin' })
    ChartJs.unregister({ id: 'backgroundColorPlugin' })
  },
  methods: {
    click: function (point, event) {
      if (!event.length) { return }
      const item = event[0]
      this.$emit('waypointClick', this.chartWaypoints.data[item.index].waypoint)
    },
    updateChartProfile: function () {
      if (!this.course.points.length) return []
      this.$logger('CourseProfile|updateChartProfile')
      const chartProfile = []
      let mbs = this.$math.wlslr(
        this.course.points.map(p => { return p.loc }),
        this.course.points.map(p => { return p.alt }),
        this.xs,
        this.course.dist / this.pmax / 5
      )
      this.xs.forEach((x, i) => {
        chartProfile.push({
          x: this.$units.distf(x * this.course.distScale),
          y: this.$units.altf(mbs[i][0] * this.xs[i] + mbs[i][1])
        })
      })

      const chartGrade = []
      mbs = this.$math.wlslr(
        this.course.points.map(p => { return p.loc }),
        this.course.points.map(p => { return p.alt }),
        this.xs,
        5 * this.course.dist / this.pmax
      )
      this.xs.forEach((x, i) => {
        chartGrade.push({
          x: this.$units.distf(x * this.course.distScale),
          y: mbs[i][0] / 10
        })
      })

      this.chartProfile = chartProfile
      this.chartGrade = chartGrade
    },
    update: async function () {
      await this.$refs.profile.update()
      this.$logger('CourseProfile|update')
    },
    setHighlightPoint: async function (x) {
      const loc = x / this.$units.distScale
      if (loc > 0 && loc < this.course.dist) {
        const pnt = this.course.points.find(p => p.loc >= loc)
        this.$emit('setHighlightPoint', pnt)
      }
    }
  }
}
</script>
