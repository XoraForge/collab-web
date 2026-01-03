import SectionDetail from "./SectionDetail";

export default function SectionInformation() {
  return (
    <div className="flex flex-col gap-y-2">
      <SectionDetail icon="clarity:assign-user-solid" title="Assigned To:">
        <p className="font-semibold">N/A</p>
      </SectionDetail>
    </div>
  );
}
