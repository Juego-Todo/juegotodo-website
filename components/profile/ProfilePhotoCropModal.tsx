"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Loader2, X, ZoomIn } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  clampCropOffset,
  cropImageToSquare,
  getCoverBaseScale,
  loadImageElement,
  PROFILE_CROP_VIEWPORT_SIZE,
  type CropTransform,
} from "@/lib/profile/image-crop";

type ProfilePhotoCropModalProps = {
  imageSrc: string;
  onCancel: () => void;
  onConfirm: (croppedDataUrl: string) => Promise<void> | void;
};

export function ProfilePhotoCropModal({ imageSrc, onCancel, onConfirm }: ProfilePhotoCropModalProps) {
  const viewportSize = PROFILE_CROP_VIEWPORT_SIZE;
  const dragRef = useRef<{ pointerId: number; startX: number; startY: number; originX: number; originY: number } | null>(
    null,
  );
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);
  const [transform, setTransform] = useState<CropTransform>({ scale: 1, offsetX: 0, offsetY: 0 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    void loadImageElement(imageSrc).then((image) => {
      if (!active) {
        return;
      }

      setImageSize({ width: image.width, height: image.height });
      setTransform({ scale: 1, offsetX: 0, offsetY: 0 });
    });

    return () => {
      active = false;
    };
  }, [imageSrc]);

  const updateTransform = useCallback(
    (next: CropTransform) => {
      if (!imageSize) {
        setTransform(next);
        return;
      }

      const clamped = clampCropOffset(
        imageSize.width,
        imageSize.height,
        next.scale,
        viewportSize,
        next.offsetX,
        next.offsetY,
      );

      setTransform({
        scale: next.scale,
        offsetX: clamped.offsetX,
        offsetY: clamped.offsetY,
      });
    },
    [imageSize, viewportSize],
  );

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCancel();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  async function handleConfirm() {
    setSaving(true);
    setError(null);

    try {
      const cropped = await cropImageToSquare(imageSrc, transform, viewportSize);
      await onConfirm(cropped);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to save photo.");
    } finally {
      setSaving(false);
    }
  }

  const totalScale = imageSize
    ? getCoverBaseScale(imageSize.width, imageSize.height, viewportSize) * transform.scale
    : 1;
  const displayedW = imageSize ? imageSize.width * totalScale : viewportSize;
  const displayedH = imageSize ? imageSize.height * totalScale : viewportSize;
  const imageX = (viewportSize - displayedW) / 2 + transform.offsetX;
  const imageY = (viewportSize - displayedH) / 2 + transform.offsetY;

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[120] flex items-end justify-center bg-black/80 p-4 sm:items-center"
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      onClick={onCancel}
    >
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#090909] shadow-[0_30px_80px_rgba(0,0,0,0.65)]"
        exit={{ opacity: 0, y: 16 }}
        initial={{ opacity: 0, y: 16 }}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-photo-crop-title"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <p className="text-[0.58rem] font-black uppercase tracking-[0.18em] text-red-300">Profile Photo</p>
            <h2 className="mt-1 text-lg font-black uppercase tracking-[0.08em] text-white" id="profile-photo-crop-title">
              Crop To Fit
            </h2>
          </div>
          <button
            aria-label="Close crop dialog"
            className="rounded-full border border-white/10 p-2 text-zinc-400 transition hover:text-white"
            onClick={onCancel}
            type="button"
          >
            <X size={16} aria-hidden />
          </button>
        </div>

        <div className="px-5 py-5">
          <div
            className="relative mx-auto touch-none overflow-hidden rounded-full border-2 border-white/15 bg-black shadow-[inset_0_0_40px_rgba(0,0,0,0.45)]"
            onPointerCancel={() => {
              dragRef.current = null;
            }}
            onPointerDown={(event) => {
              if (!imageSize) {
                return;
              }

              dragRef.current = {
                pointerId: event.pointerId,
                startX: event.clientX,
                startY: event.clientY,
                originX: transform.offsetX,
                originY: transform.offsetY,
              };
              event.currentTarget.setPointerCapture(event.pointerId);
            }}
            onPointerMove={(event) => {
              const drag = dragRef.current;
              if (!drag || drag.pointerId !== event.pointerId || !imageSize) {
                return;
              }

              updateTransform({
                ...transform,
                offsetX: drag.originX + (event.clientX - drag.startX),
                offsetY: drag.originY + (event.clientY - drag.startY),
              });
            }}
            onPointerUp={(event) => {
              if (dragRef.current?.pointerId === event.pointerId) {
                dragRef.current = null;
              }
            }}
            style={{ width: viewportSize, height: viewportSize }}
          >
            {imageSize ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt="Crop preview"
                className="absolute max-w-none select-none"
                draggable={false}
                src={imageSrc}
                style={{
                  width: displayedW,
                  height: displayedH,
                  left: imageX,
                  top: imageY,
                }}
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="animate-spin text-red-300" size={28} aria-hidden />
              </div>
            )}
            <div className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-white/10" aria-hidden />
          </div>

          <p className="mt-4 text-center text-xs text-zinc-400">Drag to reposition. Use the slider to zoom in or out.</p>

          <label className="mt-5 block">
            <span className="flex items-center gap-2 text-[0.58rem] font-black uppercase tracking-[0.16em] text-zinc-500">
              <ZoomIn size={12} aria-hidden />
              Zoom
            </span>
            <input
              className="mt-2 w-full accent-[#FF1010]"
              max={3}
              min={1}
              onChange={(event) =>
                updateTransform({
                  ...transform,
                  scale: Number(event.target.value),
                })
              }
              step={0.01}
              type="range"
              value={transform.scale}
            />
          </label>

          {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}
        </div>

        <div className="grid grid-cols-2 gap-3 border-t border-white/10 px-5 py-4">
          <button
            className="min-h-11 rounded-full border border-white/10 px-4 text-[0.62rem] font-black uppercase tracking-[0.14em] text-zinc-300 transition hover:border-white/20 hover:text-white"
            disabled={saving}
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
          <button
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#FF1010] px-4 text-[0.62rem] font-black uppercase tracking-[0.14em] text-white transition hover:bg-[#ff2828] disabled:opacity-60"
            disabled={saving || !imageSize}
            onClick={() => void handleConfirm()}
            type="button"
          >
            {saving ? <Loader2 className="animate-spin" size={14} aria-hidden /> : null}
            Save Photo
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
