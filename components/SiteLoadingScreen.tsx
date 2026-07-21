"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

const MIN_VISIBLE_MS = 1400;
const FADE_MS = 0.65;

export function SiteLoadingScreen() {
  const prefersReducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let active = true;
    const startedAt = Date.now();

    function dismiss() {
      const elapsed = Date.now() - startedAt;
      const delay = prefersReducedMotion ? 0 : Math.max(0, MIN_VISIBLE_MS - elapsed);

      window.setTimeout(() => {
        if (active) {
          setVisible(false);
        }
      }, delay);
    }

    if (document.readyState === "complete") {
      dismiss();
    } else {
      window.addEventListener("load", dismiss, { once: true });
    }

    return () => {
      active = false;
      window.removeEventListener("load", dismiss);
    };
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [visible]);

  return (
    <AnimatePresence mode="wait">
      {visible ? (
        <motion.div
          animate={{ opacity: 1 }}
          aria-busy="true"
          aria-label="Loading Juego Todo"
          className="site-loader fixed inset-0 z-[200] flex items-center justify-center overflow-hidden bg-[#050505]"
          exit={{ opacity: 0 }}
          initial={{ opacity: 1 }}
          role="status"
          transition={{ duration: prefersReducedMotion ? 0.2 : FADE_MS, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="cinematic-grid absolute inset-0 opacity-40" aria-hidden />
          <div
            className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(255,16,16,0.2),transparent_42rem),radial-gradient(circle_at_18%_82%,rgba(153,0,0,0.14),transparent_28rem)]"
            aria-hidden
          />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#FF1010]/50 to-transparent" aria-hidden />

          <div className="relative z-10 flex flex-col items-center px-6 text-center">
            <motion.div
              animate={
                prefersReducedMotion
                  ? { opacity: 1 }
                  : { opacity: 1, scale: [0.94, 1, 0.98, 1] }
              }
              className="site-loader-logo-shell relative grid place-items-center rounded-[2rem] border border-[#FF1010]/35 bg-black p-3 shadow-[0_0_48px_rgba(255,16,16,0.35)] sm:rounded-[2.25rem] sm:p-4"
              initial={{ opacity: 0, scale: 0.9 }}
              transition={{
                duration: prefersReducedMotion ? 0.2 : 0.9,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <div className="site-loader-logo-ring absolute inset-0 rounded-[inherit]" aria-hidden />
              <Image
                alt="Juego Todo official logo"
                className="relative z-10 h-24 w-24 object-contain sm:h-32 sm:w-32"
                height={128}
                priority
                src="/juego-todo-logo.png"
                width={128}
              />
            </motion.div>

            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 sm:mt-10"
              initial={{ opacity: 0, y: 12 }}
              transition={{ delay: prefersReducedMotion ? 0 : 0.2, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="font-display text-4xl uppercase leading-none tracking-wide text-white sm:text-5xl">
                Juego Todo
              </p>
            </motion.div>

            <motion.div
              animate={{ opacity: 1 }}
              aria-hidden
              className="mt-10 w-44 sm:mt-12 sm:w-52"
              initial={{ opacity: 0 }}
              transition={{ delay: prefersReducedMotion ? 0 : 0.35, duration: 0.45 }}
            >
              <div className="h-px overflow-hidden rounded-full bg-white/10">
                <div className="site-loader-progress h-full rounded-full bg-gradient-to-r from-[#990000] via-[#FF1010] to-[#ff5050]" />
              </div>
            </motion.div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
