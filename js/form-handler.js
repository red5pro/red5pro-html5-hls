'use strict'

let FormField = require('./form-field.js')

class FormHandler {
  constructor (form, submit) {
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
    })
  }

  setButtonState (state, msg) {
    let clzz = this.submit.className
      .replace(/btn-(?:default|primary|success|info|warning|danger|link)/g, '')
      .replace(/\s+/g, ' ')
      .trim()

    this.submit.className = `${clzz} btn-${state}`
    this.submit.innerHTML = msg || this.buttonMessage()

    return this
  }

  get buttonMessage () {
    return this.hasSaved ? 'Update' : 'Save'
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
    this.setButtonState('primary')
  }

  onSubmit (e) {
    this.hasSaved = true
    this.fields.forEach(x => x.update())

    this.setButtonState('default', 'Update')

    e.preventDefault()
    e.stopPropagation()
  }
}

module.exports = FormHandler
