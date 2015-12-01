/* global WebSocket */
'use strict'

import CustomEventTarget from './custom-event-target.js'

//  Websocket communication skeleton
class SocketHandler extends CustomEventTarget {
  constructor () {
    super()

    this.url = ''
    this.context = ''
    this.stream = ''
    this.socket = null
  }

  onopen (e) {
    this.dispatchEvent('open', {evt: e})
  }

  onclose (e) {
    this.dispatchEvent('close', {evt: e})
    this.socket = null
  }

  onmessage (e) {
    let d = JSON.parse(e.data || {})

    if (d.name) {
      this.dispatchEvent('message', {evt: e, name: d.name, data: d.data})
    } else if (d.ping) {
      this.dispatchEvent('ping', {evt: e, timestamp: d.ping})
    }
  }

  onerror (e) {
    this.dispatchEvent('error', {evt: e})
  }

  connect () {
    this.socket = new WebSocket(`${this.url}${this.context}${this.stream}`)

    this.socket.onopen = this.onopen.bind(this)
    this.socket.onclose = this.onclose.bind(this)
    this.socket.onmessage = this.onmessage.bind(this)
    this.socket.onerror = this.onerror.bind(this)
  }

  close () {
    this.onclose({})
  }
}

export default SocketHandler
