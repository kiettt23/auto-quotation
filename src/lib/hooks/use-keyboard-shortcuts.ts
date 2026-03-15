"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

type ShortcutHandler = () => void;

type ShortcutMap = {
  [key: string]: ShortcutHandler;
};

export function useKeyboardShortcuts(shortcuts?: ShortcutMap) {
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!(e.ctrlKey || e.metaKey)) return;
      // Skip if user is typing in an input
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      switch (e.key.toLowerCase()) {
        case "k":
          e.preventDefault();
          // Phase 08: open product search command palette
          shortcuts?.["k"]?.();
          break;
        case "n":
          e.preventDefault();
          shortcuts?.["n"]?.();
          break;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router, shortcuts]);
}
