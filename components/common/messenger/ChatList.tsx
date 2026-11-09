import ChatPreview from "./ChatPreview";

export default function ChatList({
  handleChatSelection,
}: {
  handleChatSelection: (selection: string) => void;
}) {
  return (
    <div className="flex flex-col overflow-y-auto small-scrollbar h-full">
      <p className="px-3 py-2 text-[11px] text-muted-text border-b">
        Preview with sample chats. Project chat rooms are coming soon.
      </p>
      <ChatPreview
        team="Business Analytics"
        message="You are so smart I wished you..."
        selectChat={() => handleChatSelection("Business Analytics")}
      />
      <ChatPreview
        team="Artifical Intelligence"
        message="Can someone review the SWOT section?"
        selectChat={() => handleChatSelection("Artifical Intelligence")}
      />
      <ChatPreview
        team="TeamCollab"
        message="Welcome to Collab. I am Jian Wei..."
        selectChat={() => handleChatSelection("TeamCollab")}
      />
    </div>
  );
}
