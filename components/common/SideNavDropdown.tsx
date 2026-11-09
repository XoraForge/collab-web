import { ChevronDown, ChevronUp } from "lucide-react";
import { SetStateAction } from "react";

interface SideNavDropdownProps {
  title: string;
  isOpen?: boolean;
  setIsOpen?: React.Dispatch<SetStateAction<boolean>>;
  noSetter?: boolean;
  children: React.ReactNode;
}

export default function SideNavDropdown({
  title,
  isOpen,
  setIsOpen,
  children,
  noSetter = false,
}: SideNavDropdownProps) {
  const showChildren = noSetter ? true : isOpen;
  return (
    <div className="flex flex-col">
      {noSetter ? (
        <div className="flex justify-between items-center">
          <h3 className="text-muted-text text-sm">{title}</h3>
        </div>
      ) : (
        <button
          type="button"
          aria-expanded={isOpen}
          className="flex justify-between items-center cursor-pointer text-left"
          onClick={() => setIsOpen && setIsOpen((prev) => !prev)}
        >
          <h3 className="text-muted-text text-sm">{title}</h3>
          {isOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
      )}

      {showChildren && (
        <div className="flex flex-col mt-2.5 gap-y-1.5">{children}</div>
      )}
    </div>
  );
}
