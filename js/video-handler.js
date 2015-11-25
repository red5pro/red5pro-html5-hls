'use strict'

class VideoHandler {
  constructor (video) {
    this.video = video
  }

  addSource (src, type) {
    return new Promise((resolve, reject) => {
      let source = document.createElement('source')
      source.src = src
      source.type = type
      this.video.appendChild(source)
      resolve()
    })
  }

  canPlayType (type) {
    return this.video.canPlayType(type)
  }

  static HLSType () {
    let appVersion = navigator.appVersion
    let isChrome = /chrome/i.test(appVersion)
    let isSafari = /safari/i.test(appVersion)

    if (isChrome) return 'application/x-mpegURL'
    else if (isSafari) return 'application/vnd.apple.mpegURL'
    return 'application/x-mpegURL'
  }
}

module.exports = VideoHandler
