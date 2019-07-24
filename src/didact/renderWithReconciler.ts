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

function reconcileChildren(instance, element) {
  const dom = instance.dom
  const childInstances = instance.childInstances
  const nextChildElements = element.props.children || []
  const newChildInstances = []

  const count = Math.max(childInstances.length, nextChildElements.length)

  for (let i = 0; i < count; i++) {
    const childInstance = childInstances[i]
    const childElement = nextChildElements[i]
    const newChildInstance = reconcile(dom, childInstance, childElement)
    newChildInstances.push(newChildInstance)
  }

  return newChildInstances
}

function reconcile(
  parentDom: HTMLElement,
  instance: DidactInstance,
  element: DidactElement
) {
  if (instance === null) {
    /** Create instance */
    const newInstance = instantiate(element)
    parentDom.appendChild(newInstance.dom)
    return newInstance
  } else if (instance.element.type === element.type) {
    /** Update instance */
    updateDomProperties(instance.dom, instance.element.props, element.props)
    instance.childInstances = reconcileChildren(instance, element)
    instance.element = element
    return instance
  } else {
    /** Replace instance */
    const newInstance = instantiate(element)
    parentDom.replaceChild(newInstance.dom, instance.dom);
    return newInstance
  }
}

export function render(element, container) {
  const prevInstance = rootInstance
  const nextInstance = reconcile(container, prevInstance, element)
  rootInstance = nextInstance
}
