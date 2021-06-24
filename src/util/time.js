function sec2string (val, format) {
  val = Math.round(val)
  let h = Math.floor(val / 3600)
  const m = Math.floor((val % 3600) / 60)
  const s = Math.floor(val % 60)
  let suf
  switch (format) {
    case 'm:ss':
      return `${m + 60 * h}:${leftZero(s)}`
    case 'mm:ss':
      return `${leftZero(m + 60 * h)}:${leftZero(s)}`
    case 'hh:mm':
      return `${leftZero(h)}:${leftZero(m)}`
    case 'am/pm':
      suf = (h % 24 < 12) ? 'AM' : 'PM'
      h = h % 12 || 12
      return `${h}:${leftZero(m)}${String.fromCharCode(160)}${suf}`
    case 'h:mm:ss':
      return `${h}:${leftZero(m)}:${leftZero(s)}`
    case 'hhh:mm:ss':
      return `${leftZero(h, 3)}:${leftZero(m)}:${leftZero(s)}`
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
  const arr = val.split(':')
  let s = 0
  for (let i = 0, il = arr.length; i < il; i++) {
    s += Number(arr[i]) * (60 ** (arr.length - 1 - i))
  }
  return s
}

function leftZero (val, len = 2) {
  if (val < 10 ** (len - 1)) {
    return `${'0'.repeat(len - String(val).length)}${val}`
  } else {
    return val
  }
}

module.exports = {
  sec2string: sec2string,
  string2sec: string2sec
}
