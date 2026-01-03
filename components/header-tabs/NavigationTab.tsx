import { BookOpenText, X } from "lucide-react";

export default function NavigationTab({ title }: { title: string }) {
  return (
    <div className="flex gap-x-5 items-center w-fit px-3 py-2 rounded-tl-lg rounded-br-lg cursor-pointer bg-(--default-sidebar) border hover:bg-border transition-colors duration-200">
      <div className="flex gap-x-2 items-center">
        <div className="p-1 border border-border rounded-sm">
          <BookOpenText size={15} className="text-text)" />
        </div>
        <p className="text-xs font-medium text-text">{title}</p>
      </div>

      <X
        size={15}
        className="text-text) opacity-70 hover:opacity-100 transition-opacity duration-200"
      />
    </div>
  );
}
