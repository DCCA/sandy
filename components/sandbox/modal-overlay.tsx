"use client";

import { useEffect, useRef } from "react";

type ModalOverlayProps = {
  /** Accessible name for the dialog. */
  label: string;
  /** Fullscreen for working surfaces, centered for a short prompt. */
  variant?: "fullscreen" | "centered";
  onClose: () => void;
  children: React.ReactNode;
};

const VARIANTS = {
  fullscreen:
    "fixed inset-0 z-50 m-0 h-full max-h-none w-full max-w-none flex-col bg-background/95 p-0 text-foreground backdrop-blur-md open:flex",
  centered:
    "fixed inset-0 z-50 m-auto h-fit w-full max-w-sm flex-col rounded-lg border border-border/50 bg-background p-0 text-foreground shadow-2xl shadow-black/40 open:flex",
} as const;

/**
 * Full-screen modal surface for the builder and the library.
 *
 * Both used to be a plain `fixed inset-0` div, which paints over the sandbox without
 * actually being modal: focus stayed on the toolbar button behind it, Tab walked the
 * invisible editor and toolbar underneath, Escape did nothing, and a screen reader read
 * the whole covered page as if it were still on screen.
 *
 * A native <dialog> opened with showModal() gets all of that from the browser - focus
 * moves in, focus is trapped, the rest of the document goes inert, and Escape closes -
 * so there is no hand-rolled focus trap to keep correct.
 */
export function ModalOverlay({
  label,
  variant = "fullscreen",
  onClose,
  children,
}: ModalOverlayProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof el.showModal === "function") {
      if (!el.open) el.showModal();
    } else {
      // jsdom has no showModal, and a <dialog> without `open` is display:none, so unit
      // tests would render nothing. Degrade to a non-modal open dialog there; the real
      // modality is verified in the Playwright specs.
      el.open = true;
    }

    return () => {
      if (!el.open) return;
      // Same jsdom gap as showModal: close() is missing there too.
      if (typeof el.close === "function") el.close();
      else el.open = false;
    };
  }, []);

  return (
    <dialog
      ref={ref}
      aria-label={label}
      // Escape fires `cancel`; take it over so closing always goes through our state.
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      className={VARIANTS[variant]}
    >
      {children}
    </dialog>
  );
}
