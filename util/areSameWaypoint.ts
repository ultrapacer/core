type S = { _id: string } | string
type W = { site: S; loop: number }

function areSame(a: S, b: S) {
  return (typeof a === 'object' ? String(a._id) : a) === (typeof b === 'object' ? String(b._id) : b)
}

export function areSameWaypoint(a: W, b: W) {
  return Boolean(a && b && areSame(a.site, b.site) && a.loop === b.loop)
}
