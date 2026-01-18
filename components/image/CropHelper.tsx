import { AlertCircle, Check, X } from "lucide-react";
import { Button } from "../ui/button";
import { Dispatch, SetStateAction } from "react";

export default function CropHelper({
  setImageSrc,
}: {
  setImageSrc: Dispatch<SetStateAction<string>>;
}) {
  return (
    <>
      <div className="absolute top-2 left-2 z-10">
        <div className="flex py-1 px-1.5 bg-white text-black gap-x-1 items-center rounded-md">
          <AlertCircle size={15} />
          <p className="text-[10px] font-medium">Please crop your image.</p>
        </div>
      </div>
      <div className="absolute bottom-2 right-2 z-10">
        <div className="flex gap-x-3 items-center">
          <Button variant="success">
            <Check />
          </Button>
          <Button variant="destructive" onClick={() => setImageSrc("")}>
            <X />
          </Button>
        </div>
      </div>
    </>
  );
}
