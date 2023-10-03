// function compares two objects of any type for shallow equality

export function shallowEqual(a, b) {
  // first try a direct compare:
  if (a === b) return true

  // now compare the types:
  const typeA = typeof a
  const typeB = typeof b
  if (typeA !== typeB) return false

  // if objects, shallow compare:
  if (typeA === 'object') {
    if (Array.isArray(a)) {
      // false if different lengths
      if (a.length !== b.length) return false

      // false if none of the fields are equal, SHALLOW
      for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false
      }
    } else {
      // get keys with defined values:
      const aKeys = Object.keys(a).filter((k) => a[k] !== undefined)
      const bKeys = Object.keys(b).filter((k) => b[k] !== undefined)

      if (aKeys.length !== bKeys.length) return false

      for (let i = 0; i < aKeys.length; i++) {
        const key = aKeys[i]

        // false if none of the fields are equal, SHALLOW
        if (a[key] !== b[key] || !Object.prototype.hasOwnProperty.call(b, key)) return false
      }
    }
    return true
  }

  return false
}
