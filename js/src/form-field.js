'use strict'

class FormField {
  constructor (field) {
    this.field = field
    this.name = field.name
    this.id = field.id
    this.originalValue = field.value
  }

  get value () {
    return this.field.value
  }

  update () {
    this.originalValue = this.value

    return this
  }
}

export default FormField
