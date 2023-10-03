import { areSame } from './areSame'
export function areSameWaypoint(a, b) {
  return Boolean(a && b && areSame(a.site, b.site) && a.loop === b.loop)
}
