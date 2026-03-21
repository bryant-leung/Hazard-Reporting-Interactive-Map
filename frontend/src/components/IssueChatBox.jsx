import { useState, useRef, useEffect, useMemo } from "react";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";

const mockChats = {
  1: [
    { id: 1, user: "Resident", text: "This pavement is blocked." },
    { id: 2, user: "Admin", text: "Thank you, we are investigating." }
  ],
  2: [
    { id: 3, user: "Resident", text: "The curb ramp is too steep." },
    { id: 4, user: "Admin", text: "We have logged this accessibility issue." }
  ],
  3: [
    { id: 5, user: "Resident", text: "This path is too narrow for wheelchairs." },
    { id: 6, user: "Admin", text: "We will inspect the location this week." }
  ]
};

function IssueChatBox({ reportId, role = "Resident" }) {
  const [localMessages, setLocalMessages] = useState([]);
  const bottomRef = useRef(null);

  const messages = useMemo(() => {
    return [...(mockChats[reportId] || []), ...localMessages];
  }, [reportId, localMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (text) => {
    const message = {
      id: Date.now(),
      user: role,
      text
    };

    setLocalMessages((prev) => [...prev, message]);
  };

  return (
    <div
      style={{
        marginTop: "20px",
        border: "1px solid #ccc",
        padding: "15px",
        width: "420px",
        backgroundColor: "#fff",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
      }}
    >
      <h3>Community Chat</h3>
      <p style={{ color: "#666" }}>Discussion for report #{reportId}</p>

      <div
        style={{
          maxHeight: "220px",
          overflowY: "auto",
          marginBottom: "10px",
          paddingRight: "4px"
        }}
      >
        {messages.map((msg) => (
          <ChatMessage key={msg.id} user={msg.user} text={msg.text} />
        ))}
        <div ref={bottomRef}></div>
      </div>

      <ChatInput onSend={handleSendMessage} />
    </div>
  );
}

export default IssueChatBox;