import { DidactElement, TEXT_ELEMENT } from './didactElements';

const isListener = propName => propName.startsWith('on')
const isAttribute = propName => !propName.isListener(propName) && propName !== 'children'

export function render(element: DidactElement, parentDom: HTMLElement) {
  const { type, props } = element

  const isTextElement = type === TEXT_ELEMENT

  /** Create DOM Element */
  const dom = isTextElement
    ? document.createTextNode('')
    : document.createElement(type)

  /** Set Attributes */
  Object.keys(props)
    .filter(isAttribute)
    .forEach(propName => {
      dom[propName] = props[propName]
    })

  /** Set Event Listeners */
  Object.keys(props)
    .filter(isListener)
    .forEach(propName => {
      const eventType = propName.toLowerCase().substring(2) // Remove 'on'
      dom.addEventListener(eventType, props[propName])
    })

  /** Append Children Elements */
  const { children = [] } = props
  children.forEach(childElement => render(childElement, dom as HTMLElement))

  /** Append this element to the Parent */
  parentDom.appendChild(dom)
}
