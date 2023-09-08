const areSame = require('./areSame')
module.exports = (a, b) => Boolean(a && b && areSame(a.site, b.site) && a.loop === b.loop)
