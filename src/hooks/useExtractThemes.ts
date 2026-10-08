import { useState } from "react";
import { extractLocalThemes, type LocalThemes, type ThemeKind } from "@/lib/localThemes";

// Same shape the onboarding screens always used, but the work now happens on
// the device (see lib/localThemes.ts) — free text never leaves the phone.
export function useExtractThemes() {
  const [isLoading, setIsLoading] = useState(false);
  const [error] = useState<string | null>(null);

  const extractThemes = async (
    text: string,
    type: ThemeKind
  ): Promise<LocalThemes | null> => {
    setIsLoading(true);
    try {
      return extractLocalThemes(text, type);
    } finally {
      setIsLoading(false);
    }
  };

  return { extractThemes, isLoading, error };
}
