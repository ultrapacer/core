import { Line, mixins } from 'vue-chartjs'
const { reactiveProp } = mixins

export default {
  extends: Line,
  mixins: [reactiveProp],
  props: ['options'],
  mounted () {
    this.renderChart(this.chartData, this.options)
  },
  methods: {
    update: function () {
      setTimeout(() => {
        this.$data._chart.destroy()
        this.renderChart(this.chartData, this.options)
      }, 100)
    }
  }
}
