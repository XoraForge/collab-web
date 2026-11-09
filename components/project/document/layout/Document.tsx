/** Grey canvas behind the page(s), with zoom. */
export default function Document({
  zoom,
  children,
}: {
  zoom: number;
  children: React.ReactNode;
}) {
  return (
    <div className="w-full flex-1 min-h-0 small-scrollbar overflow-auto flex bg-canvas py-12">
      {/* `mx-auto` centres the page but still lets it scroll when zoomed wider than the view */}
      <div className="mx-auto h-fit flex flex-col gap-y-8" style={{ zoom: zoom / 100 }}>
        {children}
      </div>
    </div>
  );
}
