export const TEXT_ELEMENT = 'TEXT_ELEMENT'
import { Component } from './Component';

export interface DidactElement {
  type: keyof HTMLElementTagNameMap | typeof TEXT_ELEMENT | typeof Component;
  props: {
    id?: string;
    children?: DidactElement[];
    nodeValue?: string;
  };
}
