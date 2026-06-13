import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

type ManualMarkdownProps = {
  content: string;
};

export function ManualMarkdown({ content }: ManualMarkdownProps) {
  return (
    <div className="manual-prose">
      <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
    </div>
  );
}
