import React, { useCallback, useEffect, useRef } from "react";

type Props = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  /** Minimum visible rows */
  minRows?: number;
};

export default function ParagraphEditor({
  minRows = 1,
  style,
  className,
  ...props
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const adjustHeight = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    // Reset height so scrollHeight is recalculated, then set to scrollHeight
    ta.style.height = "auto";
    ta.style.height = `${ta.scrollHeight}px`;
  }, []);

  // Adjust on mount and when the controlled value changes
  useEffect(() => {
    adjustHeight();
  }, [props.value, adjustHeight]);

  // Observe size changes (width changes can affect wrapping -> height)
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => adjustHeight());
    ro.observe(ta);
    return () => ro.disconnect();
  }, [adjustHeight]);

  return (
    <textarea
      ref={textareaRef}
      {...props}
      rows={minRows}
      className={className}
      style={{
        height: "auto",
        overflow: "hidden",
        resize: "none",
        outline: "none",
        ...style,
      }}
      onInput={(e) => {
        adjustHeight();
        props.onInput?.(e as React.FormEvent<HTMLTextAreaElement>);
      }}
      onChange={(e) => {
        adjustHeight();
        props.onChange?.(e as React.ChangeEvent<HTMLTextAreaElement>);
      }}
    />
  );
}
