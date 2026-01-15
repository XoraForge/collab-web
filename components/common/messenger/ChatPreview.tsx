export default function ChatPreview({
  team,
  message,
  selectChat,
}: {
  team: string;
  message: string;
  selectChat: () => void;
}) {
  return (
    <div
      className="flex border px-2 py-4 border-[#00000025] dark:text-white text-black justify-between cursor-pointer"
      onClick={selectChat}
    >
      <div className="flex gap-x-2">
        {/* Profile */}
        <div className="size-10 rounded-full bg-gray-400"></div>
        {/* Name and messages */}
        <div className="flex flex-col justify-between">
          <h1 className="text-sm font-semibold">{team}</h1>
          <p className="text-xs font-medium">{message}</p>
        </div>
      </div>
      {/* DateTime */}
      <p className="text-[10px]">10:09AM</p>
    </div>
  );
}
