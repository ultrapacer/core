export default {
  install (Vue) {
    Vue.prototype.$units = {
      dist: 'mi',
      alt: 'ft',
      distScale: 0.621371,
      altScale: 3.28084,
      set (dist, alt) {
        this.setDist(dist)
        this.setAlt(alt)
      },
      setDist (unit) {
        this.dist = unit
        this.distScale = (unit === 'mi') ? 0.621371 : 1
      },
      setAlt (unit) {
        this.alt = unit
        this.altScale = (unit === 'ft') ? 3.28084 : 1
      },
      distf (val, round = null) {
        const v = val * this.distScale
        return (round === null) ? v : v.toFixed(round)
      },
      altf (val, round = null) {
        const v = val * this.altScale
        return (round === null) ? v : v.toFixed(round)
      },
      pacef (val, round = null) {
        const v = val / this.distScale
        return (round === null) ? v : v.toFixed(round)
      }
    }
  }
}
