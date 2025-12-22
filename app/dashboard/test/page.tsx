import HelperIcon from "@/components/collab-docs/HelperIcon";
import HelperSection from "@/components/collab-docs/HelperSection";

export default function TestPage() {
  return (
    <div className="size-full">
      <div className="h-[75px] w-full flex flex-col py-2 px-6 gap-y-2 justify-center bg-[#404040]">
        {/* Clickeable -> Show dropdown*/}
        <div className="flex items-center gap-x-3">
          <p className="text-xs">Files</p>
          <p className="text-xs">View</p>
          <p className="text-xs">Insert</p>
          <p className="text-xs">Format</p>
          <p className="text-xs">Citation</p>
        </div>
        <div className="flex items-center gap-x-4">
          {/* Action -> (Undo / Redo) */}
          <HelperSection title="Action">
            <HelperIcon title="Redo" icon="material-symbols:undo" />
            <HelperIcon title="Undo" icon="material-symbols:redo" />
          </HelperSection>
          {/* Fonts */}
          <HelperSection title="Fonts">
            <HelperIcon title="Bold" icon="tabler:bold" />
            <HelperIcon title="Italic" icon="tabler:italic" />
            <HelperIcon title="Underline" icon="tabler:underline" />
          </HelperSection>
          {/* Paragraph */}
          <HelperSection title="Alignment">
            <HelperIcon title="Left" icon="iconoir:align-left" />
            <HelperIcon title="Center" icon="iconoir:align-center" />
            <HelperIcon title="Right" icon="iconoir:align-right" />
          </HelperSection>
        </div>
      </div>
      <div className="flex" style={{ height: "812px" }}>
        <div className="w-[85%] h-full overflow-y-auto flex justify-center no-scrollbar">
          <div className="w-[70%] bg-white h-full mt-5 text-black p-6">
            User can edit in here
          </div>
        </div>
        <div className="w-[15%] bg-[#202020] flex flex-col px-4 py-2">
          <div className="flex gap-x-2">
            <p className="text-xs">Tools</p>
            <p className="text-xs">Live Preview</p>
          </div>
        </div>
      </div>
    </div>
  );
}
