export function adjust(strategy, length) {
  // calculate initial strategy factor offset such that strategy averages to 0
  let a = 0
  let area = 0
  strategy.forEach((d, i) => {
    const end = i === strategy.length - 1 ? length : strategy[i + 1].onset
    const v = d.type === 'linear' ? d.value / 2 : d.value
    area += (a + v) * (end - d.onset)
    a += d.value
  })
  return area / length
}
