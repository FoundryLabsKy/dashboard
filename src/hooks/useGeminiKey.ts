"use client";

import { useCallback, useEffect, useState } from "react";
import { embeddedGeminiKey, GEMINI_KEY_SETTING } from "@/lib/ai";
import { useCompanies } from "./useCompanies";

/**
 * The Gemini API key. A key saved in Settings (cloud-synced) wins;
 * otherwise the built-in key keeps autofill working out of the box.
 */
export function useGeminiKey() {
  const { repo } = useCompanies();
  const [state, setState] = useState<{ loaded: boolean; stored: string | null }>({
    loaded: false,
    stored: null,
  });

  useEffect(() => {
    let cancelled = false;
    repo
      .getSetting(GEMINI_KEY_SETTING)
      .then((stored) => {
        if (!cancelled) setState({ loaded: true, stored });
      })
      .catch(() => {
        if (!cancelled) setState({ loaded: true, stored: null });
      });
    return () => {
      cancelled = true;
    };
  }, [repo]);

  const save = useCallback(
    async (key: string | null) => {
      await repo.setSetting(GEMINI_KEY_SETTING, key);
      setState({ loaded: true, stored: key });
    },
    [repo]
  );

  return {
    loaded: state.loaded,
    key: state.stored ?? embeddedGeminiKey(),
    stored: state.stored,
    isDefault: state.stored === null,
    save,
  };
}
