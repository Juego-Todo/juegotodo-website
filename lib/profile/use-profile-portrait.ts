"use client";

import { useCallback, useEffect, useState } from "react";
import { getProfilePortrait, saveProfilePortrait } from "@/lib/profile/portrait-storage";

export function useProfilePortrait(userId: string | undefined, licensePhoto?: string | null) {
  const [userPortrait, setUserPortrait] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setUserPortrait(null);
      return;
    }

    setUserPortrait(getProfilePortrait(userId));
  }, [userId]);

  const portraitImage = userPortrait ?? licensePhoto ?? undefined;

  const savePortrait = useCallback(
    async (dataUrl: string) => {
      if (!userId) {
        return;
      }

      saveProfilePortrait(userId, dataUrl);
      setUserPortrait(dataUrl);
    },
    [userId],
  );

  const removePortrait = useCallback(async () => {
    if (!userId) {
      return;
    }

    saveProfilePortrait(userId, null);
    setUserPortrait(null);
  }, [userId]);

  return {
    portraitImage,
    savePortrait,
    removePortrait,
    hasUserPortrait: Boolean(userPortrait),
  };
}
