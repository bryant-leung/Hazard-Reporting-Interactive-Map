import { useState } from "react";

function ChatInput({ onSend }) {
  const [newMessage, setNewMessage] = useState("");

  const handleSend = () => {
    if (!newMessage.trim()) return;
    onSend(newMessage);
    setNewMessage("");
  };

  return (
    <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
      <input
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder="Type a message..."
        style={{
          flex: 1,
          padding: "8px",
          border: "1px solid #ccc",
          borderRadius: "4px"
        }}
      />
      <button onClick={handleSend}>Send</button>
    </div>
  );
}

export default ChatInput;