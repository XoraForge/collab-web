import { Node } from "./Node";
import { Element } from "./Element";
import { Style } from "./Style";

export class Table extends Node implements Element {
  constructor(
    public rows: number,
    public cols: number,
    public style: Style[] = []
  ) {
    super();
  }
}
