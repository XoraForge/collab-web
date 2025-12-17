import React, { useEffect, useRef, useState } from "react";
import Icon from "../ui/icon";
import { Check } from "lucide-react";

export interface SelectItemProps {
  title: string;
  icon: string;
}

const baseClass =
  "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-2 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm flex items-center justify-between";

function ChevronDown(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export function Select({
  children,
  placeholder = "Select",
  value,
  defaultValue,
  onChange,
}: {
  children: React.ReactNode;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
}) {
  const items = React.Children.toArray(children).filter(
    React.isValidElement
  ) as React.ReactElement<SelectItemProps>[];
  const first = items[0]?.props?.title ?? undefined;

  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [selected, setSelected] = useState<string | undefined>(
    value ?? defaultValue ?? first
  );

  const rootRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);

  // displayedSelected will prefer the controlled `value` prop if provided
  const displayedSelected = value ?? selected;

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    }

    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    if (onChange && selected !== undefined && value === undefined)
      onChange(selected);
  }, [selected, onChange, value]);

  function toggle() {
    // when opening, set highlighted index to the current selection
    setIsOpen((s) => {
      const next = !s;
      if (next)
        setHighlightedIndex(
          items.findIndex((it) => it.props.title === (value ?? selected))
        );
      return next;
    });
  }

  function selectIndex(i: number) {
    const title = items[i]?.props?.title;
    if (!title) return;
    if (value === undefined) {
      // uncontrolled: update internal state
      setSelected(title);
    }
    // always notify
    if (onChange) onChange(title);
    setIsOpen(false);
    setHighlightedIndex(-1);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIsOpen(true);
      setHighlightedIndex((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIsOpen(true);
      setHighlightedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (isOpen && highlightedIndex >= 0) selectIndex(highlightedIndex);
      else setIsOpen(true);
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  }

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={toggle}
        onKeyDown={onKeyDown}
        className={baseClass}
      >
        <div className="flex items-center gap-x-2 truncate">
          {displayedSelected ? (
            <>
              <Icon
                icon={
                  items.find((it) => it.props.title === displayedSelected)
                    ?.props.icon ?? ""
                }
                className="w-4 h-4 shrink-0"
              />
              <span className="truncate text-sm">{displayedSelected}</span>
            </>
          ) : (
            <span className="text-sm text-muted-foreground">{placeholder}</span>
          )}
        </div>
        <span className="ml-2 flex items-center">
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </span>
      </button>

      {isOpen && (
        <ul
          role="listbox"
          aria-label="Select options"
          ref={listRef}
          className="absolute z-20 mt-1 w-full rounded-md border bg-popover p-1 shadow-md max-h-60 overflow-auto"
        >
          {items.map((child, idx) => {
            const { title, icon } = child.props;
            const isSelected = title === displayedSelected;
            const isHighlighted = idx === highlightedIndex;
            return (
              <li
                key={title}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setHighlightedIndex(idx)}
                onMouseLeave={() => setHighlightedIndex(-1)}
                onClick={() => selectIndex(idx)}
                className={`flex w-full cursor-pointer items-center gap-x-2 rounded-md px-2 py-1 text-sm ${
                  isHighlighted ? "bg-accent/60" : "hover:bg-accent/40"
                } ${isSelected ? "font-medium" : ""}`}
              >
                <Icon icon={icon} className="w-4 h-4 shrink-0" />
                <span className="truncate">{title}</span>
                {isSelected && (
                  <span className="ml-auto inline-flex items-center text-primary">
                    <Check size={15} />
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function SelectItem({ title, icon }: SelectItemProps) {
  // This component is used only as a data placeholder inside <Select> — it does not render anything by itself.
  // Silence unused var lint errors:
  void title;
  void icon;
  return null;
}
