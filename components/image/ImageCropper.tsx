import { Input } from "../ui/input";
import Icon from "../ui/icon";
import { useCallback, useEffect, useState } from "react";
import Cropper from "react-easy-crop";
import { X } from "lucide-react";
import CropHelper from "./CropHelper";
import { Area, getCroppedImage } from "./cropImage";

export default function ImageCropper({
  onChange,
  prompt = "Upload Project Profile Image",
  doneLabel = "Project image set",
}: {
  /** Called with the cropped image as a JPEG data URL, or "" when removed. */
  onChange?: (dataUrl: string) => void;
  prompt?: string;
  doneLabel?: string;
}) {
  const [imageSrc, setImageSrc] = useState("");
  const [croppedImage, setCroppedImage] = useState("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  // Free the object URL of the previous upload.
  useEffect(() => {
    return () => {
      if (imageSrc) URL.revokeObjectURL(imageSrc);
    };
  }, [imageSrc]);

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;

    setImageSrc(URL.createObjectURL(file));
    setCroppedImage("");
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  async function handleConfirm() {
    if (!imageSrc || !croppedAreaPixels) return;
    const dataUrl = await getCroppedImage(imageSrc, croppedAreaPixels);
    setCroppedImage(dataUrl);
    onChange?.(dataUrl);
  }

  function handleReset() {
    setImageSrc("");
    setCroppedImage("");
    setCroppedAreaPixels(null);
    onChange?.("");
  }

  const isCropping = imageSrc !== "" && croppedImage === "";

  return (
    <label className="h-[150px] flex flex-col gap-y-2 justify-center items-center border-2 border-dashed rounded-md relative cursor-pointer overflow-hidden">
      {isCropping && (
        <CropHelper onConfirm={handleConfirm} onCancel={handleReset} />
      )}

      {imageSrc === "" && (
        <>
          <Icon icon="proicons:photo" fontSize={35} />
          <p className="text-sm font-medium">{prompt}</p>
        </>
      )}

      {isCropping && (
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
          <div className="pointer-events-none absolute inset-0 border border-white/60" />
        </>
      )}

      {croppedImage && (
        <div className="flex flex-col items-center gap-y-2">
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element -- local data URL preview */}
            <img
              src={croppedImage}
              alt="Preview"
              className="size-16 rounded-md object-cover border border-border"
            />
            <button
              type="button"
              aria-label="Remove image"
              onClick={(e) => {
                e.preventDefault();
                handleReset();
              }}
              className="absolute -top-2 -right-2 size-5 rounded-full bg-destructive text-white flex items-center justify-center hover:opacity-90"
            >
              <X size={12} />
            </button>
          </div>
          <p className="text-xs font-medium opacity-70">{doneLabel}</p>
        </div>
      )}

      <Input
        type="file"
        className="hidden"
        onChange={handleImageChange}
        disabled={imageSrc !== ""}
        accept="image/*"
      />
    </label>
  );
}
