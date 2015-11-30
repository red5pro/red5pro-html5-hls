require('babel-polyfill')

import FormHandler from './src/form-handler.js'
import DemoVideoHandler from './demo-video-handler.js'
import DemoSocketHandler from './demo-socket-handler.js'

;(function () {
  'use strict'

  function onDomContentLoaded (e) {
    const x = document.getElementById.bind(document)
    const formHandler = new FormHandler(x('stream-settings-form'), x('stream-settings-form-submit'))
    const videoHandler = new DemoVideoHandler(formHandler)
    const socketHandler = new DemoSocketHandler(formHandler, videoHandler) // eslint-disable-line no-unused-vars

    // http://54.86.109.160:5080/live/hls/stream.m3u8
    // http://54.86.109.160/
    // http://54.152.173.237/
  }

  window.addEventListener('DOMContentLoaded', onDomContentLoaded)
})()
