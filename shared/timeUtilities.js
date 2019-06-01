function sec2string (val, format) {
  var d = new Date(null)
  d.setSeconds(val)
  if (format === 'm:ss') {
    if (val < 600) { return d.toISOString().substr(15, 4) } else {
      return d.toISOString().substr(14, 5)
    }
  } else if (format === 'mm:ss') {
    return d.toISOString().substr(14, 5)
  } else if (format === 'h:mm:ss') {
    if (val < 36000) {
      return d.toISOString().substr(12, 7)
    } else {
      return d.toISOString().substr(11, 8)
    }
  } else if (format === '[h]:m:ss') {
    if (val >= 36000) {
      return d.toISOString().substr(11, 8)
    } else if (val >= 3600) {
      return d.toISOString().substr(12, 7)
    } else if (val >= 600) {
      return d.toISOString().substr(14, 5)
    } else {
      return d.toISOString().substr(15, 4)
    }
  } else {
    return d.toISOString().substr(11, 8)
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

module.exports = {
  sec2string: sec2string,
  string2sec: string2sec
}
