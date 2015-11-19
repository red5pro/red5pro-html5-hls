(function() {
  'use strict';

  var slice = Array.prototype.slice;

  /******************
  *   Form Fields   *
  ******************/
  function FormField (field) {
    this.field = field;
    this.originalValue = field.value;
  }

  FormField.prototype.value = function() {
    return this.field.value;
  };

  FormField.prototype.update = function() {
    this.originalValue = this.value();

    return this;
  };

  /********************
  *   Form Handler    *
  ********************/
  function FormHandler (form, submit) {
    this.fields = slice.call(form.querySelectorAll('input')).map(function(field) {
      return new FormField(field);
    });
    this.form = form;
    this.hasSaved = false;
    this.submit = submit;
  }

  FormHandler.prototype.setButtonState = function(state, msg) {
    var clzz = this.submit.className
      .replace(/btn-(?:default|primary|success|info|warning|danger|link)/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    this.submit.className = clzz + ' btn-' + state;
    this.submit.innerHTML = msg || this.buttonMessage();

    return this;
  };

  FormHandler.prototype.initialize = function() {
    var self = this;
    this.form.addEventListener('submit', this.onSubmit.bind(this));

    this.fields.forEach(function(formField) {
      formField.field.addEventListener('focus', self.onFieldFocus.bind(self));
      formField.field.addEventListener('blur', self.onFieldBlur.bind(self));
      formField.field.addEventListener('change', self.onFieldChange.bind(self));
    });
    
    return this;
  };

  FormHandler.prototype.buttonMessage = function() {
    return this.hasSaved ? 'Update' : 'Save';
  };

  FormHandler.prototype.onFieldFocus = function(e) {
    this.setButtonState('primary');
  };

  FormHandler.prototype.onFieldBlur = function(e) {
    var hasChanged = this.fields.reduce(function(prev, curr) {
      return prev || curr.value() !== curr.originalValue;
    }, false);

    if (!hasChanged) {
      this.setButtonState('default');
    }
  };

  FormHandler.prototype.onFieldChange = function(e) {
    this.setButtonState('primary');
  };

  FormHandler.prototype.onSubmit = function(e) {
    this.hasSaved = true;
    this.fields.forEach(function(formField) {
      formField.update();
    });

    this.setButtonState('default', 'Update');

    e.preventDefault();
    e.stopPropagation();
  };

  /********************
  *   Load Handling   *
  ********************/
  function onDomContentLoaded (e) {
    var form = document.getElementById('stream-settings-form');
    var submit = document.getElementById('stream-settings-form-submit');
    var formHandler = new FormHandler(form, submit);

    formHandler.initialize();
  }

  window.addEventListener('DOMContentLoaded', onDomContentLoaded);
})();
