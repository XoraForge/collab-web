import { Badge } from "@/components/ui/badge";
import ParagraphEditor from "../tools/ParagraphEditor";
import { UserCircle2 } from "lucide-react";

export default function A4() {
  return (
    <div className="w-[210mm] h-[297mm] bg-white dark:bg-[#2c2c2c] shadow-lg p-[25mm]">
      <div className="w-full bg-blue-100 dark:bg-blue-900 flex items-center relative">
        <div className="absolute left-0 -top-8">
          <Badge className="bg-blue-100 dark:bg-blue-900 text-black dark:text-white">
            <UserCircle2 />
            <p>Jian Wei</p>
          </Badge>
        </div>
        <ParagraphEditor className="w-full" />
      </div>
    </div>
  );
}
