'use strict'

import FormHandler from './src/form-handler.js'

class DemoFormHandler extends FormHandler {
  constructor (form, submit) {
    super(form, submit)

    this.clusterCheckbox = document.getElementById('stream-settings-cluster')
    this.labelEls = [
      'stream-settings-url-or-ip-label',
      'stream-url-preview-label'
    ].map((id) => document.getElementById(id))

    this.clusterCheckbox.addEventListener('change', this.onClusterChange.bind(this))
  }

  //  Certain elements should be labeled for "Red5 Pro Cluster" and not "Stream"
  formatForCluster (el) {
    let val = el.innerHTML
    el.innerHTML = val.replace(/stream/ig, 'Red5 Pro Cluster')
  }

  //  Certain elements should be labeled for "Stream" and not "Red5 Pro Cluster"
  formatForStream (el) {
    let val = el.innerHTML
    el.innerHTML = val.replace(/red5 pro cluster/ig, 'Stream')
  }

  //  Toggle the labels of some items
  onClusterChange (e) {
    const formatFn = e.currentTarget.checked ? this.formatForCluster : this.formatForStream

    this.labelEls.forEach(formatFn)
  }
}

export default DemoFormHandler
