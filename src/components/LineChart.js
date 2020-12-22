import { Line, mixins } from 'vue-chartjs'
const { reactiveProp } = mixins

export default {
  extends: Line,
  mixins: [reactiveProp],
  props: ['options'],
  mounted () {
    this.addPlugin({
      id: 'background-color-plugin',
      beforeDraw: function (chart) {
        const ctx = chart.chart.ctx
        const rules = chart.chart.options.backgroundRules
        if (!rules || rules.length <= 1) { return }
        const yaxis = chart.chart.scales['y-axis-2']
        const xaxis = chart.chart.scales['x-axis-0']
        function distToPixels (d) {
          return d / (xaxis.max) * xaxis.width + xaxis.left
        }
        function transparentize (color, opacity) {
          const alpha = opacity === undefined ? 0.5 : 1 - opacity
          return window.Color(color).alpha(alpha).rgbString()
        }
        const colors = {
          day: transparentize('rgb(255, 255, 255)', 1),
          twilight: transparentize('rgb(0, 0, 0)', 0.85),
          dark: transparentize('rgb(0, 0, 0)', 0.7)
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
    this.renderChart(this.chartData, this.options)
  },
  methods: {
    update: function () {
      setTimeout(() => {
        this.$data._chart.destroy()
        this.renderChart(this.chartData, this.options)
      }, 100)
      this.$logger('LineChart|update')
    }
  }
}
