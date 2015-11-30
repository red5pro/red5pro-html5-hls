'use strict'

import SocketHandler from './src/socket-handler.js'

class DemoSocketHandler extends SocketHandler {
  constructor (formHandler, videoHandler) {
    super()

    this.formHandler = formHandler
    this.videoHandler = videoHandler
    this.preview = document.getElementById('stream-websocket-url-preview')

    this.formHandler.addEventListener('inputchange', this.onInputChange.bind(this))
    this.formHandler.addEventListener('change', this.onChange.bind(this))

    this.addEventListener('open', this.onSocketOpen.bind(this))
    this.addEventListener('close', this.onSocketClose.bind(this))
    this.addEventListener('error', this.onSocketError.bind(this))
    this.addEventListener('message', this.onSocketMessage.bind(this))
    this.addEventListener('ping', this.onSocketPing.bind(this))
  }

  onInputChange (obj) {
    const url = obj.url.replace(/\/$/, '')
    const socketURL = url.replace(/^https?:\/\//i, '')

    this.preview.innerHTML = `ws://${socketURL}:${obj.websocketPort}/metadata/${obj.context}/${obj.stream}`
  }

  onChange (obj) {
    const url = obj.url.replace(/\/$/, '').replace(/^(?!http(?:s)?:\/\/)(.)/i, 'http://$1')
    const socketURL = url.replace(/^https?:\/\//i, '')

    if (this.socket) {
      this.socket.close()
    }

    this.url = `ws://${socketURL}:${obj.websocketPort}/metadata`
    this.context = `/${obj.context}`
    this.stream = `/${obj.stream}`

    this.connect()
  }

  onSocketOpen (obj) {
    console.log('Socket opened')
  }

  onSocketClose (obj) {
    console.log('Socket closed')
  }

  onSocketError (obj) {
    console.log(`Socket errored: ${JSON.stringify(obj)}`)
  }

  onSocketMessage (obj) {
    console.log(`Socket message: ${obj.name} - ${JSON.stringify(obj.data) || obj.data}`)
    if (obj.name === 'onMetaData') {
      this.videoHandler.rotation = obj.data.orientation || 0
      this.videoHandler.vWidth = obj.data['v-width'] || this.videoHandler.holder.getBoundingClientRect().width
      this.videoHandler.vHeight = obj.data['v-height'] || this.videoHandler.holder.getBoundingClientRect().height
    }
  }

  onSocketPing (obj) {
    console.log(`Ping! ${new Date(obj.timestamp)}`)
  }
}

export default DemoSocketHandler
