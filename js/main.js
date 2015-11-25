import FormHandler from './form-handler.js'
import VideoHandler from './video-handler.js'
import SocketHandler from './socket-handler.js'

require('babel-polyfill')

;(function () {
  'use strict'

  function onDomContentLoaded (e) {
    let form = document.getElementById('stream-settings-form')
    let submit = document.getElementById('stream-settings-form-submit')

    let urlPreview = document.getElementById('stream-url-preview')
    let websocketUrlPreview = document.getElementById('stream-websocket-url-preview')

    let formHandler = new FormHandler(form, submit)

    let video = document.getElementById('demo-vid')
    let videoHandler = new VideoHandler(video, video.parentNode)

    let socketHandler = new SocketHandler()

    socketHandler.addEventListener('open', (obj) => {
      console.log('Socket connected')
    })

    socketHandler.addEventListener('close', (obj) => {
      console.log('Socket closed')
    })

    socketHandler.addEventListener('error', (obj) => {
      console.log('Socket errored')
    })

    socketHandler.addEventListener('message', (obj) => {
      console.log(`Socket message: ${obj.name} - ${obj.data}`)
    })

    socketHandler.addEventListener('ping', (e) => {
      console.log(`Ping! ${new Date(e.timestamp)}`)
    })

    socketHandler.url = '54.86.109.160:6262/metadata'
    socketHandler.context = '/live'
    socketHandler.stream = '/stream'

    socketHandler.connect()

    // videoHandler.addSource('http://54.86.109.160:5080/live/hls/stream.m3u8', VideoHandler.HLSType())

    formHandler.addEventListener('inputchange', (e) => {
      let url = e.url.replace(/\/$/, '')

      let socketURL = url.replace(/^https?:\/\//i, '')
      websocketUrlPreview.innerHTML = `ws://${socketURL}:${e.websocketPort}/metadata/${e.context}/${e.stream}`

      let videoURL = `${url}:${e.port}/${e.context}/${e.stream}.m3u8`
      urlPreview.innerHTML = `${videoURL}`
    })

    formHandler.addEventListener('change', (e) => {
      let url = e.url.replace(/\/$/, '')

      socketHandler.close()

      let socketURL = url.replace(/^https?:\/\//i, '')
      socketHandler.url = `${socketURL}:${e.websocketPort}/metadata`
      socketHandler.context = `/${e.context}`
      socketHandler.stream = `/${e.stream}`

      socketHandler.connect()

      let videoURL = `${url}:${e.port}/${e.context}/${e.stream}.m3u8`
      videoHandler.onOptionsUpdate(videoURL)
    })
  }

  window.addEventListener('DOMContentLoaded', onDomContentLoaded)
})()
