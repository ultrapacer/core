<script>
import { Line } from 'vue-chartjs'
import utilities from '../../shared/utilities'

export default {
  extends: Line,
  props: ['points', 'user'],
  mounted () {
    this.renderLineChart()
  },
  watch: {
    points: function () {
      this.renderLineChart()
    }
  },
  computed: {
    chartData: function () {
      return this.points
    }
  },
  methods: {
    renderLineChart: function () {
      console.log(this.points)
      var data = {
        datasets: [{
          data: utilities.elevationProfile(this.chartData, this.user.distUnits, this.user.elevUnits)
        }]
      }
      var options = {
        scales: {
          xAxes: [{
            type: 'linear',
            position: 'bottom'
          }]
        },
        elements: {
          point: {
            radius: 0
          }
        },
        tooltips: {
          enabled: false
        }
      }
      this.renderChart(data, options)
    }
  }
}
</script>
