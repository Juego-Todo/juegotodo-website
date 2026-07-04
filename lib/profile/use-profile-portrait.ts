"use client";

import { useCallback, useState } from "react";
import { getProfilePortrait, saveProfilePortrait } from "@/lib/profile/portrait-storage";

export function useProfilePortrait(userId: string | undefined, licensePhoto?: string | null) {
  const [portraitOverride, setPortraitOverride] = useState<string | null | undefined>(undefined);
  const [trackedUserId, setTrackedUserId] = useState(userId);

  if (userId !== trackedUserId) {
    setTrackedUserId(userId);
    setPortraitOverride(undefined);
  }

  const storedPortrait = userId ? getProfilePortrait(userId) : null;
  const userPortrait = portraitOverride !== undefined ? portraitOverride : storedPortrait;

  const portraitImage = userPortrait ?? licensePhoto ?? undefined;

  const savePortrait = useCallback(
    async (dataUrl: string) => {
      if (!userId) {
        return;
      }

      saveProfilePortrait(userId, dataUrl);
      setPortraitOverride(dataUrl);
    },
    [userId],
  );

  const removePortrait = useCallback(async () => {
    if (!userId) {
      return;
    }

    saveProfilePortrait(userId, null);
    setPortraitOverride(null);
  }, [userId]);

  return {
    portraitImage,
    savePortrait,
    removePortrait,
    hasUserPortrait: Boolean(userPortrait),
  };
}
