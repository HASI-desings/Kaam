// Runs server-side before a message is ever visible to its recipient.
// Fails closed: on any internal error, the message stays 'pending' rather than delivering unchecked.
import { getServiceClient } from "../_shared/serviceClient.ts";

const PHONE_RE = /(\+?\d[\d\-\s]{7,}\d)/;
const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const HANDLE_RE = /(instagram|insta|snap(chat)?|whatsapp|wa\.me|telegram|@[a-zA-Z0-9_]{3,})/i;
const CUSS_WORDS = ["badword1", "badword2"]; // placeholder list — expand deliberately, keep it narrow per Rules.md #12

function looksLikeContactShare(text: string) {
  return PHONE_RE.test(text) || EMAIL_RE.test(text) || HANDLE_RE.test(text);
}
function containsCuss(text: string) {
  const lower = text.toLowerCase();
  return CUSS_WORDS.some((w) => lower.includes(w));
}

Deno.serve(async (req) => {
  try {
    const { messageId } = await req.json();
    const supabase = getServiceClient();

    const { data: message, error } = await supabase
      .from("messages")
      .select("id, content")
      .eq("id", messageId)
      .single();
    if (error || !message) return new Response(JSON.stringify({ error: "Message not found" }), { status: 404 });

    let status: "safe" | "violation" | "pending" = "safe";
    let reason = "";

    if (looksLikeContactShare(message.content)) {
      status = "pending"; // routes to human review, never auto-blocked, per Rules.md #12
      reason = "suspected_contact_share";
    } else if (containsCuss(message.content)) {
      const cleaned = message.content.replace(new RegExp(CUSS_WORDS.join("|"), "gi"), "***");
      await supabase.from("messages").update({ content: cleaned, status: "safe" }).eq("id", messageId);
      return new Response(JSON.stringify({ status: "safe", filtered: true }), { status: 200 });
    }

    await supabase.from("messages").update({ status }).eq("id", messageId);

    if (status === "pending") {
      await supabase.from("flagged_messages").insert({ message_id: messageId, reason, status: "pending" });
    }

    return new Response(JSON.stringify({ status }), { status: 200 });
  } catch (e) {
    // Fail closed
    try {
      const { messageId } = await req.json().catch(() => ({ messageId: null }));
      if (messageId) {
        const supabase = getServiceClient();
        await supabase.from("messages").update({ status: "pending" }).eq("id", messageId);
      }
    } catch (_) {}
    return new Response(JSON.stringify({ error: String(e), status: "pending" }), { status: 200 });
  }
});
