/* global WebSocket */
'use strict'

import CustomEventTarget from './custom-event-target.js'

class SocketHandler extends CustomEventTarget {
  constructor () {
    super()

    let self = this

    this.url = ''
    this.context = ''
    this.stream = ''
    this.socket = null

    this.onopen = function (e) {
      self.dispatchEvent('open', {evt: e})
    }

    this.onclose = function (e) {
      self.dispatchEvent('close', {evt: e})
      self.socket = null
    }

    this.onmessage = function (e) {
      let d = JSON.parse(e.data || {})

      if (d.name) {
        self.dispatchEvent('message', {evt: e, name: d.name, data: d.data})
      } else if (d.ping) {
        self.dispatchEvent('ping', {evt: e, timestamp: d.ping})
      }
    }

    this.onerror = function (e) {
      self.dispatchEvent('error', {evt: e})
    }
  }

  connect () {
    this.socket = new WebSocket(`${this.url}${this.context}${this.stream}`)

    this.socket.onopen = this.onopen
    this.socket.onclose = this.onclose
    this.socket.onmessage = this.onmessage
    this.socket.onerror = this.onerror
  }

  close () {
    this.onclose({})
  }
}

export default SocketHandler
