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
      const noSpaces = remove.replace(/\s+/g, ' ')

      el.className = noSpaces
    }
  }
}

class DemoFormHandler extends FormHandler {
  constructor (form, submit) {
    super(form, submit)

    this.ipInput = document.querySelector('#stream-settings-url-or-ip-label')
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
    const context = this.contextInput.value || 'vod'
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
            const optionEls = options.forEach(function (item, idx) {
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
