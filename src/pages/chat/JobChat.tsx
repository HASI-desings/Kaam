import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useAuthContext } from "../../context/AuthContext";
import { Message } from "../../types";
import MessageBubble from "../../components/chat/MessageBubble";
import MessageInput from "../../components/chat/MessageInput";

export default function JobChat() {
  const { id } = useParams();
  const { session } = useAuthContext();
  const [messages, setMessages] = useState<Message[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    supabase
      .from("messages")
      .select("*")
      .eq("job_id", id)
      .order("created_at", { ascending: true })
      .then(({ data }) => setMessages((data as Message[]) ?? []));

    const channel = supabase
      .channel(`chat-${id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "messages", filter: `job_id=eq.${id}` }, (payload) => {
        setMessages((prev) => {
          const next = payload.eventType === "INSERT" ? [...prev, payload.new as Message] : prev.map((m) => (m.id === (payload.new as Message)?.id ? (payload.new as Message) : m));
          return next;
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(text: string) {
    if (!session || !id) return;
    // Inserted as 'pending' by default — moderate-message Edge Function decides safe/violation.
    const { data, error } = await supabase
      .from("messages")
      .insert({ job_id: id, sender_id: session.user.id, content: text, status: "pending" })
      .select()
      .single();
    if (!error && data) {
      supabase.functions.invoke("moderate-message", { body: { messageId: data.id } });
    }
  }

  return (
    <div className="max-w-2xl mx-auto h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} isOwn={m.sender_id === session?.user.id} />
        ))}
        <div ref={bottomRef} />
      </div>
      <MessageInput onSend={handleSend} />
    </div>
  );
}
