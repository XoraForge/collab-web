import { Node } from "./Node";
import { Paragraph } from "./Paragraph";

export class Section extends Node {
  constructor(public children: Paragraph[]) {
    super();
  }
}
