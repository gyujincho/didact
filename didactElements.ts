export const TEXT_ELEMENT = 'TEXT_ELEMENT'

export interface DidactElement {
  type: keyof HTMLElementTagNameMap | typeof TEXT_ELEMENT;
  props: {
    id?: string;
    children?: DidactElement[];
    nodeValue?: string;
  };
}
