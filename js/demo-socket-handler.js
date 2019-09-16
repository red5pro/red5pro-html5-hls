/*
Copyright © 2015 Infrared5, Inc. All rights reserved.

The accompanying code comprising examples for use solely in conjunction with Red5 Pro (the "Example Code") 
is  licensed  to  you  by  Infrared5  Inc.  in  consideration  of  your  agreement  to  the  following  
license terms  and  conditions.  Access,  use,  modification,  or  redistribution  of  the  accompanying  
code  constitutes your acceptance of the following license terms and conditions.

Permission is hereby granted, free of charge, to you to use the Example Code and associated documentation 
files (collectively, the "Software") without restriction, including without limitation the rights to use, 
copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit 
persons to whom the Software is furnished to do so, subject to the following conditions:

The Software shall be used solely in conjunction with Red5 Pro. Red5 Pro is licensed under a separate end 
user  license  agreement  (the  "EULA"),  which  must  be  executed  with  Infrared5,  Inc.   
An  example  of  the EULA can be found on our website at: https://account.red5pro.com/assets/LICENSE.txt.

The above copyright notice and this license shall be included in all copies or portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,  INCLUDING  BUT  
NOT  LIMITED  TO  THE  WARRANTIES  OF  MERCHANTABILITY, FITNESS  FOR  A  PARTICULAR  PURPOSE  AND  
NONINFRINGEMENT.   IN  NO  EVENT  SHALL INFRARED5, INC. BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, 
WHETHER IN  AN  ACTION  OF  CONTRACT,  TORT  OR  OTHERWISE,  ARISING  FROM,  OUT  OF  OR  IN CONNECTION 
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
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
    const url = obj.isVOD ? obj.stream : obj.url.replace(/\/$/, '')
    const socketURL = url.replace(/^https?:\/\//i, '')

    this.preview.innerHTML = obj.isVOD ? `ws://${socketURL}` : `ws://${socketURL}:${obj.websocketPort}/metadata/${obj.context}/${obj.stream}`
  }

  //  When the form has been submitted, close (if necessary) and reconnect our websocket
  onChange (obj) {
    if (obj.isVOD) {
      return
    }

    const url = /^http/i.test(obj.stream) ? obj.stream : obj.url.replace(/\/$/, '').replace(/^(?!http(?:s)?:\/\/)(.)/i, 'http://$1')
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
