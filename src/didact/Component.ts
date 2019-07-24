import { updateInstance, DidactInstance } from './render'
import { DidactElement } from './didactElements';

/**
 * Note that we don’t need to change anything in our createElement function, it will keep the component class as the type of the element and handle props as usual
 */

export class Component {
  __internalInstance: DidactInstance;
  props: any;
  state: any;

  constructor(props) {
    this.props = props
    this.state = this.state || {}
  }

  setState(partialState) {
    this.state = Object.assign({}, this.state, partialState)
    updateInstance(this.__internalInstance)
  }

  render(): DidactElement | null {
    return null
  }
}
