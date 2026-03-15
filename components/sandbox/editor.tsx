"use client";

import { useCallback, useRef } from "react";
import dynamic from "next/dynamic";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => <EditorSkeleton />,
});

const skeletonWidths = [60, 80, 45, 70, 55, 90, 50, 65, 75, 40, 85, 60];

function EditorSkeleton() {
  return (
    <div className="h-full w-full bg-[#1e1e1e] p-4">
      <div className="flex flex-col gap-2.5">
        {skeletonWidths.map((w, i) => (
          <div
            key={i}
            className="h-3 rounded bg-white/5 animate-pulse"
            style={{ width: `${w}%`, animationDelay: `${i * 50}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

type EditorProps = {
  value: string;
  onChange: (value: string) => void;
  componentName?: string;
};

export function Editor({ value, onChange, componentName }: EditorProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = useCallback(
    (val: string | undefined) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        onChange(val ?? "");
      }, 300);
    },
    [onChange]
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border/50 text-xs text-muted-foreground font-mono shrink-0">
        <span>Editor</span>
        {componentName && (
          <span className="px-1.5 py-0.5 rounded bg-muted/50 text-[10px]">
            {componentName}
          </span>
        )}
      </div>
      <div className="flex-1 overflow-hidden">
        <MonacoEditor
          height="100%"
          language="json"
          theme="vs-dark"
          value={value}
          onChange={handleChange}
          options={{
            minimap: { enabled: false },
            wordWrap: "on",
            fontSize: 13,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
          }}
        />
      </div>
    </div>
  );
}
