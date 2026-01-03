import SectionDetail from "./SectionDetail";

export default function SectionInformation() {
  return (
    <div className="flex flex-col px-2.5 py-2 gap-y-3">
      <h1 className="text-sm font-semibold">Section Information</h1>
      <div className="flex flex-col gap-y-2">
        <SectionDetail icon="clarity:assign-user-solid" title="Assigned To:">
          <p className="text-sm font-semibold">N/A</p>
        </SectionDetail>
        <SectionDetail icon="clarity:assign-user-solid" title="Updated At:">
          <p className="text-sm font-semibold">N/A</p>
        </SectionDetail>
        <SectionDetail icon="clarity:assign-user-solid" title="Tasks:">
          <p className="text-sm font-semibold">N/A</p>
        </SectionDetail>
        <SectionDetail icon="clarity:assign-user-solid" title="Comments:">
          <p className="text-sm font-semibold">N/A</p>
        </SectionDetail>
        <SectionDetail icon="clarity:assign-user-solid" title="Errors:">
          <p className="text-sm font-semibold">N/A</p>
        </SectionDetail>
        <SectionDetail
          icon="clarity:assign-user-solid"
          title="Warnings:"
          className="border-none"
        >
          <p className="text-sm font-semibold">N/A</p>
        </SectionDetail>
      </div>
    </div>
  );
}
