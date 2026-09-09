import { Message } from "../../types";

export default function MessageBubble({ message, isOwn }: { message: Message; isOwn: boolean }) {
  if (message.status === "violation") return null; // never shown to the other party, per Design.md 4.9

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
          isOwn ? "bg-teal text-white rounded-br-sm" : "bg-border-light dark:bg-border-dark text-text-light dark:text-text-dark rounded-bl-sm"
        }`}
      >
        {message.status === "pending" ? (
          <span className="inline-flex gap-1 items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-40 animate-pulse" />
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60 animate-pulse [animation-delay:150ms]" />
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80 animate-pulse [animation-delay:300ms]" />
          </span>
        ) : (
          message.content
        )}
      </div>
    </div>
  );
}
