import { useState } from "react";
import { Link } from "react-router-dom";
import { Bot, Loader2, Send, Sparkles } from "lucide-react";
import { useExplainers } from "@/hooks/portal/useDebriefed";
import { askFinanceAssistant } from "@/lib/financeAssistant";
import { PortalCard } from "@/components/portal/PortalUI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const SUGGESTIONS = [
  "What is an IPO?",
  "Why do rate cuts matter?",
  "How do I apply to Meta Labs?",
  "How do I start budgeting?",
];

interface FinanceAssistantProps {
  compact?: boolean;
}

export default function FinanceAssistant({ compact }: FinanceAssistantProps) {
  const { data: explainers } = useExplainers();
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [reply, setReply] = useState<ReturnType<typeof askFinanceAssistant> | null>(null);

  const handleAsk = (q: string) => {
    const text = q.trim();
    if (!text) return;
    setLoading(true);
    setQuestion(text);
    // Brief delay feels more natural for "assistant" UX
    window.setTimeout(() => {
      setReply(
        askFinanceAssistant(
          text,
          explainers?.map((e) => ({
            title: e.title,
            summary: e.summary,
            body: e.body,
            slug: e.slug,
          })) ?? [],
        ),
      );
      setLoading(false);
    }, 400);
  };

  return (
    <PortalCard className={`border-emerald-400/15 bg-gradient-to-br from-emerald-500/[0.06] to-transparent ${compact ? "p-4" : "p-6"}`}>
      <div className="flex items-center gap-2">
        <div className="rounded-xl bg-emerald-500/20 p-2 text-emerald-300">
          <Bot className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-semibold text-white">Finance assistant</h3>
          <p className="text-xs text-white/45">
            Instant answers from explainers & Catalyst curriculum — inclusive of all levels
          </p>
        </div>
        <Sparkles className="ml-auto h-4 w-4 text-emerald-400/60" />
      </div>

      {!compact && (
        <div className="mt-4 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => handleAsk(s)}
              className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/55 transition hover:border-emerald-400/30 hover:text-emerald-200"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          handleAsk(question);
        }}
      >
        <Input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask anything about finance, labs, or the portal…"
          className="border-white/15 bg-white/[0.06] text-white placeholder:text-white/30"
        />
        <Button type="submit" disabled={loading} className="bg-emerald-500 hover:bg-emerald-400">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </form>

      {reply && (
        <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4">
          <p className="text-sm leading-relaxed text-white/75">{reply.answer}</p>
          {reply.sources.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {reply.sources.map((s) => (
                <Link
                  key={s.href}
                  to={s.href}
                  className="text-xs text-emerald-300 hover:underline"
                >
                  → {s.title}
                </Link>
              ))}
            </div>
          )}
          <p className="mt-2 text-[10px] uppercase tracking-wider text-white/30">
            Confidence: {reply.confidence}
          </p>
        </div>
      )}
    </PortalCard>
  );
}
