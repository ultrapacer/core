<template>
  <line-chart :chart-data="chartData" :options="chartOptions" :width="350" :height="300">
  </line-chart>
</template>

<script>
import util from '../../shared/utilities'
import LineChart from './LineChart.js'

export default {
  props: ['course', 'units', 'mode'],
  components: {
    LineChart
  },
  data () {
    return {
      chartColors: {
        red: 'rgb(255, 99, 132)',
        orange: 'rgb(255, 159, 64)',
        yellow: 'rgb(255, 205, 86)',
        green: 'rgb(75, 192, 192)',
        darkgreen: 'rgb(50, 150, 150)',
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
              }
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
        onClick: this.click
      },
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
          water: 'darkblue'
        }
      },
      updateTrigger: 0
    }
  },
  computed: {
    chartData: function () {
      return {
        datasets: [
          this.chartPoints,
          { data: this.chartProfile,
            pointRadius: 0,
            pointHoverRadius: 0,
            backgroundColor: this.transparentize(this.chartColors.blue),
            yAxisID: 'y-axis-1'
          },
          { data: this.chartGrade,
            pointRadius: 0,
            pointHoverRadius: 0,
            showLine: true,
            yAxisID: 'y-axis-2'
          },
          { data: this.chartFocus,
            pointRadius: 0,
            pointHoverRadius: 0,
            backgroundColor: this.chartColors.red,
            yAxisID: 'y-axis-1'
          }
        ]
      }
    },
    chartPoints: function () {
      // eslint-disable-next-line
      this.updateTrigger // hack for force recompute
      if (!this.course.waypoints.length) { return [] }
      var d = {
        data: [],
        backgroundColor: [],
        borderColor: [],
        fill: false,
        pointRadius: [],
        pointStyle: [],
        pointHoverRadius: 10,
        showLine: false
      }
      let wps = this.course.waypoints
      for (var i = 0, il = this.course.waypoints.length; i < il; i++) {
        if (this.mode !== 'all' && !this.course.waypoints[i].show) { continue }
        d.data.push({
          x: this.course.waypoints[i].location * this.units.distScale,
          y: this.course.waypoints[i].elevation * this.units.altScale,
          label: this.course.waypoints[i].name,
          title: this.$waypointTypes[this.course.waypoints[i].type]
        })
        d.pointRadius.push(this.markerStyles.pointRadius[wps[i].type] || 6)
        d.pointStyle.push(this.markerStyles.pointStyle[wps[i].type] || 'circle')
        d.borderColor.push(
          this.chartColors[this.markerStyles.color[wps[i].type] || 'black']
        )
        d.backgroundColor.push(
          this.chartColors[this.markerStyles.color[wps[i].type] || 'white']
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
      this.$emit('waypointClick', item._index)
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
      var pmax = 500 // number of points (+1)
      var xs = [] // x's array
      var ysa = [] // y's array for altitude
      var ysg = [] // y's array for grade
      var chartProfile = []
      var chartGrade = []
      xs = Array(pmax + 1).fill(0).map((e, i) => i++ * this.course.len / pmax)
      ysa = util.pointWLSQ(
        this.course.points,
        xs,
        this.course.len / pmax / 5
      )
      ysg = util.pointWLSQ(
        this.course.points,
        xs,
        5 * this.course.len / pmax
      )
      xs.forEach((x, i) => {
        chartProfile.push({
          x: x * this.units.distScale,
          y: ysa[i].alt * this.units.altScale
        })
        chartGrade.push({
          x: x * this.units.distScale,
          y: ysg[i].grade
        })
      })
      // this is a hack to make the finish waypoint show up:
      this.chartOptions.scales.xAxes[0].ticks.max = (
        (xs[xs.length - 1] * this.units.distScale) + 0.01
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
    }
  }
}
</script>
