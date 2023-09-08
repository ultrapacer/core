// get time of day seconds in event timezone:
module.exports = (date, timezone) => {
  const hms = date
    .toLocaleString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: timezone
    })
    .split(':')
    .map((v) => Number(v))
  return hms[0] * 60 * 60 + hms[1] * 60 + hms[2]
}
