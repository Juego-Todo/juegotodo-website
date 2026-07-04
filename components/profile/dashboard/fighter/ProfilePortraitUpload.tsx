"use client";

import { Camera, Loader2, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { readUploadAsDataUrl } from "@/lib/licenses/file-upload";

export function ProfilePortraitUpload({
  portraitImage,
  onSave,
  onRemove,
  compact = false,
}: {
  portraitImage?: string;
  onSave: (dataUrl: string) => Promise<void> | void;
  onRemove?: () => Promise<void> | void;
  compact?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);

    try {
      const dataUrl = await readUploadAsDataUrl(file);
      await onSave(dataUrl);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to upload photo.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className={compact ? "space-y-3" : "space-y-4"}>
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

      {portraitImage ? (
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative h-24 w-20 overflow-hidden rounded-2xl border border-white/10 bg-black/40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="Your profile portrait" className="h-full w-full object-cover object-top" src={portraitImage} />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/15 px-4 text-[0.62rem] font-black uppercase tracking-[0.14em] text-white transition hover:border-red-500/40"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
              type="button"
            >
              {uploading ? <Loader2 className="animate-spin" size={14} aria-hidden /> : <Camera size={14} aria-hidden />}
              Change Photo
            </button>
            {onRemove ? (
              <button
                className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/10 px-4 text-[0.62rem] font-black uppercase tracking-[0.14em] text-zinc-400 transition hover:border-red-500/30 hover:text-red-200"
                disabled={uploading}
                onClick={() => void onRemove()}
                type="button"
              >
                <Trash2 size={14} aria-hidden />
                Remove
              </button>
            ) : null}
          </div>
        </div>
      ) : (
        <button
          className="flex w-full flex-col items-center justify-center rounded-[1.25rem] border border-dashed border-white/15 bg-white/[0.02] px-6 py-8 text-center transition hover:border-red-500/35 hover:bg-red-500/5"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          type="button"
        >
          {uploading ? (
            <Loader2 className="animate-spin text-red-200" size={28} aria-hidden />
          ) : (
            <Camera className="text-red-200" size={28} aria-hidden />
          )}
          <p className="mt-4 text-sm font-black uppercase tracking-[0.14em] text-white">Add Profile Photo</p>
          <p className="mt-2 max-w-sm text-sm text-zinc-400">
            Upload a waist-up promotional photo. PNG or JPG, up to 2MB.
          </p>
        </button>
      )}

      {error ? <p className="text-sm text-red-300">{error}</p> : null}
    </div>
  );
}
