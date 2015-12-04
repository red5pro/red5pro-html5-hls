/* global videojs */
'use strict'

class VideoHandler {
  constructor (video, holder) {
    this.video = video
    this.clone = this.video.cloneNode(true)
    this.holder = holder
    this.videojs = null
    this.hlsSource = null

    this.hasAssignedEventListeners = false
  }

  //  Assign all video.js listeners (those which are listed on http://docs.videojs.com/docs/api/player.html#events)
  addVideoJSEventListeners () {
    if (this.hasAssignedEventListeners) return

    this.videojs.on('error', this.onVideoJSError.bind(this))
    this.videojs.on('loadeddata', this.onVideoJSLoadedData.bind(this))
    this.videojs.on('loadedmetadata', this.onVideoJSLoadedMetadata.bind(this))
    this.videojs.on('timeupdate', this.onVideoJSTimeUpdate.bind(this))
    this.videojs.on('useractive', this.onVideoJSUserActive.bind(this))
    this.videojs.on('userinactive', this.onVideoJSUserInactive.bind(this))
    this.videojs.on('volumechange', this.onVideoJSVolumeChange.bind(this))
    this.hasAssignedEventListeners = true
  }

  //  Remove all video.js listeners (those which are listed on http://docs.videojs.com/docs/api/player.html#events)
  removeVideoJSEventListeners () {
    if (!this.hasAssignedEventListeners) return

    this.videojs.off('error', this.onVideoJSError.bind(this))
    this.videojs.off('loadeddata', this.onVideoJSLoadedData.bind(this))
    this.videojs.off('loadedmetadata', this.onVideoJSLoadedMetadata.bind(this))
    this.videojs.off('timeupdate', this.onVideoJSTimeUpdate.bind(this))
    this.videojs.off('useractive', this.onVideoJSUserActive.bind(this))
    this.videojs.off('userinactive', this.onVideoJSUserInactive.bind(this))
    this.videojs.off('volumechange', this.onVideoJSVolumeChange.bind(this))
    this.hasAssignedEventListeners = false
  }

  //  Cleanup our HLS <source> if it exists
  cleanupHLS () {
    if (this.hlsSource) {
      this.hlsSource.remove()
    }

    this.hlsSource = null
  }

  //  Cleanup our video.js implementation
  cleanupVideoJS () {
    if (this.videojs) {
      this.video.remove()
      this.removeVideoJSEventListeners()
      this.videojs.dispose()
      //  This recreates our original <video> element and appends it to the original containing element
      this.video = this.clone.cloneNode(true)
      this.holder.appendChild(this.video)
    }

    this.videojs = null
  }

  //  Add a new <source> for our <video> and startup video.js
  addSource (src, type) {
    let self = this
    return new Promise((resolve, reject) => {
      //  If we have a current <source> element, remove it
      self.cleanupHLS()

      //  If video.js has already been instantiated, dispose of it
      self.cleanupVideoJS()

      function createSource (_src, _type) {
        let sourceEl = document.createElement('source')
        sourceEl.src = _src
        sourceEl.type = _type
        return sourceEl
      }

      function insertSourceInto (_src, _type, _parent) {
        let sourceEl = createSource(_src, _type)
        if (_parent.firstChild) {
          _parent.insertBefore(sourceEl, _parent.firstChild)
        } else {
          _parent.appendChild(sourceEl)
        }
        return sourceEl
      }

      //  Create the new <source> element
      self.hlsSource = insertSourceInto(src, type, self.video)

      //  Instantiate video.js
      const opts = {
        techOrder: ['html5', 'flash']
      }

      self.videojs = videojs(self.video, opts, function (...args) {
        self.addVideoJSEventListeners()
        resolve(...args)
      })
    })
  }

  onVideoJSError (e) {}

  onVideoJSLoadedData () {}

  onVideoJSLoadedMetadata () {}

  onVideoJSTimeUpdate () {}

  onVideoJSUserActive () {}

  onVideoJSUserInactive () {}

  onVideoJSVolumeChange () {}
}

export default VideoHandler
