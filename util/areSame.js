// areSame routine compares strings or object _id fields:
export function areSame(a, b) {
  return (typeof a === 'object' ? String(a._id) : a) === (typeof b === 'object' ? String(b._id) : b)
}
