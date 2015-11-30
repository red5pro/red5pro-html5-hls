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

  onInputChange (obj) {
    const url = obj.url.replace(/\/$/, '')

    this.preview.innerHTML = `${url}:${obj.port}/${obj.context}/${obj.stream}.m3u8`
  }

  onChange (obj) {
    this.onOptionsUpdate(this.preview.innerHTML)
      .then(() => this.onRAF())
  }

  onRAF (dt) {
    this.updateVideoSize()
    this.rotate()

    if (dt !== undefined) {
      window.requestAnimationFrame(this.onRAF.bind(this))
    }
  }

  get sizeIsDirty () {
    const isPortrait = Math.abs(this.rotation) === 90
    const vid = document.getElementById(this.videoID)
    const vidRect = vid.getBoundingClientRect()
    const holderRect = this.holder.getBoundingClientRect()

    if (isPortrait) return vidRect.height !== holderRect.width

    return vidRect.width !== holderRect.width
  }

  get rotationIsDirty () {
    if (!this.videojs) return false

    const styles = [
      'webkitTransform',
      'mozTransform',
      'msTransform',
      'oTransform',
      'transform'
    ]
    const vid = this.videojs.el().querySelector('video')
    const vidStyles = styles.map(x => vid.style[x] || null)
    const notNullVidStyles = vidStyles.filter(x => x !== null)
    const style = notNullVidStyles.pop()

    return style !== `rotate(${this.rotation}deg)`
  }

  updateVideoSize () {
    if (this.sizeIsDirty) {
      const container = document.getElementById(this.videoID)
      const vid = container.querySelector('video')
      const isPortrait = Math.abs(this.rotation) === 90
      const width = this.holder.getBoundingClientRect().width
      const aspectRatio = (this.vWidth || 16.0) / (this.vHeight || 9.0)
      const height = Math.round(width / aspectRatio)

      if (isPortrait) {
        const halfSizeDifference = (width - height) / 2.0
        container.style.width = `${height}px`
        container.style.height = `${width}px`
        vid.style.width = `${width}px`
        vid.style.height = `${height}px`
        vid.style.top = `${halfSizeDifference}px`
        vid.style.left = `-${halfSizeDifference}px`
      } else {
        container.style.width = `${width}px`
        container.style.height = `${height}px`
        vid.style.width = `${width}px`
        vid.style.height = `${height}px`
        vid.style.top = '0px'
        vid.style.left = '0px'
      }

      const containerParent = container.parentNode
      const clzzes = containerParent.className
      containerParent.className = clzzes.replace(/embed-responsive(?:-16by9)?/g, '').trim()
    }
  }

  rotate () {
    if (!this.videojs) return

    if (this.rotationIsDirty) {
      const vid = this.videojs.el().querySelector('video')
      const rot = `rotate(${this.rotation}deg)`

      vid.parentNode.style.overflow = 'hidden'

      const styles = [
        'webkitTransform',
        'mozTransform',
        'msTransform',
        'oTransform',
        'transform'
      ]

      styles.forEach(x => {
        if (vid.style[x] !== undefined) vid.style[x] = rot
      })
    }
  }
}

export default DemoVideoHandler
