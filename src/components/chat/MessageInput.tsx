import { useState } from "react";

export default function MessageInput({ onSend }: { onSend: (text: string) => void }) {
  const [text, setText] = useState("");

  function handleSend() {
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
  }

  return (
    <div className="flex items-end gap-2 p-3 border-t border-border-light dark:border-border-dark">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
        rows={1}
        placeholder="Type a message…"
        className="flex-1 resize-none rounded-xl border border-border-light dark:border-border-dark bg-transparent px-4 py-2.5 max-h-32 transition-[height] duration-200 focus:outline-none focus:ring-2 focus:ring-teal"
      />
      <button
        onClick={handleSend}
        className="rounded-xl bg-teal text-white px-4 py-2.5 font-medium active:scale-[0.97] transition"
      >
        Send
      </button>
    </div>
  );
}
