/* global XMLHttpRequest */
'use strict'

import VideoHandler from './src/video-handler.js'

//  Helper class for caching video size & finding out if it has changed
class DemoVideoSizeCache {
  constructor () {
    this.width = 0
    this.height = 0
    this.rawWidth = {
      previous: 0,
      current: 0
    }
    this.rawHeight = {
      previous: 0,
      current: 0
    }
  }

  updateSize (w, h) {
    this.width = w
    this.height = h
  }

  updateRawSize (w, h) {
    [this.rawWidth, this.rawHeight].forEach((x) => {
      x.previous = x.current
    })
    this.rawWidth.current = w
    this.rawHeight.current = h
  }

  get isDirty () {
    return [this.rawWidth, this.rawHeight].reduce((prev, curr) => {
      return prev || (curr.current !== curr.previous)
    }, false)
  }

  get videoWidth () {
    return this.rawWidth.current || this.width
  }

  get videoHeight () {
    return this.rawHeight.current || this.height
  }
}

//  Helper class to fix the constant loading spinner on video.js for the Flash fallback
class DemoVideoLoaderFixer {
  constructor (limit = 5000) {
    this.start = 0
    this.time = 0
    this.limit = limit
    this.isShowing = false
  }

  //  The loading spinner is deemed hidden if it has the class "vjs-hidden", has a display of "none", or visibility of "hidden"
  isHidden (spinner) {
    if (!spinner) return false

    const hasVjsHidden = /vjs-hidden/i.test(spinner.className)
    const display = spinner.style.display
    const visibility = spinner.style.visibility
    const hasBeenHidden = display.toLowerCase() === 'none' || visibility.toLowerCase() === 'hidden'

    return hasVjsHidden || hasBeenHidden
  }

  //  If the spinner is showing, hide it after 5 seconds (prevents indefinite loading spinner...)
  update (vjs, dt) {
    if (vjs) {
      const el = vjs.el()
      const spinner = el.querySelector('.vjs-loading-spinner')

      if (spinner && !this.isHidden(spinner)) {
        this.isShowing = true
        this.start = this.start || dt
        this.time = (dt - this.start)

        if (this.time > this.limit) {
          const clzzes = spinner.className
          spinner.className = `${clzzes} vjs-hidden`
        }
        return
      }
    }

    this.isShowing = false
    this.time = 0
    this.start = 0
  }
}

class DemoVideoHandler extends VideoHandler {
  constructor (formHandler) {
    const vid = document.getElementById('demo-vid')
    super(vid, vid.parentNode)

    this.videoID = 'demo-vid'
    this.formHandler = formHandler
    this.preview = document.getElementById('stream-url-preview')
    this.rotation = 0
    this.sizeCache = new DemoVideoSizeCache()
    this.loaderFixer = new DemoVideoLoaderFixer()

    this.formHandler.addEventListener('inputchange', this.onInputChange.bind(this))
    this.formHandler.addEventListener('change', this.onChange.bind(this))

    this.onRAF(0)
  }

  //  Override the video.js error handling
  onVideoJSError (e) {
    this.formHandler.setButtonState('danger')
    console.warn(JSON.stringify(e))
  }

  //  Format the form values into an appropriate value for display or use
  cleanURL (obj) {
    const url = obj.url.replace(/\/$/, '')

    if (!obj.isCluster) {
      return /^http/i.test(obj.stream) ? obj.stream : `${url}:${obj.port}/${obj.context}/${obj.stream}.m3u8`
    } else {
      return `${url}:${obj.port}/cluster`
    }
  }

  //  As the form is being typed in, update our preview URL
  onInputChange (obj) {
    this.preview.innerHTML = obj.isVOD ? obj.stream : this.cleanURL(obj)
  }

  //  When the form has been submitted, update our video's size and rotation
  onChange (obj) {
    let url = this.cleanURL(obj)
    if (obj.isCluster) {
      /*
      1.  Retrieve the stream IP from the Red5 Pro Cluster origin
        i.  Catch and handle any errors that happen
      2.  Subscribe to the stream
        i.  Catch and handle any errors that happen
      3.  Update the video and it's container's styling
        i.  Catch any other errors that may happen
      */
      this.retrieveStreamIP(obj)
        .catch((status, response) => {
          this.formHandler.setButtonState('danger')
          console.warn(`Error when attempting to get the cluster edge IP: ${status} & ${response}`)
        })
        .then(x => this.subscribeToStream(x))
        .catch((x) => {
          this.formHandler.setButtonState('danger')
          throw x
        })
        .then(() => this.onRAF(0))
        .catch((...args) => console.log(JSON.stringify(args)))
    } else {
      /*
      1.  Subscribe to the stream
        i.  Catch and handle any errors that happen
      2.  Update the video and it's container's styling
        i.  Catch any other errors that may happen
      */
      if (obj.isVOD) {
        url = obj.stream
      }

      this.subscribeToStream(url)
        .catch((x) => {
          this.formHandler.setButtonState('danger')
          throw x
        })
        .then(() => this.onRAF(0))
        .catch((...args) => console.log(JSON.stringify(args)))
    }
  }

  //  When subscribing to a Red5 Pro cluster, we retrieve the stream's IP before subscribing
  retrieveStreamIP (obj) {
    const self = this
    const url = obj.url.replace(/\/$/, '')
    const clusterURL = `${url}:${obj.port}/cluster`

    return new Promise((resolve, reject) => {
      let req = new XMLHttpRequest()

      req.onreadystatechange = function () {
        if (this.readyState === 4) {
          if (this.status >= 200 && this.status < 400) {
            //  When XHR is done and we receive a good status code, we'll get something like the following back:
            //  123.456.789.100:1234

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

      req.open('GET', clusterURL, true)
      req.send()
    })
  }

  subscribeToStream (url) {
    return this.addSource(url, 'application/x-mpegURL')
  }

  //  Update video size and rotation every frame, as necessary
  onRAF (dt) {
    const _videoWidth = this.videojs ? this.videojs.videoWidth() : 0
    const _videoHeight = this.videojs ? this.videojs.videoHeight() : 0

    this.sizeCache.updateRawSize(_videoWidth, _videoHeight)

    this.loaderFixer.update(this.videojs, dt || 0)

    if (this.isDirty) {
      this.updateVideoSize()
      this.rotateVideo()
    }

    window.requestAnimationFrame(this.onRAF.bind(this))
  }

  //  A prefixed list of Javascript formatted transform style properties
  get transformStyles () {
    return [
      'webkitTransform',
      'mozTransform',
      'msTransform',
      'oTransform',
      'transform'
    ]
  }

  //  The size is "dirty" if the corresponding values (video width & holder width for landscape, video height & holder width for portrait) don't match
  get sizeIsDirty () {
    const isPortrait = Math.abs(this.rotation) === 90
    const container = document.getElementById(this.videoID)
    const containerRect = container.getBoundingClientRect()
    const holderRect = this.holder.getBoundingClientRect()

    return ((isPortrait ? containerRect.height : containerRect.width) !== holderRect.width) || this.sizeCache.isDirty
  }

  //  The rotation is "dirty" if the applied rotation styling does not match the current rotation
  get rotationIsDirty () {
    const vid = this.videoElement
    if (vid) {
      const vidStyles = this.transformStyles.map(x => vid.style[x] || null)
      const notNullVidStyles = vidStyles.filter(x => x !== null)
      const style = '' + notNullVidStyles.pop()
      const currentRotation = +(style.replace(/rotate\D+(\d+)/i, '$1'))

      return currentRotation !== this.rotation
    }
    return false
  }

  get isDirty () {
    return this.rotationIsDirty || this.sizeIsDirty
  }

  //  Apply styling to the video and it's container
  updateVideoAndContainerStyling (container) {
    const vid = this.videoElement
    const isPortrait = Math.abs(this.rotation) === 90
    const _videoWidth = this.sizeCache.videoWidth
    const _videoHeight = this.sizeCache.videoHeight
    //  Determine the aspect ratio, falling back to 16:9
    const aspectRatio = (_videoWidth || 16.0) / (_videoHeight || 9.0)
    const width = this.holder ? this.holder.getBoundingClientRect().width : 0
    const height = Math.round(width / aspectRatio)
    const offset = isPortrait ? (width - height) / 2.0 : 0

    container.style.width = `${isPortrait ? height : width}px`
    container.style.height = `${isPortrait ? width : height}px`

    if (vid) {
      vid.style.width = `${width}px`
      vid.style.height = `${height}px`
      vid.style.top = `${offset}px`
      vid.style.left = `-${offset}px`
    }
  }

  get videoElement () {
    const container = document.getElementById(this.videoID)
    return container.querySelector('video') || container.querySelector('object')
  }

  //  Ensure the video is sized appropriately for the screen (video.js's "fluid" class doesn't work as expected)
  updateVideoSize () {
    const container = document.getElementById(this.videoID)

    this.updateVideoAndContainerStyling(container)

    //  Remove "embed-responsive" and "embed-responsive-16by9" classes applied to the fallback video
    const containerParent = container.parentNode
    const clzzes = containerParent.className
    containerParent.className = clzzes.replace(/embed-responsive(?:-16by9)?/g, '').trim()
  }

  //  Present the video in the appropriate orientation
  rotateVideo () {
    const container = document.getElementById(this.videoID)
    const vid = this.videoElement

    //  Hide any overflow on our parent (the video.js main <div>)
    container.style.overflow = 'hidden'

    if (vid) {
      //  Apply the transform styling to any applicable properties
      this.transformStyles.forEach(x => {
        vid.style[x] = `rotate(${this.rotation}deg)`
      })
    }
  }

  //  Our DemoSocketHandler will call this with the data it receives
  handleMetadataUpdate (metadata) {
    if (!metadata) return

    const holderRect = this.holder.getBoundingClientRect()
    const w = metadata['v-width'] || holderRect.width
    const h = metadata['v-height'] || holderRect.height
    this.rotation = metadata.orientation || 0
    this.sizeCache.updateSize(w, h)
  }
}

export default DemoVideoHandler
