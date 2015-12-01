'use strict'

//  A small, simplistic event dispatcher & listener
class CustomEventTarget {
  constructor () {
    this.callbacks = {}
  }

  dispatchEvent (type, data) {
    if (typeof type !== 'string') {
      throw new Error('You cannot dispatch an event without providing the type as a String.')
    }

    type = (type || '*').toLowerCase()
    data = data || {}

    if (this.callbacks[type]) {
      this.callbacks[type].forEach(x => x(data))
    }
  }

  addEventListener (type, cb) {
    if (typeof type !== 'string') {
      throw new Error('You cannot listen for an event without providing the type as a String.')
    }

    if (typeof cb !== 'function') {
      throw new Error('You must provide a Function as the callback argument.')
    }

    type = (type || '*').toLowerCase()
    cb = cb || function () {}

    if (this.callbacks[type]) {
      this.callbacks[type].push(cb)
    } else {
      this.callbacks[type] = [cb]
    }
  }
}

export default CustomEventTarget
