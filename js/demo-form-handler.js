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
/* global Event XMLHttpRequest */
'use strict'

import FormHandler from './src/form-handler.js'

function hasClass (el, clz) {
  if (el.classList) {
    return el.classList.contains(clz)
  } else {
    return el.className.indexOf(clz) > -1
  }
}

function addClass (el, clz) {
  if (!hasClass(el, clz)) {
    if (el.classList) {
      el.classList.add(clz)
    } else {
      el.className += clz
    }
  }
}

function removeClass (el, clz) {
  if (hasClass(el, clz)) {
    if (el.classList) {
      el.classList.remove(clz)
    } else {
      const clzzes = el.className
      const idx = clzzes.indexOf(clz)
      const removed = clzzes.substring(0, idx) + clzzes.substring(idx + clz.length)
      const noSpaces = removed.replace(/\s+/g, ' ')

      el.className = noSpaces
    }
  }
}

class DemoFormHandler extends FormHandler {
  constructor (form, submit) {
    super(form, submit)

    this.ipInput = document.querySelector('#stream-settings-url-or-ip')
    this.portInput = document.querySelector('#stream-settings-port')
    this.contextInput = document.querySelector('#stream-settings-context')

    this.clusterCheckbox = document.querySelector('#stream-settings-cluster')
    this.vodCheckbox = document.querySelector('#stream-settings-vod')

    this.vodSelect = document.querySelector('#stream-settings-vod-stream')

    this.vodGroup = document.querySelector('#stream-settings-vod-group')
    this.streamGroup = document.querySelector('#stream-settings-stream-group')

    this.labelEls = [
      'stream-settings-url-or-ip-label',
      'stream-url-preview-label'
    ].map((id) => document.getElementById(id))

    this.onClusterChange = this.onClusterChange.bind(this)
    this.onVODChange = this.onVODChange.bind(this)

    this.clusterCheckbox.addEventListener('change', this.onClusterChange)
    this.vodCheckbox.addEventListener('change', this.onVODChange)

    addClass(this.vodGroup, 'hidden')

    this.ipInput.addEventListener('inputchange', this.retrieveStreamList.bind(this))
    this.portInput.addEventListener('inputchange', this.retrieveStreamList.bind(this))
    this.contextInput.addEventListener('inputchange', this.retrieveStreamList.bind(this))
  }

  //  Certain elements should be labeled for "Red5 Pro Cluster" and not "Stream"
  formatForCluster (el) {
    let val = el.innerHTML
    el.innerHTML = val.replace(/stream/ig, 'Red5 Pro Cluster')
  }

  //  Certain elements should be labeled for "Stream" and not "Red5 Pro Cluster"
  formatForStream (el) {
    let val = el.innerHTML
    el.innerHTML = val.replace(/red5 pro cluster/ig, 'Stream')
  }

  //  Toggle the labels of some items
  onClusterChange (e) {
    const isChecked = e.currentTarget.checked
    const formatFn = isChecked ? this.formatForCluster : this.formatForStream

    removeClass(this.streamGroup, 'hidden')
    if (isChecked) {
      if (this.vodCheckbox.checked) {
        this.vodCheckbox.checked = false
        this.vodCheckbox.dispatchEvent(new Event('change'))
      }
    } else {
      if (this.vodCheckbox.checked) {
        addClass(this.streamGroup, 'hidden')
      }
    }

    this.labelEls.forEach(formatFn)
  }

  //  Toggle cluster checkbox and
  onVODChange (e) {
    const isChecked = e.currentTarget.checked

    if (isChecked) {
      if (this.clusterCheckbox.checked) {
        this.clusterCheckbox.checked = false
        this.clusterCheckbox.dispatchEvent(new Event('change'))
      }
      addClass(this.streamGroup, 'hidden')
      removeClass(this.vodGroup, 'hidden')
      this.retrieveStreamList()
    } else {
      removeClass(this.streamGroup, 'hidden')
      addClass(this.vodGroup, 'hidden')
    }
  }

  //  Gather the available vod file info via playlists servlet
  retrieveStreamList (e) {
    const self = this
    const ip = this.ipInput.value || 'localhost'
    const port = this.portInput.value || '5080'
    const context = this.contextInput.value || 'live'
    const baseURL = `http://${ip}:${port}/${context}/`
    const protocol = window.location.protocol.replace(/:$/, '')
    const playlistsServletURL = `${protocol}://${ip}:${port}/${context}/playlists`

    return new Promise((resolve, reject) => {
      let req = new XMLHttpRequest()

      req.onreadystatechange = function () {
        if (this.readyState === 4) {
          if (this.status >= 200 && this.status < 400) {
            //  When XHR is done and we receive a good status code, we'll get something like the following back:
            // {"playlists":[
            //     {"name":"myStream.m3u8","lastModified":1473438521000,"length":213,"url":"streams/hls/myStream/myStream.m3u8"},
            //     {"name":"stream12345.m3u8","lastModified":1474309296000,"length":136,"url":"streams/hls/stream12345/stream12345.m3u8"}
            // ]}
            // a playlists url originating from S3 will be a full url ex. https://s3.amazonaws.com/stream123/stream123.m3u8

            // here we need to create 'option' elements and add them to the 'select' dropdown
            // <option name="${json.playlists[x].name}">${json.playlists[x].url}</option>

            const response = JSON.parse(this.response)
            const playlists = response.playlists || []
            const options = playlists.map(function (item) {
              const url = /^http/i.test(item.url) ? item.url : `${baseURL}${item.url}`
              return {
                name: item.name,
                url: url
              }
            })
            while (self.vodSelect.options.length) {
              self.vodSelect.remove(0)
            }
            const frag = document.createDocumentFragment()
            options.forEach(function (item, idx) {
              const option = document.createElement('option')
              if (idx === 0) {
                option.defaultSelected = true
                option.selected = true
              }
              option.text = item.name
              option.label = item.name
              option.value = item.url
              frag.appendChild(option)
            })

            self.vodSelect.appendChild(frag)
            self.dispatchEvent('inputchange', self.changeObject)

            resolve(this.status, this.response)
          } else {
            reject(this.status, this.response)
          }
        }
      }

      req.onerror = function () {
        reject(this.status, this.response)
      }

      req.onabort = function () {
        reject(this.status, this.response)
      }

      req.ontimeout = function () {
        reject(this.status, `Timed out! ${this.response}`)
      }

      req.timeout = 15000

      req.open('GET', playlistsServletURL, true)
      req.send()
    })
  }

}

export default DemoFormHandler
