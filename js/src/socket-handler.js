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
    this.socketID = -1
  }

  onopen (e) {
    this.socketID = Date.now()
    this.dispatchEvent('open', {evt: e, id: this.socketID})
  }

  onclose (e) {
    this.socket = null
    this.dispatchEvent('close', {evt: e, id: this.socketID})
    this.socketID = -1
  }

  onmessage (e) {
    let d = JSON.parse(e.data || {})

    if (d.name) {
      this.dispatchEvent('message', {evt: e, id: this.socketID, name: d.name, data: d.data})
    } else if (d.ping) {
      this.dispatchEvent('ping', {evt: e, id: this.socketID, timestamp: d.ping})
    }
  }

  onerror (e) {
    this.dispatchEvent('error', {evt: e, id: this.socketID})
  }

  connect () {
    if (this.socket) {
      this.close()
    }

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
