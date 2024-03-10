import { StrategyElement } from './StrategyElement'

export function adjust(values: StrategyElement[], length: number) {
  // calculate initial strategy factor offset such that strategy averages to 0
  let a = 0
  let area = 0
  values.forEach((d, i) => {
    const end = i === values.length - 1 ? length : values[i + 1].onset
    const v = d.type === 'linear' ? d.value / 2 : d.value
    area += (a + v) * (end - d.onset)
    a += d.value
  })
  return area / length
}
