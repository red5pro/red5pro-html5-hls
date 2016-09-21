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

    //  These are the basic websocket events
    this.addEventListener('open', this.onSocketOpen.bind(this))
    this.addEventListener('close', this.onSocketClose.bind(this))
    this.addEventListener('error', this.onSocketError.bind(this))
    this.addEventListener('message', this.onSocketMessage.bind(this))

    //  This is a custom "message" event, separated out as it would be noisy otherwise
    this.addEventListener('ping', this.onSocketPing.bind(this))
  }

  //  As the form is being typed in, update our preview URL
  onInputChange (obj) {
    const url = obj.url.replace(/\/$/, '')
    const socketURL = url.replace(/^https?:\/\//i, '')

    this.preview.innerHTML = obj.isVOD ? `ws://${(obj.stream || '').replace(/^https?:\/\//i, '')}` : `ws://${socketURL}:${obj.websocketPort}/metadata/${obj.context}/${obj.stream}`
  }

  //  When the form has been submitted, close (if necessary) and reconnect our websocket
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

  //  Handle the websocket opening
  onSocketOpen (obj) {
    console.log(`Socket ${obj.id} opened`)
  }

  //  Handle the websocket closing
  onSocketClose (obj) {
    console.log(`Socket ${obj.id} closed`)
  }

  //  Handle the websocket erroring
  onSocketError (obj) {
    console.log(`Socket (${obj.id}) errored: ${JSON.stringify(obj)}`)
  }

  //  Handle the websocket messages
  onSocketMessage (obj) {
    console.log(`Socket (${obj.id}) message: ${obj.name} - ${JSON.stringify(obj.data) || obj.data}`)

    if (obj.name === 'onMetaData') {
      this.videoHandler.handleMetadataUpdate(obj.data)
    }
  }

  //  Handle the websocket "ping" messages
  onSocketPing (obj) {
    console.log(`Ping! ${new Date(obj.timestamp)} from socket ${obj.id}`)
  }
}

export default DemoSocketHandler
