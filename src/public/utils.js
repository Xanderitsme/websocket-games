export const debounce = (callback, delay) => {
  let timeoutId
  return (...args) => {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      callback.apply(null, args)
    }, delay)
  }
}

export const $ = (selector) => document.querySelector(selector)

export const $all = (selector) => document.querySelectorAll(selector)

export const handleDomElement = ($element) => {
  const element = {
    value: null
  }

  const getCurrentValue = () => {
    let currentValue = ''

    if ($element instanceof HTMLInputElement) {
      if ($element.type === 'checkbox') {
        currentValue = $element.checked
      } else if ($element.type === 'radio') {
        const form = $element.form
        if (form) {
          const selected = form.elements[$element.name].value
          currentValue = selected
        } else {
          const radios = $all(`input[name="${$element.name}"]:checked`)
          if (radios.length > 0) {
            currentValue = radios[0].value
          }
        }
      } else {
        currentValue = $element.value
      }
    } else if (
      $element instanceof HTMLTextAreaElement ||
      $element instanceof HTMLSelectElement
    ) {
      currentValue = $element.value
    } else {
      currentValue = $element.innerText
    }

    element.value = currentValue
    return currentValue
  }

  const setValue = (value) => {
    const newValue = typeof value === 'function' ? value(element) : value

    if (newValue === undefined) {
      return
    }

    if ($element instanceof HTMLInputElement) {
      if ($element.type === 'checkbox') {
        $element.checked = Boolean(newValue)
      } else if ($element.type === 'radio') {
        const radios = $all(`input[name="${$element.name}"]`)
        radios.forEach((radio) => {
          if (radio.value === newValue.toString()) {
            radio.checked = true
          }
        })
      } else {
        $element.value = newValue.toString()
      }
    } else if (
      $element instanceof HTMLTextAreaElement ||
      $element instanceof HTMLSelectElement
    ) {
      $element.value = newValue.toString()
    } else {
      $element.innerHTML = newValue.toString()
    }

    element.value = newValue.toString()
  }

  getCurrentValue()
  return [element, setValue, getCurrentValue]
}

export const validStringDate = (value) => {
  return /^(\d{4}[- /.]((0[13578]|1[02])[- /.](0[1-9]|[12][0-9]|3[01])|(0[469]|11)[- /.](0[1-9]|[12][0-9]|30)|02[- /.](0[1-9]|1\d|2[0-8]))|(\d{2}(0[48]|[2468][048]|[13579][26])|([02468][048]|[1359][26])00)[- /.]02[- /.]29)$/g.test(
    value
  )
}
