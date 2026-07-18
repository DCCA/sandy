"use client";

import { Button } from "@/components/ui/button";
import { ModalOverlay } from "./modal-overlay";

type ConfirmDialogProps = {
  title: string;
  /** What will happen, stated concretely. Skip it when the title already says everything. */
  body?: React.ReactNode;
  confirmLabel: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * A short prompt in front of an irreversible action. Cancel is the default focus and
 * Escape cancels, so the safe outcome is the one you get by reflex.
 */
export function ConfirmDialog({
  title,
  body,
  confirmLabel,
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <ModalOverlay label={title} variant="centered" onClose={onCancel}>
      <div className="flex flex-col gap-3 p-4">
        <h2 className="text-sm font-semibold">{title}</h2>
        {body && <div className="text-xs leading-relaxed text-muted-foreground">{body}</div>}
        <div className="mt-1 flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-3 text-xs"
            onClick={onCancel}
            autoFocus
          >
            Cancel
          </Button>
          <Button
            variant={destructive ? "destructive" : "secondary"}
            size="sm"
            className="h-7 px-3 text-xs"
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </ModalOverlay>
  );
}
