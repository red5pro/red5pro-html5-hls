'use strict'

import VideoHandler from './src/video-handler.js'

class DemoVideoHandler extends VideoHandler {
  constructor (formHandler) {
    const vid = document.getElementById('demo-vid')
    super(vid, vid.parentNode)

    this.videoID = 'demo-vid'
    this.formHandler = formHandler
    this.preview = document.getElementById('stream-url-preview')
    this.rotation = 0
    this.vWidth = 0
    this.vHeight = 0

    this.formHandler.addEventListener('inputchange', this.onInputChange.bind(this))
    this.formHandler.addEventListener('change', this.onChange.bind(this))

    this.onRAF(0)
  }

  //  As the form is being typed in, update our preview URL
  onInputChange (obj) {
    const url = obj.url.replace(/\/$/, '')

    this.preview.innerHTML = `${url}:${obj.port}/${obj.context}/${obj.stream}.m3u8`
  }

  //  When the form has been submitted, update our video's size and rotation
  onChange (obj) {
    this.onOptionsUpdate(this.preview.innerHTML)
      .then(() => this.onRAF())
  }

  //  Update video size and rotation every frame, as necessary
  onRAF (dt) {
    this.updateVideoSize()
    this.rotate()

    if (dt !== undefined) {
      window.requestAnimationFrame(this.onRAF.bind(this))
    }
  }

  get transformStyles () {
    //  A prefixed list of Javascript formatted transform style properties
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
    const vid = document.getElementById(this.videoID)
    const vidRect = vid.getBoundingClientRect()
    const holderRect = this.holder.getBoundingClientRect()

    return (isPortrait ? vidRect.height : vidRect.width) !== holderRect.width
  }

  //  The rotation is "dirty" if the applied rotation styling does not match the current rotation
  get rotationIsDirty () {
    if (!this.videojs) return false

    const vid = this.videojs.el().querySelector('video')
    const vidStyles = this.transformStyles.map(x => vid.style[x] || null)
    const notNullVidStyles = vidStyles.filter(x => x !== null)
    const style = '' + notNullVidStyles.pop()
    const currentRotation = +(style.replace(/rotate\D+(\d+)/i, '$1'))

    return currentRotation !== this.rotation
  }

  updateVideoAndContainerStyling (container, vid, width) {
    const isPortrait = Math.abs(this.rotation) === 90
    //  Determine the aspect ratio, falling back to 16:9
    const aspectRatio = (this.vWidth || 16.0) / (this.vHeight || 9.0)
    const height = Math.round(width / aspectRatio)
    const offset = isPortrait ? (width - height) / 2.0 : 0

    container.style.width = `${isPortrait ? height : width}px`
    container.style.height = `${isPortrait ? width : height}px`
    vid.style.width = `${width}px`
    vid.style.height = `${height}px`
    vid.style.top = `${offset}px`
    vid.style.left = `-${offset}px`
  }

  updateVideoSize () {
    if (this.sizeIsDirty) {
      const container = document.getElementById(this.videoID)
      const vid = container.querySelector('video')
      const width = this.holder.getBoundingClientRect().width

      this.updateVideoAndContainerStyling(container, vid, width)

      //  Remove "embed-responsive" and "embed-responsive-16by9" classes applied to the fallback video
      const containerParent = container.parentNode
      const clzzes = containerParent.className
      containerParent.className = clzzes.replace(/embed-responsive(?:-16by9)?/g, '').trim()
    }
  }

  rotate () {
    if (this.rotationIsDirty) {
      const vid = this.videojs.el().querySelector('video')

      //  Hide any overflow on our parent (the video.js main <div>)
      vid.parentNode.style.overflow = 'hidden'

      //  Apply the transform styling to any applicable properties
      this.transformStyles.forEach(x => {
        if (vid.style[x] !== undefined) vid.style[x] = `rotate(${this.rotation}deg)`
      })
    }
  }
}

export default DemoVideoHandler
