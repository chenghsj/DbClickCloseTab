import { siGithub } from "simple-icons";

import { cn } from "@/lib/utils";

const GITHUB_URL = "https://github.com/chenghsj/DbClickCloseTab";

interface GitHubLinkProps {
  className?: string;
}

export function GitHubLink({ className }: GitHubLinkProps) {
  return (
    <a
      href={GITHUB_URL}
      target="_blank"
      rel="noreferrer"
      aria-label="View Double Middle-Click on GitHub"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 motion-reduce:transition-none",
        className,
      )}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="size-4 fill-current"
      >
        <path d={siGithub.path} />
      </svg>
      <span>GitHub</span>
    </a>
  );
}
