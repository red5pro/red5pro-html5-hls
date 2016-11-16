require('babel-polyfill')

import DemoFormHandler from './demo-form-handler.js'
import DemoVideoHandler from './demo-video-handler.js'
import DemoSocketHandler from './demo-socket-handler.js'

;(function () {
  'use strict'

  function onDomContentLoaded (e) {
    const x = document.getElementById.bind(document)
    const formHandler = new DemoFormHandler(x('stream-settings-form'), x('stream-settings-form-submit'))
    const videoHandler = new DemoVideoHandler(formHandler)
    const socketHandler = new DemoSocketHandler(formHandler, videoHandler) // eslint-disable-line no-unused-vars

    window.addEventListener('beforeunload', function onBeforeUnload (evt) {
      socketHandler.close()

      setTimeout(function onProceedWithClose () {
        window.close()
      }, 200)

      evt.preventDefault()
      evt.stopImmediatePropagation()
    })
  }

  window.addEventListener('DOMContentLoaded', onDomContentLoaded)
})()
