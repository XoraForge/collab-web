import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
        <AccordionContent className="flex flex-col gap-4 text-balance" />
      </AccordionItem>
    </Accordion>
  );
}
