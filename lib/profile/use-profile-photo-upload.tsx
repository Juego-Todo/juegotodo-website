"use client";

import { AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import { ProfilePhotoCropModal } from "@/components/profile/ProfilePhotoCropModal";
import { readUploadAsDataUrl } from "@/lib/licenses/file-upload";

export function useProfilePhotoUpload(onSave: (dataUrl: string) => Promise<void> | void) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [cropSource, setCropSource] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);

    try {
      const dataUrl = await readUploadAsDataUrl(file);
      setCropSource(dataUrl);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to upload photo.");
    }
  }

  async function confirmCrop(croppedDataUrl: string) {
    setUploading(true);
    setError(null);

    try {
      await onSave(croppedDataUrl);
      setCropSource(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to save photo.");
    } finally {
      setUploading(false);
    }
  }

  const cropModal = (
    <>
      <input
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            void handleFile(file);
          }
          event.target.value = "";
        }}
        ref={inputRef}
        type="file"
      />
      <AnimatePresence>
        {cropSource ? (
          <ProfilePhotoCropModal
            imageSrc={cropSource}
            onCancel={() => setCropSource(null)}
            onConfirm={confirmCrop}
          />
        ) : null}
      </AnimatePresence>
    </>
  );

  return {
    inputRef,
    cropModal,
    uploading,
    error,
    openFilePicker: () => inputRef.current?.click(),
    clearError: () => setError(null),
  };
}
