import Section from "../doc-section/Section";

export default function AdjustableSections() {
  return (
    <div className="flex flex-col gap-y-1.5">
      <Section isLocked={true} title="Cover" />
      <Section isLocked={true} title="Table of Content" />
      <Section isLocked={true} title="Introduction" />
      <Section isLocked={false} title="Research" />
      <Section isLocked={false} title="SWOT Analysis" />
      <Section isLocked={false} title="Comparison" />
      <Section isLocked={true} title="Conclusion" />
    </div>
  );
}
