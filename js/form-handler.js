'use strict'

import CustomEventTarget from './custom-event-target.js'
import FormField from './form-field.js'

class FormHandler extends CustomEventTarget {
  constructor (form, submit) {
    super()

    let self = this
    let inputs = form.querySelectorAll('input')

    this.fields = Array.prototype.slice.call(inputs).map(x => new FormField(x))
    this.form = form
    this.hasSaved = false
    this.submit = submit

    this.form.addEventListener('submit', this.onSubmit.bind(this))
    this.fields.forEach(x => {
      x.field.addEventListener('focus', self.onFieldFocus.bind(self))
      x.field.addEventListener('blur', self.onFieldBlur.bind(self))
      x.field.addEventListener('change', self.onFieldChange.bind(self))
      x.field.addEventListener('keydown', self.onFieldChange.bind(self))
      x.field.addEventListener('keyup', self.onFieldChange.bind(self))
    })
  }

  setButtonState (state, msg) {
    let clzz = this.submit.className
      .replace(/btn-(?:default|primary|success|info|warning|danger|link)/g, '')
      .replace(/\s+/g, ' ')
      .trim()

    this.submit.className = `${clzz} btn-${state}`
    this.submit.innerHTML = msg || this.buttonMessage

    return this
  }

  get buttonMessage () {
    return this.hasSaved ? 'Update' : 'Save'
  }

  fieldForPartialID (partialID) {
    let matching = this.fields.filter(x => x.id === 'stream-settings-' + partialID)

    if (matching.length) return matching[0]
    return null
  }

  valueForPartialIDWithDefault (partialID, deflt) {
    let field = this.fieldForPartialID(partialID)

    if (field) return field.value
    return deflt
  }

  onFieldFocus (e) {
    this.setButtonState('primary')
  }

  onFieldBlur (e) {
    let hasChanged = this.fields.reduce((p, c) => p || c.value !== c.originalValue, false)

    if (!hasChanged) {
      this.setButtonState('default')
    }
  }

  onFieldChange (e) {
    let self = this
    this.setButtonState('primary')

    this.dispatchEvent('inputchange', {
      url: self.valueForPartialIDWithDefault('url-or-ip', 'http://example.com/'),
      port: self.valueForPartialIDWithDefault('port', '5080'),
      websocketPort: self.valueForPartialIDWithDefault('websocket-port', '6262'),
      context: self.valueForPartialIDWithDefault('context', 'live'),
      stream: self.valueForPartialIDWithDefault('stream', 'stream')
    })
  }

  onSubmit (e) {
    let self = this
    this.hasSaved = true
    this.fields.forEach(x => x.update())

    this.setButtonState('default', 'Update')

    this.dispatchEvent('change', {
      url: self.valueForPartialIDWithDefault('url-or-ip', 'http://example.com/'),
      port: self.valueForPartialIDWithDefault('port', '5080'),
      websocketPort: self.valueForPartialIDWithDefault('websocket-port', '6262'),
      context: self.valueForPartialIDWithDefault('context', 'live'),
      stream: self.valueForPartialIDWithDefault('stream', 'stream')
    })

    e.preventDefault()
    e.stopPropagation()
  }
}

export default FormHandler