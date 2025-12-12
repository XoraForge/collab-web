export default function HelperSection({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <section className="flex flex-col items-center gap-y-0.5">
      <div className="flex gap-x-1">{children}</div>
      <p className="text-[10px] opacity-25">{title}</p>
    </section>
  );
}
