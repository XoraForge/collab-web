export default function ProjectTab({ title }: { title: string }) {
  return (
    <div className="cursor-pointer">
      <p className="text-[#ffffff50] duration-200 ease-in-out hover:text-[#ffffff] font-medium">
        {title}
      </p>
    </div>
  );
}
