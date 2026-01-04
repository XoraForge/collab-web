interface ParagraphEditorProps {
  className?: string;
  handleAddText: (text: string) => void;
  value: string;
}

export default function ParagraphEditor({
  className,
  handleAddText,
  value,
}: ParagraphEditorProps) {
  return (
    <div
      role="textbox"
      className={className}
      contentEditable
      suppressContentEditableWarning
      style={{ whiteSpace: "pre-wrap", outline: "none" }}
      onBlur={(e) => handleAddText(e.currentTarget.innerText)}
    >
      {value}
    </div>
  );
}
