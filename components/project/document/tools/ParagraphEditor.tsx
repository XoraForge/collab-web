import { Dispatch, SetStateAction } from "react";

interface ParagraphEditorProps {
  className?: string;
  handleAddText: (text: string) => void;
  value: string;
  setCurrentSelection: Dispatch<SetStateAction<string>>;
}

export default function ParagraphEditor({
  className,
  handleAddText,
  value,
  setCurrentSelection,
}: ParagraphEditorProps) {
  function handleSelectText() {
    const selection = window.getSelection();
    if (selection) {
      setCurrentSelection(selection.toString());
    }
  }
  return (
    <div
      role="textbox"
      className={className}
      contentEditable
      suppressContentEditableWarning
      style={{ whiteSpace: "pre-wrap", outline: "none" }}
      onBlur={(e) => handleAddText(e.currentTarget.innerText)}
      onMouseUp={handleSelectText}
    >
      {value}
    </div>
  );
}
