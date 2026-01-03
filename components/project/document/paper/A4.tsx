import ParagraphEditor from "../tools/ParagraphEditor";

export default function A4() {
  return (
    <div className="w-[210mm] h-[297mm] bg-white dark:bg-[#2c2c2c] shadow-lg p-[25mm]">
      <div className="w-full bg-blue-100 dark:bg-blue-900 flex items-center">
        <ParagraphEditor className="w-full" />
      </div>
    </div>
  );
}
