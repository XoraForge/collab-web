import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

export default function RibbonAccordion({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Accordion type="multiple" className="size-full p-2">
      {children}
      <AccordionItem value="pageLayout">
        <AccordionTrigger>Page Layout</AccordionTrigger>
        <AccordionContent className="grid grid-cols-2 gap-2">
          <div></div>
          <div></div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="references">
        <AccordionTrigger>Reference</AccordionTrigger>
        <AccordionContent className="flex flex-col gap-4 text-balance">
          <p>
            We offer worldwide shipping through trusted courier partners.
            Standard delivery takes 3-5 business days, while express shipping
            ensures delivery within 1-2 business days.
          </p>
          <p>
            All orders are carefully packaged and fully insured. Track your
            shipment in real-time through our dedicated tracking portal.
          </p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
