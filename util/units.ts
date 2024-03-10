export function distScale(unit: string) {
  switch (unit) {
    case 'kilometers':
      return 1
    case 'miles':
      return 0.621371
    default:
      throw new Error('Invalid distance unit')
  }
}
