import A4 from "../paper/A4";

export default function Document() {
  return (
    <div className="w-full h-[calc(100vh-116px)] small-scrollbar overflow-y-auto flex justify-center bg-gray-300 dark:bg-[#161616] py-12">
      <A4 />
    </div>
  );
}
