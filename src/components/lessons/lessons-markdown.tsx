import Link from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { normalizeLessonsHref } from "@/lib/lessons/paths";

type LessonsMarkdownProps = {
  content: string;
};

function LessonsLink({
  href,
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { children?: ReactNode }) {
  if (!href) {
    return <span>{children}</span>;
  }

  const normalized = normalizeLessonsHref(href);
  const external = normalized.startsWith("http");

  if (external) {
    return (
      <a href={normalized} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    );
  }

  return (
    <Link href={normalized} {...props}>
      {children}
    </Link>
  );
}

export function LessonsMarkdown({ content }: LessonsMarkdownProps) {
  return (
    <div className="lessons-prose">
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children, ...props }) => (
            <LessonsLink href={href} {...props}>
              {children}
            </LessonsLink>
          ),
        }}
      >
        {content}
      </Markdown>
    </div>
  );
}
