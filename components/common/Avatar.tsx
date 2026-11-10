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
        // A plain <img>: uploaded pictures are served through the signed-in API proxy,
        // which Next's image optimizer can't reach with the user's session.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className="absolute inset-0 size-full object-cover" />
      ) : (
        initials
      )}
    </span>
  );
}
