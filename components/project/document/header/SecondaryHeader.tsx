import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import SectionInformation from "../section/SectionInformation";

export default function SecondaryHeader() {
  return (
    <div className="h-full w-full flex flex-col px-2 py-1">
      <Accordion
        type="single"
        collapsible
        className="w-full"
        defaultValue="item-1"
      >
        <AccordionItem value="section-info">
          <AccordionTrigger>Section Information</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4 text-balance">
            <SectionInformation />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="tasks">
          <AccordionTrigger>Tasks</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4 text-balance">
            <SectionInformation />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="comments">
          <AccordionTrigger>Comments</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4 text-balance">
            <SectionInformation />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="problems">
          <AccordionTrigger>Problems</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4 text-balance">
            <SectionInformation />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
