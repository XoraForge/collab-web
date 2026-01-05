import { Element } from "./Element";
import { Style } from "./Style";

export class Text extends Node implements Element {
  constructor(public text: string, public style: Style[] = []) {
    super();
  }
}
