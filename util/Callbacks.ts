import _ from 'lodash'

type CallbackDict = { [key: string]: ((a: object) => void)[] }
type CallbackFunction = (a: object) => void

/**
 * Callbacks class facilitates adding/removing/executing callbacks for target object
 */
export class Callbacks {
  _callbacks: CallbackDict = {}
  _target: object

  /**
   *
   * @param target - target object
   * @param events - array of event names to map
   */
  constructor(target: object, events: string[]) {
    this._target = target
    this._callbacks = _.fromPairs(events.map((e) => [e, []]))
  }

  /**
   * add a callback function to an event
   * @param evt - event name
   * @param fun - callback function, first argument is target object
   */
  add(evt: string, fun: CallbackFunction) {
    if (!this._callbacks[evt]) throw new Error(`${evt} is not a valid callback for object`)
    if (this._callbacks[evt].find((f) => f === fun)) console.warn('callback already exists.')
    else this._callbacks[evt].push(fun)
  }

  /**
   * remove a callback function from event
   * @param evt - event name
   * @param fun - callback function
   */
  remove(evt: string, fun: CallbackFunction) {
    if (!this._callbacks[evt]) throw new Error(`${evt} is not a valid callback for object`)
    _.pull(this._callbacks[evt], fun)
  }

  /**
   * clear all callbacks from a target
   * @param evt - event to clear; if undefined all events will be cleared
   */
  clear(evt?: string) {
    const evts = evt ? [evt] : Object.keys(this._callbacks)
    evts.forEach((evt) => (this._callbacks[evt] = []))
  }

  /**
   * execute callbacks for an event
   * @param evt - event name
   */
  execute(evt: string) {
    this._callbacks[evt].forEach((cb) => cb(this._target))
  }
}
