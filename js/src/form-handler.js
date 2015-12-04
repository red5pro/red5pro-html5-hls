'use strict'

import CustomEventTarget from './custom-event-target.js'
import FormField from './form-field.js'

//  Notifies listeners of input field and overall form changes
//  Updates the submit button to draw attention to it
class FormHandler extends CustomEventTarget {
  constructor (form, submit) {
    super()

    let self = this
    let inputs = form.querySelectorAll('input')

    this.fields = Array.prototype.slice.call(inputs).map(x => new FormField(x))
    this.form = form
    this.hasSaved = false
    this.hadDangerClass = false
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

  //  Strip all Bootstrap button states and apply the specified state
  setButtonState (state, msg) {
    const _msg = msg == null ? this.buttonMessage : msg
    const clzz = this.submit.className
      .replace(/btn-(?:default|primary|success|info|warning|danger|link)/g, '')
      .replace(/\s+/g, ' ')
      .trim()

    this.submit.className = `${clzz} btn-${state}`
    this.submit.innerHTML = state === 'danger' ? `Error! ${_msg}` : _msg

    return this
  }

  get hasDangerClass () {
    return /btn-danger/i.test(this.submit.className)
  }

  get buttonMessage () {
    return this.hasSaved ? 'Update' : 'Save'
  }

  getDangerOrClass (clzz) {
    return this.hasDangerClass ? 'danger' : clzz
  }

  //  Get a field with a specific ID
  fieldForPartialID (partialID) {
    const matching = this.fields.filter(x => x.id === 'stream-settings-' + partialID)

    if (matching.length) return matching[0]
    return null
  }

  //  Return either the field's value or it's placeholder if no value is present
  valueForPartialID (partialID) {
    const field = this.fieldForPartialID(partialID)
    const deflt = field.placeholder

    if (field && field.value) return field.value
    return deflt
  }

  //  Build an object for dispatched events with properties (or default fallbacks, should no value be present)
  get changeObject () {
    const val = this.valueForPartialID.bind(this)
    return {
      url: val('url-or-ip'),
      port: val('port'),
      websocketPort: val('websocket-port'),
      context: val('context'),
      stream: val('stream'),
      isCluster: this.fieldForPartialID('cluster').field.checked
    }
  }

  //  When input fields are focused, draw attention to the submit button
  onFieldFocus (e) {
    this.setButtonState(this.getDangerOrClass('primary'))
  }

  //  When input fields are blurred, remove or keep attention on submit button depending on whether or not fields have changed
  onFieldBlur (e) {
    const hasChanged = this.fields.reduce((p, c) => p || c.value !== c.originalValue, false)

    if (!hasChanged) {
      this.setButtonState(this.getDangerOrClass('default'))
    }
  }

  //  When input fields are typed in, draw attention to the submit button and dispatch an event notifying anyone listening
  onFieldChange (e) {
    this.setButtonState(this.getDangerOrClass('primary'))

    this.dispatchEvent('inputchange', this.changeObject)
  }

  //  When the form is submitted, remove attention from the submit button and dispatch an event notifying anyone listening
  //  Stop the form from following through with it's submission
  onSubmit (e) {
    this.hasSaved = true

    //  Validation
    this.validate()

    this.fields.forEach(x => x.update())

    this.setButtonState('default', this.buttonMessage)

    this.dispatchEvent('change', this.changeObject)

    e.preventDefault()
    e.stopPropagation()
  }

  validate () {
    const urlField = this.fieldForPartialID('url-or-ip')
    const protocol = window.location.protocol.replace(/:$/, '')
    const lackingProtocolRegEx = /^(?!http(?:s)?:\/\/)(.*)$/i
    const indeterminateProtocolRegEx = /^\/\/(.*)$/
    let urlVal = urlField.value

    if (urlVal) {
      urlVal = urlVal.replace(indeterminateProtocolRegEx, `${protocol}://$1`)
      urlVal = urlVal.replace(lackingProtocolRegEx, `${protocol}://$1`)

      urlField.setValue(urlVal)
    }
  }
}

export default FormHandler
