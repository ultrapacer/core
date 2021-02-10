<template>
  <line-chart
    ref="profile"
    :chart-data="chartData"
    :options="chartOptions"
    :width="350"
    :height="300"
  />
</template>

<script>
import { wlslr } from '@/util/math'
import LineChart from './LineChart.js'
import timeUtil from '../util/time'

export default {
  components: {
    LineChart
  },
  props: {
    course: {
      type: Object,
      required: true
    },
    points: {
      type: Array,
      required: true
    },
    waypoints: {
      type: Array,
      default () { return [] }
    },
    sunEvents: {
      type: Array,
      default () { return [] }
    },
    showActual: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      chartColors: {
        red: 'rgb(255, 0, 0)',
        orange: 'rgb(255, 159, 64)',
        yellow: 'rgb(255, 205, 86)',
        green: 'rgb(75, 192, 192)',
        darkgreen: 'rgb(0, 140, 140)',
        blue: 'rgb(54, 162, 235)',
        darkblue: 'rgb(45, 45, 200)',
        purple: 'rgb(153, 102, 255)',
        black: 'rgb(0, 0, 0)',
        grey: 'rgb(201, 203, 207)',
        white: 'rgb(255, 255, 255)'
      },
      chartFocus: [],
      chartProfile: [],
      chartGrade: [],
      mapFocus: [],
      markerStyles: {
        pointRadius: {
        },
        pointStyle: {
          landmark: 'triangle',
          water: 'rectRot',
          junction: 'crossRot'
        },
        color: {
          aid: 'red',
          landmark: 'darkgreen',
          water: 'darkblue',
          start: 'black',
          finish: 'black'
        }
      },
      pmax: 500,
      chartOptions: {
        animation: {
          duration: 0
        },
        responsive: true,
        maintainAspectRatio: false,
        height: '100px',
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
              max: this.$units.distf(this.course.distance) + 0.01
            }
          }],
          yAxes: [{
            display: true,
            position: 'left',
            id: 'y-axis-1'
          }, {
            type: 'linear',
            display: true,
            position: 'right',
            id: 'y-axis-2'
          }, {
            type: 'linear',
            display: false,
            position: 'right',
            id: 'y-axis-3',
            scaleLabel: {
              display: true,
              labelString: 'Ahead/Behind',
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
          }]
        },
        tooltips: {
          displayColors: false,
          enabled: true,
          filter: function (tooltipItem) {
            return tooltipItem.datasetIndex === 0
          },
          callbacks: {
            label: function (tooltipItem, data) {
              const label = data.datasets[tooltipItem.datasetIndex]
                .data[tooltipItem.index].label
              return label
            },
            title: function (tooltipItem, data) {
              if (!tooltipItem.length) { return '' }
              const title = data.datasets[tooltipItem[0].datasetIndex]
                .data[tooltipItem[0].index].title
              return title
            }
          }
        },
        legend: {
          display: false
        },
        onClick: this.click,
        backgroundRules: []
      }
    }
  },
  computed: {
    chartData: function () {
      this.$logger('CourseProfile|chartData')
      const datasets = [
        this.chartWaypoints,
        {
          data: this.chartProfile,
          pointRadius: 0,
          pointHoverRadius: 0,
          borderColor: this.chartColors.blue,
          borderWidth: 1,
          backgroundColor: this.transparentize(this.chartColors.blue),
          yAxisID: 'y-axis-1'
        },
        {
          data: this.chartGrade,
          pointRadius: 0,
          pointHoverRadius: 0,
          backgroundColor: this.transparentize(this.chartColors.red, 0.75),
          showLine: true,
          yAxisID: 'y-axis-2'
        },
        {
          data: this.chartFocus,
          pointRadius: 0,
          pointHoverRadius: 0,
          borderColor: this.chartColors.red,
          borderWidth: 5,
          backgroundColor: this.chartColors.red,
          yAxisID: 'y-axis-1'
        }
      ]
      if (this.showActual) {
        datasets[2] = {
          data: this.comparePoints,
          pointRadius: 0,
          pointHoverRadius: 0,
          borderColor: 'rgb(40, 167, 69)',
          borderWidth: 1,
          backgroundColor: this.transparentize('rgb(40, 167, 69)', 0.65),
          showLine: true,
          yAxisID: 'y-axis-3'
        }
      }
      return {
        datasets: datasets
      }
    },
    xs: function () {
      return Array(this.pmax + 1).fill(0).map((e, i) => i++ * this.course.distance / this.pmax)
    },
    comparePoints: function () {
      if (this.showActual) {
        const mbs = wlslr(
          this.points.map(p => { return p.loc }),
          this.points.map(p => { return p.elapsed - p.actual.elapsed }),
          this.xs,
          2 * this.course.distance / this.pmax
        )
        const arr = []
        this.xs.forEach((x, i) => {
          arr.push({
            x: this.$units.distf(x),
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
      const len = this.waypoints.length
      return {
        data: this.waypoints.map(wp => {
          return {
            x: this.$units.distf(wp.location),
            y: this.$units.altf(wp.elevation),
            label:
              wp.name + ' [' +
              this.$units.distf(wp.location, 1) +
              this.$units.dist + ']',
            title: this.$waypointTypes[wp.type],
            _id: wp._id
          }
        }),
        backgroundColor: this.waypoints.map(wp => {
          return this.transparentize(
            this.chartColors[this.markerStyles.color[wp.type] || 'white']
          )
        }),
        borderColor: this.waypoints.map(wp => {
          return this.chartColors[this.markerStyles.color[wp.type] || 'black']
        }),
        borderWidth: Array(len).fill(2),
        fill: false,
        pointRadius: this.waypoints.map(wp => {
          return this.markerStyles.pointRadius[wp.type] || 6
        }),
        pointStyle: Array(len).fill('circle'),
        pointHoverRadius: 10,
        showLine: false
      }
    }
  },
  watch: {
    showActual: function (val) {
      this.chartOptions.scales.yAxes[1].display = !val
      this.chartOptions.scales.yAxes[2].display = val
      this.update()
    },
    sunEvents: function (val) {
      this.updateBackgroundRules()
    }
  },
  async created () {
    this.updateChartProfile()
    this.updateBackgroundRules()
  },
  methods: {
    click: function (point, event) {
      if (!event.length) { return }
      const item = event[0]
      const id = this.chartWaypoints.data[item._index]._id
      this.$emit('waypointClick', id)
    },
    focus: function (focus) {
      const cF = []
      this.chartProfile.forEach(xy => {
        if (
          xy.x >= this.$units.distf(focus[0]) &&
          xy.x <= this.$units.distf(focus[1])
        ) {
          cF.push(xy)
        }
      })
      this.chartFocus = cF
    },
    updateChartProfile: function () {
      const chartProfile = []
      let mbs = wlslr(
        this.points.map(p => { return p.loc }),
        this.points.map(p => { return p.alt }),
        this.xs,
        this.course.distance / this.pmax / 5
      )
      this.xs.forEach((x, i) => {
        chartProfile.push({
          x: this.$units.distf(x),
          y: this.$units.altf(mbs[i][0] * this.xs[i] + mbs[i][1])
        })
      })

      const chartGrade = []
      mbs = wlslr(
        this.points.map(p => { return p.loc }),
        this.points.map(p => { return p.alt }),
        this.xs,
        5 * this.course.distance / this.pmax
      )
      this.xs.forEach((x, i) => {
        chartGrade.push({
          x: this.$units.distf(x),
          y: mbs[i][0] / 10
        })
      })

      // this is a hack to make the finish waypoint show up:
      this.chartOptions.scales.xAxes[0].ticks.max = (
        this.$units.distf(this.xs[this.xs.length - 1]) + 0.01
      )
      this.chartProfile = chartProfile
      this.chartGrade = chartGrade
    },
    transparentize: function (color, opacity) {
      const alpha = opacity === undefined ? 0.5 : 1 - opacity
      return window.Color(color).alpha(alpha).rgbString()
    },
    updateBackgroundRules: function () {
      if (!this.sunEvents.length) { return [] }
      // format distance unit for day/night background:
      this.chartOptions.backgroundRules = this.sunEvents.map(br => {
        const br2 = { ...br }
        br2.loc = this.$units.distf(br2.loc)
        return br2
      })
    },
    update: function () {
      this.$refs.profile.update()
      this.$logger('CourseProfile|update')
    }
  }
}
</script>
