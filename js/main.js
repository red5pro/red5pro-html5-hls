/* global videojs */
require('babel-polyfill')
;(function () {
  'use strict'

  let FormHandler = require('./form-handler.js')
  let VideoHandler = require('./video-handler.js')

  function onDomContentLoaded (e) {
    let form = document.getElementById('stream-settings-form')
    let submit = document.getElementById('stream-settings-form-submit')

    let formHandler = new FormHandler(form, submit) // eslint-disable-line no-unused-vars

    let video = document.getElementById('demo-vid')
    let videoHandler = new VideoHandler(video) // eslint-disable-line no-unused-vars

    videoHandler.addSource('http://54.86.109.160:5080/live/hls/stream.m3u8', VideoHandler.HLSType())
      .then(() => {
        videojs('demo-vid', {}, function () {
          try {
            this.play()
          } catch (e) {
            console.log('Cannot autoplay')
          }
        })
      })
  }

  window.addEventListener('DOMContentLoaded', onDomContentLoaded)
})()
