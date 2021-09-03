let moment // to later lazy load
let suncalc // to later lazy load

function string2sec (val) {
  const arr = val.split(':')
  let s = 0
  for (let i = 0, il = arr.length; i < il; i++) {
    s += Number(arr[i]) * (60 ** (arr.length - 1 - i))
  }
  return s
}

class Event {
  constructor (obj) {
    Object.keys(obj).forEach(k => {
      this[k] = obj[k]
    })
    this.setUp()
  }

  setUp () {
    // this lazy loads modules so they aren't required upfront
    if (!moment) {
      import(/* webpackPrefetch: true */ 'moment-timezone')
        .then(mod => { moment = mod.default })
    }
    if (!suncalc) {
      import(/* webpackPrefetch: true */ 'suncalc')
        .then(mod => { suncalc = mod })
    }
  }

  set start (val) {
    // timezone, lat, and lon fields must be set before setting start
    this.startMoment = moment.isMoment(val) ? val : moment(val).tz(this.timezone)
    this.startTime = string2sec(this.startMoment.format('kk:mm:ss'))
    const times = suncalc.getTimes(this.startMoment.toDate(), this.lat, this.lon)
    this.sun = {
      dawn: string2sec(moment(times.dawn).tz(this.timezone).format('HH:mm:ss')),
      rise: string2sec(moment(times.sunrise).tz(this.timezone).format('HH:mm:ss')),
      set: string2sec(moment(times.sunset).tz(this.timezone).format('HH:mm:ss')),
      dusk: string2sec(moment(times.dusk).tz(this.timezone).format('HH:mm:ss'))
    }
  }

  get start () {
    return this.startMoment
  }

  hasTOD () {
    return this.startTime !== null && !isNaN(this.startTime)
  }
}

exports.Event = Event
