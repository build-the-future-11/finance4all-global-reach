import { cn } from "@/lib/utils";
import { normalizeExternalHttpUrl } from "@/lib/external-url";

interface MarkdownContentProps {
  content: string;
  className?: string;
}

function inlineFormat(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    const token = match[0];
    if (token.startsWith("**")) {
      parts.push(
        <strong key={key++} className="font-semibold text-white">
          {token.slice(2, -2)}
        </strong>,
      );
    } else if (token.startsWith("`")) {
      parts.push(
        <code key={key++} className="rounded bg-white/10 px-1.5 py-0.5 text-emerald-300">
          {token.slice(1, -1)}
        </code>,
      );
    } else {
      const linkMatch = /\[([^\]]+)\]\(([^)]+)\)/.exec(token);
      if (linkMatch) {
        const href = normalizeExternalHttpUrl(linkMatch[2]);
        parts.push(href ? (
          <a
            key={key++}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-300 underline underline-offset-2 hover:text-emerald-200"
          >
            {linkMatch[1]}
          </a>
        ) : linkMatch[1]);
      }
    }
    last = match.index + token.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

export default function MarkdownContent({ content, className }: MarkdownContentProps) {
  const blocks = content.split(/\n\n+/);

  return (
    <div className={cn("prose prose-invert max-w-none text-sm leading-relaxed text-white/80", className)}>
      {blocks.map((block, i) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        if (trimmed.startsWith("### ")) {
          return (
            <h4 key={i} className="mb-2 mt-4 text-base font-semibold text-white">
              {inlineFormat(trimmed.slice(4))}
            </h4>
          );
        }
        if (trimmed.startsWith("## ")) {
          return (
            <h3 key={i} className="mb-2 mt-5 text-lg font-semibold text-white">
              {inlineFormat(trimmed.slice(3))}
            </h3>
          );
        }
        if (trimmed.startsWith("# ")) {
          return (
            <h2 key={i} className="mb-3 mt-6 text-xl font-bold text-white">
              {inlineFormat(trimmed.slice(2))}
            </h2>
          );
        }

        const lines = trimmed.split("\n");
        if (lines.every((l) => l.startsWith("- ") || l.startsWith("* "))) {
          return (
            <ul key={i} className="my-3 list-disc space-y-1.5 pl-5">
              {lines.map((line, j) => (
                <li key={j}>{inlineFormat(line.replace(/^[-*] /, ""))}</li>
              ))}
            </ul>
          );
        }

        if (lines.every((l) => /^\d+\. /.test(l))) {
          return (
            <ol key={i} className="my-3 list-decimal space-y-1.5 pl-5">
              {lines.map((line, j) => (
                <li key={j}>{inlineFormat(line.replace(/^\d+\. /, ""))}</li>
              ))}
            </ol>
          );
        }

        if (trimmed.startsWith("> ")) {
          return (
            <blockquote
              key={i}
              className="my-4 border-l-2 border-emerald-400/40 pl-4 italic text-white/65"
            >
              {inlineFormat(trimmed.replace(/^> /gm, ""))}
            </blockquote>
          );
        }

        return (
          <p key={i} className="my-3">
            {inlineFormat(trimmed.replace(/\n/g, " "))}
          </p>
        );
      })}
    </div>
  );
}
