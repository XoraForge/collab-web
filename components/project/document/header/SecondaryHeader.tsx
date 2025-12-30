import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import RibbonAccordion from "./RibbonAccordion";
import { SelectionType } from "../DocumentLayout";

// Variants
function TextVariant() {
  return (
    <AccordionItem value="textFormat">
      <AccordionTrigger>Text Format</AccordionTrigger>
      <AccordionContent className="flex flex-col gap-4 text-balance">
        <p>
          We offer worldwide shipping through trusted courier partners. Standard
          delivery takes 3-5 business days, while express shipping ensures
          delivery within 1-2 business days.
        </p>
        <p>
          All orders are carefully packaged and fully insured. Track your
          shipment in real-time through our dedicated tracking portal.
        </p>
      </AccordionContent>
    </AccordionItem>
  );
}

function ImageVariant() {
  return (
    <AccordionItem value="imageFormat">
      <AccordionTrigger>Image Format</AccordionTrigger>
      <AccordionContent className="flex flex-col gap-4 text-balance">
        <p>
          We offer worldwide shipping through trusted courier partners. Standard
          delivery takes 3-5 business days, while express shipping ensures
          delivery within 1-2 business days.
        </p>
        <p>
          All orders are carefully packaged and fully insured. Track your
          shipment in real-time through our dedicated tracking portal.
        </p>
      </AccordionContent>
    </AccordionItem>
  );
}

function SearchVariant() {
  return (
    <AccordionItem value="searchFormat">
      <AccordionTrigger>Search Format</AccordionTrigger>
      <AccordionContent className="flex flex-col gap-4 text-balance">
        <p>
          We offer worldwide shipping through trusted courier partners. Standard
          delivery takes 3-5 business days, while express shipping ensures
          delivery within 1-2 business days.
        </p>
        <p>
          All orders are carefully packaged and fully insured. Track your
          shipment in real-time through our dedicated tracking portal.
        </p>
      </AccordionContent>
    </AccordionItem>
  );
}

function TableVariant() {
  return (
    <AccordionItem value="tableFormat">
      <AccordionTrigger>Table Format</AccordionTrigger>
      <AccordionContent className="flex flex-col gap-4 text-balance">
        <p>
          We offer worldwide shipping through trusted courier partners. Standard
          delivery takes 3-5 business days, while express shipping ensures
          delivery within 1-2 business days.
        </p>
        <p>
          All orders are carefully packaged and fully insured. Track your
          shipment in real-time through our dedicated tracking portal.
        </p>
      </AccordionContent>
    </AccordionItem>
  );
}

function ParagraphVariant() {
  return (
    <AccordionItem value="paragraphFormat">
      <AccordionTrigger>Paragraph Format</AccordionTrigger>
      <AccordionContent className="flex flex-col gap-4 text-balance">
        <p>
          We offer worldwide shipping through trusted courier partners. Standard
          delivery takes 3-5 business days, while express shipping ensures
          delivery within 1-2 business days.
        </p>
        <p>
          All orders are carefully packaged and fully insured. Track your
          shipment in real-time through our dedicated tracking portal.
        </p>
      </AccordionContent>
    </AccordionItem>
  );
}

const VARIANT_MAP: Record<
  Exclude<SelectionType, "None">,
  React.ComponentType
> = {
  Text: TextVariant,
  Image: ImageVariant,
  Search: SearchVariant,
  Table: TableVariant,
  Paragraph: ParagraphVariant,
};

export default function SecondaryHeader({ type }: { type: SelectionType }) {
  const Variant = type !== "None" ? VARIANT_MAP[type] : null;

  return (
    <div className="h-full w-full flex flex-col">
      <RibbonAccordion>{Variant ? <Variant /> : null}</RibbonAccordion>
    </div>
  );
}
