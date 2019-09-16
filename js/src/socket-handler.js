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
    this.socket.close()
    this.onclose({})
  }
}

export default SocketHandler
