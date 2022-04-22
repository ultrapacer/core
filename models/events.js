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

    // add in sun events:
    // run suncalc functions:
    const times = suncalc.getTimes(this.startMoment.toDate(), this.lat, this.lon)
    const nadirPosition = suncalc.getPosition(times.nadir, this.lat, this.lon)
    // add data to sun object:
    this.sun = {}
    const keys = ['nadir', 'dawn', 'sunrise', 'dusk', 'sunset', 'solarNoon']
    keys.forEach(k => {
      if (!isNaN(times[k])) {
        this.sun[k] = string2sec(moment(times[k]).tz(this.timezone).format('HH:mm:ss'))
      }
    })
    this.sun.nadirAltitude = nadirPosition.altitude * 180 / Math.PI
  }

  get start () {
    return this.startMoment
  }

  hasTOD () {
    return this.startTime !== null && !isNaN(this.startTime)
  }
}

exports.Event = Event
