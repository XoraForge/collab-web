import Avatar from "@/components/common/Avatar";

export default function ActivityDetail({
  name,
  imageUrl,
  children,
}: {
  name: string;
  imageUrl?: string | null;
  children: React.ReactNode;
}) {
  return (
    <p className="text-sm leading-normal">
      <Avatar src={imageUrl ?? undefined} name={name} className="mr-2" />
      <span className="font-medium">{name} </span>
      {children}
    </p>
  );
}
