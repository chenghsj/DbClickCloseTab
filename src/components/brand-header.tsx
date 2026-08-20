import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface BrandHeaderProps {
  children?: ReactNode;
  className?: string;
  iconClassName?: string;
  subtitle?: string;
  title: string;
  titleClassName?: string;
}

export function BrandHeader({
  children,
  className,
  iconClassName,
  subtitle,
  title,
  titleClassName,
}: BrandHeaderProps) {
  return (
    <header className={cn("flex items-center gap-3", className)}>
      <img
        src="/icon.png"
        alt=""
        width="40"
        height="40"
        className={cn("size-10 shrink-0 rounded-md", iconClassName)}
      />
      <div className="min-w-0 flex-1">
        <h1
          className={cn(
            "truncate text-lg font-semibold leading-tight tracking-tight",
            titleClassName,
          )}
        >
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-0.5 text-sm leading-snug text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      {children}
    </header>
  );
}
