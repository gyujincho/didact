import { DidactElement, TEXT_ELEMENT } from './didactElements';

let rootInstance = null

interface DidactInstance {
  dom: HTMLElement | Text;
  element: DidactElement;
  childInstances: DidactInstance[];
}

const isEvent = propName => propName.startsWith('on')
const isAttribute = propName => !isEvent(propName) && propName !== 'children'

function updateDomProperties(dom, prevProps, nextProps) {
  /** Remove Attributes */
  Object.keys(prevProps)
    .filter(isAttribute)
    .forEach(propName => {
      dom[propName] = null
    })

  /** Remove Event Listeners */
  Object.keys(prevProps)
    .filter(isEvent)
    .forEach(propName => {
      const eventType = propName.toLowerCase().substring(2) // Remove 'on'
      dom.removeEventListener(eventType, prevProps[propName])
    })

  /** Set Attributes */
  Object.keys(nextProps)
    .filter(isAttribute)
    .forEach(propName => {
      dom[propName] = nextProps[propName]
    })

  /** Set Event Listeners */
  Object.keys(nextProps)
    .filter(isEvent)
    .forEach(propName => {
      const eventType = propName.toLowerCase().substring(2) // Remove 'on'
      dom.addEventListener(eventType, nextProps[propName])
    })
}

function instantiate(element: DidactElement): DidactInstance {
  const { type, props } = element

  /** Create DOM Element */
  const isTextElement = type === TEXT_ELEMENT
  const dom = isTextElement
    ? document.createTextNode('')
    : document.createElement(type)

  updateDomProperties(dom, [], props)

  /** Instantiate and append children */
  const { children = [] } = props
  const childInstances = children.map(instantiate)
  const childDoms = childInstances.map(instance => instance.dom)
  childDoms.forEach(childDom => dom.appendChild(childDom))

  /** Return Instance */
  return {
    dom,
    element,
    childInstances
  }
}

function reconcile(
  parentDom: HTMLElement,
  instance: DidactInstance,
  element: DidactElement
) {
  const newInstance = instantiate(element)
  if (instance === null) {
    parentDom.appendChild(newInstance.dom)
  } else {
    parentDom.replaceChild(newInstance.dom, instance.dom);
  }
  return newInstance;
}

export function render(element, container) {
  const prevInstance = rootInstance
  const nextInstance = reconcile(container, prevInstance, element)
  rootInstance = nextInstance
}
