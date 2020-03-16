<template>
  <line-chart ref="profile" :chart-data="chartData" :options="chartOptions" :width="350" :height="300">
  </line-chart>
</template>

<script>
import { wlslr } from '@/util/math'
import LineChart from './LineChart.js'
import timeUtil from '../util/time'

export default {
  props: ['course', 'points', 'sunEvents', 'units', 'waypointShowMode', 'showActual'],
  components: {
    LineChart
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
      updateTrigger: 0
    }
  },
  computed: {
    backgroundRules: function () {
      if (!this.sunEvents) { return [] }
      let br = [...this.sunEvents]
      br.forEach((s, i) => {
        br[i] = {...br[i]}
        br[i].loc = br[i].loc * this.units.distScale
      })
      return br
    },
    chartOptions: function () {
      return {
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
              max: (this.course.distance * this.units.distScale) + 0.01
            }
          }],
          yAxes: [{
            display: true,
            position: 'left',
            id: 'y-axis-1'
          }, {
            type: 'linear',
            display: !this.comparePoints.length,
            position: 'right',
            id: 'y-axis-2'
          }, {
            type: 'linear',
            display: Boolean(this.comparePoints.length),
            position: 'right',
            id: 'y-axis-3',
            scaleLabel: {
              display: true,
              labelString: 'Ahead/Behind',
              padding: 0
            },
            ticks: {
              callback: function (value, index, values) {
                let sign = value >= 0 ? '' : '-'
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
              var label = data.datasets[tooltipItem.datasetIndex]
                .data[tooltipItem.index].label
              return label
            },
            title: function (tooltipItem, data) {
              if (!tooltipItem.length) { return '' }
              var title = data.datasets[tooltipItem[0].datasetIndex]
                .data[tooltipItem[0].index].title
              return title
            }
          }
        },
        legend: {
          display: false
        },
        onClick: this.click,
        backgroundRules: this.backgroundRules
      }
    },
    chartData: function () {
      this.$logger('CourseProfile|chartData')
      let datasets = [
        this.chartPoints,
        { data: this.chartProfile,
          pointRadius: 0,
          pointHoverRadius: 0,
          borderColor: this.chartColors.blue,
          borderWidth: 1,
          backgroundColor: this.transparentize(this.chartColors.blue),
          yAxisID: 'y-axis-1'
        },
        { data: this.chartGrade,
          pointRadius: 0,
          pointHoverRadius: 0,
          backgroundColor: this.transparentize(this.chartColors.red, 0.75),
          showLine: true,
          yAxisID: 'y-axis-2'
        },
        { data: this.chartFocus,
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
      // eslint-disable-next-line
      this.updateTrigger // hack for force recompute
      if (this.showActual) {
        let mbs = wlslr(
          this.points.map(p => { return p.loc }),
          this.points.map(p => { return p.elapsed - p.actual.elapsed }),
          this.xs,
          2 * this.course.distance / this.pmax
        )
        let arr = []
        this.xs.forEach((x, i) => {
          arr.push({
            x: x * this.units.distScale,
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
    chartPoints: function () {
      this.$logger('CourseProfile|chartPoints')
      // eslint-disable-next-line
      this.updateTrigger // hack for force recompute
      if (!this.course.waypoints.length) { return [] }
      var d = {
        data: [],
        backgroundColor: [],
        borderColor: [],
        borderWidth: [],
        fill: false,
        pointRadius: [],
        pointStyle: [],
        pointHoverRadius: 10,
        showLine: false
      }
      let wps = this.course.waypoints
      for (var i = 0, il = wps.length; i < il; i++) {
        if (!(
          (this.waypointShowMode === 3) ||
          (this.waypointShowMode === 2 && wps[i].tier <= 2) ||
          (this.waypointShowMode === null && wps[i].show)
        )) { continue }
        d.data.push({
          x: wps[i].location * this.units.distScale,
          y: wps[i].elevation * this.units.altScale,
          label:
            wps[i].name + ' [' +
            (wps[i].location * this.units.distScale).toFixed(1) +
            this.units.dist + ']',
          title: this.$waypointTypes[wps[i].type],
          _id: wps[i]._id
        })
        d.pointStyle.push('circle')
        d.borderWidth.push(2)
        d.pointRadius.push(this.markerStyles.pointRadius[wps[i].type] || 6)
        d.borderColor.push(
          this.chartColors[this.markerStyles.color[wps[i].type] || 'black']
        )
        d.backgroundColor.push(
          this.transparentize(
            this.chartColors[this.markerStyles.color[wps[i].type] || 'white']
          )
        )
      }
      return d
    }
  },
  async created () {
    this.updateChartProfile()
  },
  methods: {
    click: function (point, event) {
      if (!event.length) { return }
      const item = event[0]
      let id = this.chartPoints.data[item._index]._id
      this.$emit('waypointClick', id)
    },
    focus: function (focus) {
      var cF = []
      this.chartProfile.forEach(xy => {
        if (
          xy.x >= focus[0] * this.units.distScale &&
          xy.x <= focus[1] * this.units.distScale
        ) {
          cF.push(xy)
        }
      })
      this.chartFocus = cF
    },
    updateChartProfile: function () {
      var chartProfile = []
      let mbs = wlslr(
        this.points.map(p => { return p.loc }),
        this.points.map(p => { return p.alt }),
        this.xs,
        this.course.distance / this.pmax / 5
      )
      this.xs.forEach((x, i) => {
        chartProfile.push({
          x: x * this.units.distScale,
          y: (mbs[i][0] * this.xs[i] + mbs[i][1]) * this.units.altScale
        })
      })

      var chartGrade = []
      mbs = wlslr(
        this.points.map(p => { return p.loc }),
        this.points.map(p => { return p.alt }),
        this.xs,
        5 * this.course.distance / this.pmax
      )
      this.xs.forEach((x, i) => {
        chartGrade.push({
          x: x * this.units.distScale,
          y: mbs[i][0] * 10
        })
      })

      // this is a hack to make the finish waypoint show up:
      this.chartOptions.scales.xAxes[0].ticks.max = (
        (this.xs[this.xs.length - 1] * this.units.distScale) + 0.01
      )
      this.chartProfile = chartProfile
      this.chartGrade = chartGrade
    },
    transparentize: function (color, opacity) {
      var alpha = opacity === undefined ? 0.5 : 1 - opacity
      return window.Color(color).alpha(alpha).rgbString()
    },
    forceWaypointsUpdate: function () {
      // this is a hack because the computed property won't update
      // when this.course.waypoints[i] change
      this.updateTrigger++
    },
    update: function () {
      this.$refs.profile.update()
      this.$logger('CourseProfile|update')
    }
  }
}
</script>
