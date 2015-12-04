'use strict'

//  A representation of our form inputs
class FormField {
  constructor (field) {
    this.field = field
    this.name = field.name
    this.id = field.id
    this.originalValue = this.value
    this.placeholder = field.getAttribute('placeholder')
  }

  get isCheckboxOrRadio () {
    return /(?:checkbox|radio)/i.test(this.field.type)
  }

  get value () {
    return this.isCheckboxOrRadio ? this.field.checked : this.field.value
  }

  setValue (val) {
    if (this.isCheckboxOrRadio) {
      this.field.checked = val
    } else {
      this.field.value = val
    }
    this.originalValue = val

    return this
  }

  update () {
    this.originalValue = this.value

    return this
  }
}

export default FormField
