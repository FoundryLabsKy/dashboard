"use client";

import { useCallback, useEffect, useState } from "react";
import { GEMINI_KEY_SETTING } from "@/lib/ai";
import { useCompanies } from "./useCompanies";

/** The Gemini API key, loaded from cloud settings (or browser storage in demo mode). */
export function useGeminiKey() {
  const { repo } = useCompanies();
  const [state, setState] = useState<{ loaded: boolean; key: string | null }>({
    loaded: false,
    key: null,
  });

  useEffect(() => {
    let cancelled = false;
    repo
      .getSetting(GEMINI_KEY_SETTING)
      .then((key) => {
        if (!cancelled) setState({ loaded: true, key });
      })
      .catch(() => {
        if (!cancelled) setState({ loaded: true, key: null });
      });
    return () => {
      cancelled = true;
    };
  }, [repo]);

  const save = useCallback(
    async (key: string | null) => {
      await repo.setSetting(GEMINI_KEY_SETTING, key);
      setState({ loaded: true, key });
    },
    [repo]
  );

  return { loaded: state.loaded, key: state.key, save };
}
