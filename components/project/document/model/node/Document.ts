import { Node } from "./Node";
import { Section } from "./Section";

export class Document extends Node {
  constructor(public children: Section[]) {
    super();
  }
}
