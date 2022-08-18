const Event = require('./Event')
const { calcPacing, createSegments, createSplits } = require('../geo')
const areSame = (a, b) => ((typeof (a) === 'object' ? String(a._id) : a) === (typeof (b) === 'object' ? String(b._id) : b))

function getDelayAtWaypoint (delays, waypoint, typ) {
  // return delay object if it exists
  const delay = delays.find(d => areSame(d._waypoint, waypoint.site) && d.loop === waypoint.loop)
  if (delay !== null && delay !== undefined) return delay

  // if not, create a new one, add it to delays, and return it
  const newDelay = { _waypoint: waypoint.site._id, loop: waypoint.loop, delay: waypoint.hasTypicalDelay ? typ : 0 }
  return newDelay
}

class Plan {
  constructor (db) {
    this.db = db
    // other fields just pass along:
    Object.keys(db).forEach(k => {
      if (this[k] === undefined) this[k] = db[k]
    })
    this.__class = 'Plan'

    // create event property:
    if (db.eventStart) {
      this.event = new Event(this.course.event)
      this.event.timezone = db.eventTimezone
      this.event.start = db.eventStart
    } else {
      this.event = this.course.event
    }

    // create plan heat model
    if (this.event?.start && this.heatModel) {
      Object.assign(this.heatModel, {
        start: this.event.sun.sunrise + 1800,
        stop: this.event.sun.sunset + 3600
      })
    } else {
      this.heatModel = null
    }

    // create delays array
    this.delays = this.course.waypoints
      .map(wp =>
        new PlanDelay({
          waypoint: wp,
          delay: getDelayAtWaypoint(db.delays || [], wp, this.waypointDelay).delay
        })
      )
      .filter(d => d.delay > 0)
      .sort((a, b) => a.loc - b.loc)

    // create notes array
    this.notes = []
    if (db.notes) {
      this.notes = this.course.waypoints
        .map(wp => {
          const note = db.notes.find(n => areSame(n._waypoint, wp.site) && n.loop === wp.loop)?.text || ''
          return {
            waypoint: wp,
            text: note
          }
        })
        .filter(n => n.text)
    }

    // create cutoffs array:
    this.cutoffs = []
    if (this.adjustForCutoffs) {
      this.cutoffs = this.course.cutoffs.map(c => new PlanCutoff({ courseCutoff: c, plan: this }))
    }

    this.splits = null
    this.pacing = null
  }

  getDelayAtWaypoint (waypoint) {
    return this.delays.find(d => d.waypoint === waypoint)?.delay || 0
  }

  getTypicalDelayAtWaypoint (waypoint) {
    if (waypoint.hasTypicalDelay) return this.waypointDelay
    return 0
  }

  getNoteAtWaypoint (waypoint) {
    return this.notes.find(d => d.waypoint === waypoint)?.text || ''
  }

  // iterate pacing routine and set this.pacing key
  async calcPacing (options) {
    this.pacing = await calcPacing({
      plan: this,
      options: options
    })
  }

  // calculate and return splits for plan
  async calcSplits () {
    const splits = {}
    splits.segments = await createSegments(
      this.course.points,
      {
        waypoints: this.course.waypoints,
        ...this.pacing,
        startTime: this.event.startTime,
        course: this.course,
        plan: this
      }
    )
    const units = ['kilometers', 'miles']
    await Promise.all(
      units.map(async (unit) => {
        splits[unit] = await createSplits(
          this.course.points,
          unit,
          {
            ...this.pacing,
            startTime: this.event.startTime,
            course: this.course,
            plan: this
          }
        )
      })
    )
    this.splits = splits
    return this.splits
  }

  updateDelay (waypoint, delay) {
    let wpd = this.delays.find(d => d.waypoint === waypoint)
    if (wpd) {
      if (delay) {
        wpd.delay = delay
      } else {
        this.delays.splice(this.delays.findIndex(d => d === wpd), 1)
      }
    } else {
      wpd = new PlanDelay({
        waypoint: waypoint,
        delay: delay
      })
      this.delays.push(wpd)

      this.delays = this.delays
        .filter(d => d.delay > 0)
        .sort((a, b) => a.loc - b.loc)
    }
    return wpd
  }

  updateNote (waypoint, text) {
    let wpn = this.notes.find(d => d.waypoint === waypoint)
    if (wpn) {
      if (text) {
        wpn.text = text
      } else {
        this.notes.splice(this.notes.findIndex(d => d === wpn), 1)
      }
    } else {
      wpn = {
        waypoint: waypoint,
        text: text
      }
      this.notes.push(wpn)

      this.notes = this.notes
        .filter(d => d.text?.length)
        .sort((a, b) => a.loc - b.loc)
    }
    return wpn
  }
}

class PlanDelay {
  constructor (data) {
    Object.assign(this, data)
  }

  get loc () { return this.waypoint.loc }
}

class PlanCutoff {
  constructor (data) {
    Object.assign(this, data)
  }

  get waypoint () { return this.courseCutoff.waypoint }
  get loc () { return this.courseCutoff.loc }
  get time () { return this.courseCutoff.time - Math.max((this.plan.cutoffMargin || 0), this.plan.getDelayAtWaypoint(this.waypoint)) }
}

module.exports = Plan
