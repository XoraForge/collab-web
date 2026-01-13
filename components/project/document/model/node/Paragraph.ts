import { Node } from "./Node";
import { Text } from "./Text";

export class Paragraph extends Node {
  constructor(public children: Text[] = []) {
    super();
  }
}
