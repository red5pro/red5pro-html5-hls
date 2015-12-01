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
      //  If we have a current <source> element, remove it
      if (self.hlsSource) {
        self.hlsSource.remove()
        self.hlsSource = null
      }

      //  If video.js has already been instantiated, dispose of it
      if (self.videojs) {
        self.video.remove()
        self.videojs.dispose()
        self.videojs = null
        //  This recreates our original <video> element and appends it to the original containing element
        self.video = self.clone.cloneNode(true)
        self.holder.appendChild(self.video)
      }

      let fallback = document.getElementById('fallback-source')

      //  Create the new <source> element
      self.hlsSource = document.createElement('source')
      self.hlsSource.src = src
      self.hlsSource.type = type
      self.hlsSource.crossOrigin = 'anonymous'
      fallback.parentNode.insertBefore(self.hlsSource, fallback)

      //  Instantiate video.js
      self.videojs = videojs(self.video, {}, function () {
        resolve()
      })
    })
  }

  //  Adds a <source> according to the URL passed
  onOptionsUpdate (url) {
    return this.addSource(url, VideoHandler.HLSType())
  }

  //  Get the video source type appropriate to the browser
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
