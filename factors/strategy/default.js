export function defaults(length) {
  if (length < 30) return 2
  if (length < 60) return 5
  if (length < 90) return 10
  if (length < 120) return 15
  return 20
}
