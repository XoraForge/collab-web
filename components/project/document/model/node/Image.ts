import { Node } from "./Node";
import { Element } from "./Element";
import { Style } from "./Style";

export class Image extends Node implements Element {
  constructor(public style: Style[] = []) {
    super();
  }
}
