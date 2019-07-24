import { DidactElement, TEXT_ELEMENT } from './didactElements'
import { Component } from './Component';

type PublicInstance = Component

interface DidactDomInstance {
  dom: HTMLElement | Text;
  element: DidactElement;
  childInstances: DidactInstance[];
}

/** The internal instances for component elements and dom elements are different. Component internal instances can only have one child (returned from render) so they have the childInstance property instead of the childInstances array that dom instances have. Also, component internal instances need to have a reference to the public instance so the render function can be called during the reconciliation. */
interface DidactComponentInstance {
  dom: HTMLElement | Text;
  element: DidactElement;
  childInstance: DidactInstance;
  publicInstance: PublicInstance;
}

export type DidactInstance = DidactComponentInstance | DidactDomInstance

let rootInstance: DidactInstance | null = null

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

function instantiate(element: DidactElement | null): DidactInstance {
  if (element === null) {
    return null
  }

  const { type, props } = element

  if (typeof type === 'string') { // if element is DomElement
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
  } else {
    /** Instantiate component element */
    const instance = {} as DidactComponentInstance
    const publicInstance = new type(props)
    publicInstance.__internalInstance = instance
    const childElement = publicInstance.render()
    const childInstance = instantiate(childElement)
    const dom = childInstance.dom

    Object.assign(instance, { dom, element, childInstance, publicInstance })
    return instance
  }
}

function reconcileChildren(
  instance: DidactDomInstance,
  element: DidactElement
): DidactInstance[] {
  const dom = instance.dom
  const childInstances = instance.childInstances
  const nextChildElements = element.props.children || []
  const newChildInstances = []

  const count = Math.max(childInstances.length, nextChildElements.length)

  for (let i = 0; i < count; i++) {
    const childInstance = childInstances[i]
    const childElement = nextChildElements[i]
    const newChildInstance = reconcile(dom as HTMLElement, childInstance, childElement)
    newChildInstances.push(newChildInstance)
  }

  return newChildInstances.filter(instance => instance !== null)
}

function reconcile(
  parentDom: HTMLElement,
  instance: DidactInstance,
  element: DidactElement
): DidactInstance | null {
  if (instance === null) {
    /** Create instance */
    const newInstance = instantiate(element)
    parentDom.appendChild(newInstance.dom)
    return newInstance
  } else if (element === null) {
    /** Remove instance */
    parentDom.removeChild(instance.dom)
    return null
  } else if (instance.element.type !== element.type) {
    /** Replace instance */
    const newInstance = instantiate(element)
    parentDom.replaceChild(newInstance.dom, instance.dom)
    return newInstance
  } else if (typeof element.type === 'function') {
    /** Update Component Instance */
    (instance as DidactComponentInstance).publicInstance.props = element.props
    const childElement = (instance as DidactComponentInstance).publicInstance.render()
    const oldChildInstance = (instance as DidactComponentInstance).childInstance
    const childInstance = reconcile(parentDom, oldChildInstance, childElement)
    return {
      ...instance,
      dom: childInstance.dom,
      childInstance,
      element
    }
  } else if (typeof element.type === 'string') {
    /** Update instance */
    updateDomProperties(instance.dom, instance.element.props, element.props);
    (instance as DidactDomInstance).childInstances = reconcileChildren(instance as DidactDomInstance, element)
    instance.element = element
    return instance
  }
}

export function updateInstance(internalInstance) {
  const parentDom = internalInstance.dom.parentNode
  const element = internalInstance.element
  reconcile(parentDom, internalInstance, element)
}

export function render(element: DidactElement, container: HTMLElement) {
  const prevInstance = rootInstance
  const nextInstance = reconcile(container, prevInstance, element)
  rootInstance = nextInstance
}
