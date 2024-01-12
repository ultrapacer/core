import _ from 'lodash'

/**
 * Callbacks class facilitates adding/removing/executing callbacks for target object
 */
export class Callbacks {
  /**
   *
   * @param {*} target target object
   * @param {[String]} events array of event names to map
   */
  constructor(target, events) {
    this._target = target
    this._callbacks = _.fromPairs(events.map((e) => [e, []]))
  }

  /**
   * add a callback function to an event
   * @param {String} evt event name
   * @param {Function} fun callback function, first argument is target object
   */
  add(evt, fun) {
    if (!this._callbacks[evt]) throw new Error(`${evt} is not a valid callback for object`)
    if (this._callbacks[evt].find((f) => f === fun)) console.warn('callback already exists.')
    else this._callbacks[evt].push(fun)
  }

  /**
   * remove a callback function from event
   * @param {String} evt event name
   * @param {Function} fun callback function
   */
  remove(evt, fun) {
    if (!this._callbacks[evt]) throw new Error(`${evt} is not a valid callback for object`)
    _.pull(this._callbacks[evt], fun)
  }

  /**
   * clear all callbacks from a target
   * @param {*} [evt] event to clear; if undefined all events will be cleared
   */
  clear(evt) {
    const evts = evt ? [evt] : Object.keys(this._callbacks)
    evts.forEach((evt) => (this._callbacks[evt] = []))
  }

  /**
   * execute callbacks for an event
   * @param {String} event event name
   */
  execute(event) {
    this._callbacks[event].forEach((cb) => cb(this._target))
  }
}
