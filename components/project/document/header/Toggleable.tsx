import { Button } from "@/components/ui/button";

export default function Toggleable() {
  return (
    <div className="flex items-center gap-x-1 p-0.5  rounded-md">
      <Button variant="outline" size="sm" className="text-xs">
        Info
      </Button>
      <Button variant="outline" size="sm" className="text-xs">
        Comments
      </Button>
    </div>
  );
}
