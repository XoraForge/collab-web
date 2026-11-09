import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Round user avatar. Falls back to the user's initials when there's no image.
 */
export default function Avatar({
  src,
  name,
  size = 24,
  className,
}: {
  src?: string;
  name: string;
  size?: number;
  className?: string;
}) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full align-middle bg-border text-[10px] font-semibold",
        className
      )}
      style={{ width: size, height: size }}
      title={name}
    >
      {src ? (
        <Image
          src={src}
          fill
          sizes={`${size}px`}
          className="object-cover"
          alt={name}
        />
      ) : (
        initials
      )}
    </span>
  );
}
