// utility function to test cache data
const testCache = (cache) => {
  if (!cache.pacing) return 'Missing pacing data'
  if (cache.segments && !Array.isArray(cache.segments)) return 'Invalid segments array'
  if (cache.segments?.find(s => s.point2.time < s.point1.time)) return 'Invalid segment times'
  return false
}

// utility function to validate cache data
const validateCache = (cache) => {
  const message = testCache(cache)
  if (message) {
    const error = new Error(message)
    error.name = 'PlanCacheError'
    throw error
  }
}

module.exports = validateCache
