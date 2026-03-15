import { cn } from "@/lib/utils";

export function SandyLogo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        className="size-5 text-accent"
        aria-hidden="true"
      >
        <rect width="32" height="32" rx="7" fill="currentColor" />
        <path
          d="M16 6c-4 0-7 2.2-7 5.2 0 2.4 2 4 4.8 5l2.4 1c2 .8 2.8 1.6 2.8 3 0 1.8-1.8 3-4 3s-4.2-1.2-4.6-3.2"
          fill="none"
          stroke="var(--background)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M21.6 12.2c-.4-2-2.2-3.2-4.6-3.2"
          fill="none"
          stroke="var(--background)"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      <span className="font-mono text-sm font-semibold tracking-tight text-accent-foreground">
        andy
      </span>
    </span>
  );
}
