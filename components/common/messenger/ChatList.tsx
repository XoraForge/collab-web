import ChatPreview from "./ChatPreview";

export default function ChatList({
  handleChatSelection,
}: {
  handleChatSelection: (selection: string) => void;
}) {
  return (
    <div className="flex flex-col overflow-y-auto small-scrollbar h-full">
      <ChatPreview
        team="Business Analytics"
        message="You are so smart I wished you..."
        selectChat={() => handleChatSelection("Business Analytics")}
      />
      <ChatPreview
        team="Artifical Intelligence"
        message="Wtf is this bs?"
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
