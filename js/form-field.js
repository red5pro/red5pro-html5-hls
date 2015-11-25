'use strict'

class FormField {
  constructor (field) {
    this.field = field
    this.originalValue = field.value
  }

  get value () {
    return this.field.value
  }

  update () {
    this.originalValue = this.value()

    return this
  }
}

module.exports = FormField
