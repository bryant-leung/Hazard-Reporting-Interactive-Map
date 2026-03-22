function ChatMessage({ user, text }) {
  const isAdmin = user === "Admin";

  return (
    <div
      style={{
        marginBottom: "8px",
        padding: "8px",
        borderRadius: "6px",
        backgroundColor: isAdmin ? "#eef4ff" : "#f4f4f4",
        borderLeft: isAdmin ? "4px solid #3366cc" : "4px solid #666"
      }}
    >
      <strong>{user}:</strong> {text}
    </div>
  );
}

export default ChatMessage;