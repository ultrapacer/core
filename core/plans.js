const logger = require('winston').child({ component: 'plans.js' })
class Plan {
  constructor (db) {
    this.db = db
    // other fields just pass along:
    Object.keys(db).forEach(k => {
      if (this[k] === undefined) this[k] = db[k]
    })
    if (!this.delays) this.delays = []
    this.__class = 'Plan'
    logger.child({ method: 'Plan|constructor' }).info('created new Plan')
  }

  getDelayAtWaypoint (waypoint) {
    // return delay object if it exists
    const delay = this.delays.find(d => d._waypoint === waypoint.site._id && d.loop === waypoint.loop)
    if (delay !== null && delay !== undefined) return delay

    // if not, create a new one, add it to delays, and return it
    const newDelay = { _parentId: this._id, _waypoint: waypoint.site._id, loop: waypoint.loop, delay: waypoint.hasTypicalDelay ? this.waypointDelay : 0 }
    this.delays.push(newDelay)
    return newDelay
  }

  getTypicalDelayAtWaypoint (waypoint) {
    if (waypoint.hasTypicalDelay) return this.waypointDelay
    return 0
  }

  getNoteAtWaypoint (waypoint) {
    // return note object if it exists
    const note = this.notes.find(n => n._waypoint === waypoint.site._id && n.loop === waypoint.loop)
    if (note) return note

    // if not, create a new one, add it to notes, and return it
    const newNote = { _parentId: this._id, _waypoint: waypoint.site._id, loop: waypoint.loop, text: '' }
    this.notes.push(newNote)
    return newNote
  }
}

module.exports = {
  Plan: Plan
}
