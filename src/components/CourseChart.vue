<script>
import { Line } from 'vue-chartjs'
import utilities from '../../shared/utilities'

export default {
  extends: Line,
  props: ['points', 'waypoints', 'user', 'distScale', 'altScale'],
  data () {
    return {
      chartColors: {
        red: 'rgb(255, 99, 132)',
        orange: 'rgb(255, 159, 64)',
        yellow: 'rgb(255, 205, 86)',
        green: 'rgb(75, 192, 192)',
        blue: 'rgb(54, 162, 235)',
        purple: 'rgb(153, 102, 255)',
        grey: 'rgb(201, 203, 207)'
      }
    }
  },
  watch: {
    chartProfile: function () {
      this.renderLineChart()
    },
    chartPoints: function () {
      this.renderLineChart()
    }
  },
  computed: {
    chartProfile: function () {
      if (!this.points.length) { return [] }
      console.log(':::: getting chartProfile :::::::' + this.points.length)
      var data = []
      if ( this.points.length < 200 ) {
        for (var i = 0, il = this.points.length; i < il; i++) {
          data.push({
            x: this.points[i].loc * this.distScale,
            y: this.points[i].alt * this.altScale
          })
        }
      } else {
        var max = this.points[this.points.length - 1].loc
        console.log('max' + max)
        var x = 0
        for (var i = 0; i <= 200; i++) {
          x = (i / 200) * max
          data.push({
            x: x * this.distScale,
            y: utilities.getElevation(this.points, x) * this.altScale
          })
        }
      }
      console.log(':::: done getting chartProfile :::::::')
      return data
    },
    chartPoints: function () {
      if (!this.waypoints.length) { return [] }
      console.log(':::: getting chartPoints :::::::')
      var data = []
      for (var i = 0, il = this.waypoints.length; i < il; i++) {
        data.push({
          x: this.waypoints[i].location * this.distScale,
          y: this.waypoints[i].elevation * this.altScale
        })
      }
      console.log(this)
      console.log(':::: done getting chartPoints :::::::')
      return data
    }
  },
  methods: {
    renderLineChart: function () {
      console.log(':::: rendering chart :::::::')
      var data = {
        datasets: [
          { data: this.chartPoints,
            backgroundColor: this.chartColors.red,
            borderColor: this.chartColors.red,
            fill: false,
            pointRadius: 5,
            pointHoverRadius: 10,
            showLine: false
          },
          { data: this.chartProfile,
            pointRadius: 0,
            pointHoverRadius: 0,
            borderColor: this.chartColors.blue,
            backgroundColor: this.transparentize(this.chartColors.blue)
          }
        ]
      }
      var options = {
        scales: {
          xAxes: [{
            type: 'linear',
            position: 'bottom'
          }]
        },
        tooltips: {
          enabled: false
        },
        legend: {
          display: false
        }
      }
      console.log(data)
      this.renderChart(data, options)
    },
    transparentize: function (color, opacity) {
      var alpha = opacity === undefined ? 0.5 : 1 - opacity
      return Color(color).alpha(alpha).rgbString()
    }
  }
}
</script>
