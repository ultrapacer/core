class Meter {
  constructor (interval = 50, sleep = 25) {
    this.interval = interval
    this.sleep = sleep
    this.previous = +new Date()
  }

  async go () {
    if (+new Date() - this.previous > this.interval) {
      await new Promise(resolve => setTimeout(resolve, this.sleep))
      this.previous = +new Date()
    }
  }
}
module.exports = Meter
