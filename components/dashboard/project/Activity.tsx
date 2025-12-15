export default function Activity({
  date,
  time,
  children,
}: {
  date: string;
  time: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-y-2">
      <h1 className="font-medium">{date}</h1>
      <div className="flex gap-x-4">
        <p className="text-sm">{time}</p>
        {children}
      </div>
    </div>
  );
}
