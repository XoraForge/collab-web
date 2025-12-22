import { BookOpenText, X } from "lucide-react";

export default function NavigationTab({ title }: { title: string }) {
  return (
    <div className="flex gap-x-5 items-center bg-[#161616] w-fit px-3 py-2 rounded-tl-lg rounded-br-lg cursor-pointer">
      <div className="flex gap-x-2 items-center">
        <div className="p-1 border rounded-xs border-white">
          <BookOpenText size={15} />
        </div>
        <p className="text-xs font-medium">{title}</p>
      </div>

      <X size={15} />
    </div>
  );
}
