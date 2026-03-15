"use client";

import { useState, useCallback, useRef } from "react";

const MAX_HISTORY = 50;
const DEBOUNCE_MS = 500;

type HistoryState = {
  stack: string[];
  cursor: number;
};

export function useHistory(initialValue: string) {
  const [state, setState] = useState<HistoryState>({
    stack: [initialValue],
    cursor: 0,
  });
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastPushed = useRef(initialValue);

  const current = state.stack[state.cursor];

  const pushSnapshot = useCallback((value: string) => {
    if (value === lastPushed.current) return;
    lastPushed.current = value;
    setState((prev) => {
      // Discard any forward history beyond current cursor
      const truncated = prev.stack.slice(0, prev.cursor + 1);
      const next = [...truncated, value];
      // Cap at MAX_HISTORY (drop oldest entries)
      const capped = next.length > MAX_HISTORY ? next.slice(next.length - MAX_HISTORY) : next;
      return { stack: capped, cursor: capped.length - 1 };
    });
  }, []);

  const setValue = useCallback(
    (valueOrUpdater: string | ((prev: string) => string)) => {
      setState((prev) => {
        const currentVal = prev.stack[prev.cursor];
        const newVal = typeof valueOrUpdater === "function" ? valueOrUpdater(currentVal) : valueOrUpdater;
        if (newVal === currentVal) return prev;

        // Update the current entry immediately (for responsiveness)
        const updated = [...prev.stack];
        updated[prev.cursor] = newVal;

        // Schedule debounced snapshot push
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
          pushSnapshot(newVal);
        }, DEBOUNCE_MS);

        return { ...prev, stack: updated };
      });
    },
    [pushSnapshot],
  );

  const undo = useCallback(() => {
    // Flush any pending debounced snapshot before undoing
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
    setState((prev) => {
      if (prev.cursor <= 0) return prev;
      // If current value differs from the snapshot, push it first so we can redo back to it
      const currentVal = prev.stack[prev.cursor];
      if (currentVal !== lastPushed.current) {
        const truncated = prev.stack.slice(0, prev.cursor + 1);
        const withCurrent = [...truncated, currentVal];
        const capped = withCurrent.length > MAX_HISTORY ? withCurrent.slice(withCurrent.length - MAX_HISTORY) : withCurrent;
        lastPushed.current = capped[capped.length - 2];
        return { stack: capped, cursor: capped.length - 2 };
      }
      lastPushed.current = prev.stack[prev.cursor - 1];
      return { ...prev, cursor: prev.cursor - 1 };
    });
  }, []);

  const redo = useCallback(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
    setState((prev) => {
      if (prev.cursor >= prev.stack.length - 1) return prev;
      lastPushed.current = prev.stack[prev.cursor + 1];
      return { ...prev, cursor: prev.cursor + 1 };
    });
  }, []);

  const canUndo = state.cursor > 0;
  const canRedo = state.cursor < state.stack.length - 1;

  return { value: current, setValue, undo, redo, canUndo, canRedo };
}
