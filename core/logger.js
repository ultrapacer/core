function leftZero (val) {
  if (val < 10) {
    return `0${val}`
  } else {
    return val
  }
}
function timeStr (t) {
  return leftZero(t.getHours()) + ':' +
          leftZero(t.getMinutes()) + ':' +
          leftZero(t.getSeconds()) + '.' +
          leftZero(Math.round(t.getMilliseconds() / 10))
}
let verbose = false
try {
  verbose = window.location.origin.includes('appspot.com') || window.location.origin.includes('localhost')
} catch (err) {
  verbose = true
}
function logger (message = null, prev = null) {
  if (verbose) {
    const t = new Date()
    if (message) {
      if (prev) {
        const delt = (t - prev) / 1000
        console.log(`[${timeStr(t)}] ${message} (${delt} sec)`)
      } else {
        console.log(`[${timeStr(t)}] ${message}`)
      }
    }
    return t
  }
}

exports.logger = logger
