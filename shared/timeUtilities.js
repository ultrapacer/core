function sec2string (val, format) {
  val = Math.round(val)
  let h = Math.floor(val / 3600)
  let m = Math.floor((val % 3600) / 60)
  let s = Math.floor(val % 60)
  switch (format) {
    case 'm:ss':
      return `${m + 60 * h}:${leftZero(s)}`
    case 'mm:ss':
      return `${leftZero(m + 60 * h)}:${leftZero(s)}`
    case 'hh:mm':
      return `${leftZero(h)}:${leftZero(m)}`
    case 'am/pm':
      h = h % 24
      let suf = (h < 12) ? 'AM' : 'PM'
      h = h % 12
      if (h === 0) { h = 12 }
      return `${h}:${leftZero(m)}${String.fromCharCode(160)}${suf}`
    case 'h:mm:ss':
      return `${h}:${leftZero(m)}:${leftZero(s)}`
    case '[h]:m:ss':
      if (h) {
        return `${h}:${leftZero(m)}:${leftZero(s)}`
      } else {
        return `${m}:${leftZero(s)}`
      }
    default:
      return `${leftZero(h)}:${leftZero(m)}:${leftZero(s)}`
  }
}

function string2sec (val) {
  var arr = val.split(':')
  var s = 0
  for (var i = 0, il = arr.length; i < il; i++) {
    s += Number(arr[i]) * (60 ** (arr.length - 1 - i))
  }
  return s
}

function leftZero (val) {
  if (val < 10) {
    return `0${val}`
  } else {
    return val
  }
}

module.exports = {
  sec2string: sec2string,
  string2sec: string2sec
}
