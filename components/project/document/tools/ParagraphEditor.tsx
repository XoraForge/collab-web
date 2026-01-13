import { Dispatch, SetStateAction, useEffect, useRef } from "react";

interface ParagraphEditorProps {
  className?: string;
  handleAddText: (text: string) => void; // HTML string
  value: string; // HTML string
  setCurrentSelection: Dispatch<SetStateAction<string>>;
}

export default function ParagraphEditor({
  className,
  handleAddText,
  value,
  setCurrentSelection,
}: ParagraphEditorProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value || "";
    }
  }, [value]);

  function handleSelectText() {
    const selection = window.getSelection();
    if (selection) {
      setCurrentSelection(selection.toString());
    }
  }

  return (
    <div
      ref={ref}
      role="textbox"
      className={className}
      contentEditable
      suppressContentEditableWarning
      style={{ whiteSpace: "pre-wrap", outline: "none" }}
      onBlur={(e) => handleAddText(e.currentTarget.innerHTML)}
      onMouseUp={handleSelectText}
    />
  );
}
