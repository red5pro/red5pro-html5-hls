/* global videojs */
'use strict'

class VideoHandler {
  constructor (video, holder) {
    this.video = video
    this.clone = this.video.cloneNode(true)
    this.holder = holder
    this.videojs = null
    this.hlsSource = null
  }

  addSource (src, type) {
    let self = this
    return new Promise((resolve, reject) => {
      if (self.hlsSource) {
        self.hlsSource.remove()
        self.hlsSource = null
      }

      if (self.videojs) {
        self.video.remove()
        self.videojs.dispose()
        self.videojs = null
        self.video = self.clone.cloneNode(true)
        self.holder.appendChild(self.video)
      }

      let fallback = document.getElementById('fallback-source')

      self.hlsSource = document.createElement('source')
      self.hlsSource.src = src
      self.hlsSource.type = type
      self.hlsSource.crossOrigin = 'anonymous'
      fallback.parentNode.insertBefore(self.hlsSource, fallback)

      self.videojs = videojs(self.video, {}, function () {
        resolve()
      })
    })
  }

  canPlayType (type) {
    return this.video.canPlayType(type)
  }

  onOptionsUpdate (url) {
    return this.addSource(url, VideoHandler.HLSType())
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

export default VideoHandler
