'use strict'

import FormHandler from './src/form-handler.js'

class DemoFormHandler extends FormHandler {
  constructor (form, submit) {
    super(form, submit)

    this.clusterCheckbox = document.getElementById('stream-settings-cluster')
    this.labelEls = [
      'stream-settings-url-or-ip-label',
      'stream-url-preview-label'
    ].map((id) => document.getElementById(id))

    this.clusterCheckbox.addEventListener('change', this.onClusterChange.bind(this))
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
    const formatFn = e.currentTarget.checked ? this.formatForCluster : this.formatForStream

    this.labelEls.forEach(formatFn)
  }

  //  Gather the available vod file info via playlist servlet
  retrieveStreamList (obj) {
    const self = this
    const url = obj.url.replace(/\/$/, '')
    // the "context" here should replace "vod"
    const playlistServletURL = `${url}:5080/vod/playlists`
    
    return new Promise((resolve, reject) => {
      let req = new XMLHttpRequest()

      req.onreadystatechange = function () {
        if (this.readyState === 4) {
          if (this.status >= 200 && this.status < 400) {
            //  When XHR is done and we receive a good status code, we'll get something like the following back:
            // {"playlist":[
            //     {"name":"myStream.m3u8","lastModified":1473438521000,"length":213,"url":"streams/hls/myStream/myStream.m3u8"},
            //     {"name":"stream12345.m3u8","lastModified":1474309296000,"length":136,"url":"streams/hls/stream12345/stream12345.m3u8"}
            // ]}

            //  We only need the IP range of that, so let's strip the rest
            const streamIP = this.response.replace(/:\d+$/, '')

            //  Format the stream URL
            const protocol = window.location.protocol.replace(/:$/, '')
            let streamObj = Object.create(obj)
            streamObj.url = `${protocol}://${streamIP}`
            streamObj.isCluster = false
            resolve(self.cleanURL(streamObj))
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

      req.open('GET', playlistServletURL, true)
      req.send()
    })
  }

}

export default DemoFormHandler
