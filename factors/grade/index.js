const defaults = require('./defaults')

module.exports = function (grade, model) {
  if (model === null || typeof model === 'undefined') {
    model = defaults
  }
  if (grade < model.lower.lim) {
    return model.lower.m * grade + model.lower.b
  } else if (grade > model.upper.lim) {
    return model.upper.m * grade + model.upper.b
  } else {
    return model.a * grade ** 2 + model.b * grade + 1
  }
}
