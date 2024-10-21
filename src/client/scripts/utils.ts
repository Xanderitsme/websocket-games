export const debounce = (callback: any, delay: number) => {
  let timeoutId: any
  return (...args: any[]) => {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      callback.apply(null, args)
    }, delay)
  }
}

export const $ = (selector: string) => document.querySelector(selector)

export const $all = (selector: string) => document.querySelectorAll(selector)

// export const handleDomElement2 = <T>($element: HTMLElement) => {
//   const elementHandler = {
//     element: {
//       value: {} as T
//     },
//     setValue(value: T) {
//       const newValue = typeof value === 'function' ? value(this.element) : value

//       if (newValue === undefined) {
//         return
//       }

//       if ($element instanceof HTMLInputElement) {
//         if ($element.type === 'checkbox') {
//           $element.checked = Boolean(newValue)
//         } else if ($element.type === 'radio') {
//           const radios = $all(`input[name="${$element.name}"]`)
//           radios.forEach((radio) => {
//             if (!(radio instanceof HTMLInputElement)) {
//               return
//             }

//             if (radio.value === newValue.toString()) {
//               radio.checked = true
//             }
//           })
//         } else {
//           $element.value = newValue.toString()
//         }
//       } else if (
//         $element instanceof HTMLTextAreaElement ||
//         $element instanceof HTMLSelectElement
//       ) {
//         $element.value = newValue.toString()
//       } else {
//         $element.innerHTML = newValue.toString()
//       }

//       this.element = newValue.toString()
//     },
//     getValue() {
//       let currentValue

//       if ($element instanceof HTMLInputElement) {
//         if ($element.type === 'checkbox') {
//           currentValue = $element.checked
//         } else if ($element.type === 'radio') {
//           const form = $element.form
//           if (form) {
//             const childElement = form.elements[$element.name as any]

//             if (childElement instanceof HTMLInputElement) {
//               const selected = childElement.value
//               currentValue = selected
//             }
//           } else {
//             const radios = $all(`input[name="${$element.name}"]:checked`)
//             if (radios.length > 0) {
//               currentValue = (radios[0] as any).value
//             }
//           }
//         } else {
//           currentValue = $element.value
//         }
//       } else if (
//         $element instanceof HTMLTextAreaElement ||
//         $element instanceof HTMLSelectElement
//       ) {
//         currentValue = $element.value
//       } else {
//         currentValue = $element.innerText
//       }

//       this.element = currentValue
//       return currentValue
//     }
//   }

//   elementHandler.getValue

//   return [
//     elementHandler.element,
//     elementHandler.setValue,
//     elementHandler.getValue
//   ] as [
//     typeof elementHandler.element,
//     typeof elementHandler.setValue,
//     typeof elementHandler.getValue
//   ]
// }

type ElementTypes = string | boolean

interface ElementHandlerType<T> {
  element: {
    value: T
  }
  setValue(value: T | ((currentValue: T) => T)): void
  getValue(): string | boolean
  handleInputElement(element: HTMLInputElement, valueStr: string): void
  getRadioValue(element: HTMLInputElement): string
}

export const handleDomElement = <T extends ElementTypes>(
  $element: HTMLElement
) => {
  const elementHandler: ElementHandlerType<T> = {
    element: {
      value: {} as T
    },
    setValue(value: T | ((currentValue: T) => T)) {
      let newValue: T

      if (typeof value === 'function') {
        newValue = (value as (currentValue: T) => T)(
          elementHandler.element.value
        )
      } else {
        newValue = value
      }

      const valueStr = String(newValue)

      if ($element instanceof HTMLInputElement) {
        elementHandler.handleInputElement($element, valueStr)
      } else if (
        $element instanceof HTMLTextAreaElement ||
        $element instanceof HTMLSelectElement
      ) {
        $element.value = valueStr
      } else {
        $element.innerHTML = valueStr
      }

      elementHandler.element.value = newValue
    },
    getValue() {
      let currentValue: ElementTypes = ''

      if ($element instanceof HTMLInputElement) {
        switch ($element.type) {
          case 'checkbox':
            currentValue = $element.checked
            break
          case 'radio':
            currentValue = elementHandler.getRadioValue($element)
            break
          default:
            currentValue = $element.value
            break
        }
      } else if (
        $element instanceof HTMLTextAreaElement ||
        $element instanceof HTMLSelectElement
      ) {
        currentValue = $element.value
      } else {
        currentValue = $element.innerText
      }

      elementHandler.element.value = currentValue as T
      return currentValue
    },
    handleInputElement(element: HTMLInputElement, valueStr: string) {
      if (element.type === 'checkbox') {
        element.checked = Boolean(valueStr)
      } else if (element.type === 'radio') {
        const radios = $all(`input[name="${element.name}"]`)
        radios.forEach((radio) => {
          if (radio instanceof HTMLInputElement && radio.value === valueStr) {
            radio.checked = true
          }
        })
      } else {
        element.value = valueStr
      }
    },
    getRadioValue(element: HTMLInputElement) {
      const form = element.form

      if (!form) {
        const radios = $all(`input[name="${element.name}"]:checked`)
        return radios.length > 0 ? (radios[0] as HTMLInputElement).value : ''
      }

      const childElement = form.elements[element.name as any]

      if (!(childElement instanceof HTMLInputElement)) {
        return ''
      }

      const selected = childElement.value
      return selected
    }
  }

  elementHandler.getValue()

  return [
    elementHandler.element,
    elementHandler.setValue,
    elementHandler.getValue
  ] as [
    typeof elementHandler.element,
    typeof elementHandler.setValue,
    typeof elementHandler.getValue
  ]
}

// const childElement = form.elements[$element.name as any]

// if (childElement instanceof HTMLInputElement) {
//   const selected = childElement.value
//   currentValue = selected
// }

export const validStringDate = (value: string) => {
  return /^(\d{4}[- /.]((0[13578]|1[02])[- /.](0[1-9]|[12][0-9]|3[01])|(0[469]|11)[- /.](0[1-9]|[12][0-9]|30)|02[- /.](0[1-9]|1\d|2[0-8]))|(\d{2}(0[48]|[2468][048]|[13579][26])|([02468][048]|[1359][26])00)[- /.]02[- /.]29)$/g.test(
    value
  )
}
