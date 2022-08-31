// areSame routine compares strings or object _id fields:
module.exports = (a, b) => (
  (typeof (a) === 'object' ? String(a._id) : a) === (typeof (b) === 'object' ? String(b._id) : b)
)
