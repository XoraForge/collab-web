import { Input } from "../ui/input";
import Icon from "../ui/icon";
import { useCallback, useState } from "react";
import Image from "next/image";
import Cropper from "react-easy-crop";
import { Check, X } from "lucide-react";
import { Button } from "../ui/button";
import CropHelper from "./CropHelper";

type Area = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export default function ImageCropper() {
  const [imageSrc, setImageSrc] = useState("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setImageSrc(previewUrl);
  };

  return (
    <label className="h-[150px] flex flex-col gap-y-2 justify-center items-center border-2 border-dashed rounded-md relative cursor-pointer">
      {imageSrc != "" && <CropHelper setImageSrc={setImageSrc} />}
      {imageSrc == "" ? (
        <>
          <Icon icon="proicons:photo" fontSize={35} />
          <p className="text-sm font-medium">Upload Project Profile Image</p>
        </>
      ) : (
        <>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1} // square
            cropSize={{ width: 64, height: 64 }} // fixed 64x64
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />

          {/* Optional dark overlay */}
          <div className="pointer-events-none absolute inset-0 border border-white/60" />
        </>
      )}
      <Input
        type="file"
        className="hidden"
        onChange={handleImageChange}
        disabled={imageSrc != ""}
        accept="image/*"
      />
    </label>
  );
}
