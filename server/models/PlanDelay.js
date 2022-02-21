const mongoose = require('mongoose')
const shallowEqual = require('../../core/util/shallow-equal')
const logger = require('winston').child({ component: 'PlanDelay.js' })

const schema = new mongoose.Schema({
  _waypoint: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Waypoint'
  },
  loop: {
    type: Number,
    default: 1
  },
  delay: {
    type: Number
  }
})

// method to update allowed fields
schema.methods.modifyAllowedFields = function (upd) {
  const log = logger.child({ method: 'modifyAllowedFields' })
  log.verbose('run')
  const fields = ['delay']
  const changes = []
  fields.forEach(f => {
    if (upd[f] !== undefined) {
      log.debug(`field '${f}' defined in update`)
      log.debug(upd[f])
      log.debug(this[f])
      if (!shallowEqual(upd[f], this[f])) {
        log.debug(`field '${f}' change been modified`)
        this[f] = upd[f]
        changes.push(f)
      }
    }
  })
  if (changes.length) {
    log.debug(`fields changed: ${changes.join(', ')}`)
  } else {
    log.debug('no fields changed')
  }
  return changes
}

module.exports = mongoose.model('PlanDelay', schema)
