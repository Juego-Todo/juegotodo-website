"use client";

import { ShieldCheck } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import type { ProfileIdentity } from "@/lib/profile/identity";
import { getRoleMeta } from "@/lib/profile/identity";
import { accountTypeLabels, type UserProfile } from "@/lib/auth/types";

const MAX_ROT_X = 35;
const ROT_SENSITIVITY = 0.4;

function QrPlaceholder({ value }: { value: string }) {
  const cells = Array.from({ length: 64 }, (_, index) => (value.charCodeAt(index % value.length) + index) % 3 !== 0);

  return (
    <div
      aria-label={`QR code for ${value}`}
      className="grid h-20 w-20 shrink-0 grid-cols-8 gap-0.5 rounded-xl border border-[#FF1010]/25 bg-white p-1 sm:h-24 sm:w-24"
    >
      {cells.map((filled, index) => (
        <div className={filled ? "bg-black" : "bg-white"} key={`${value}-${index}`} />
      ))}
    </div>
  );
}

function LogoEmblem({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border-2 border-[#FF1010] bg-black shadow-[0_0_28px_rgba(255,16,16,0.35)] ${className}`}
    >
      <div className="diamond-plate absolute inset-0 opacity-80" aria-hidden />
      <Image
        alt=""
        aria-hidden
        className="relative h-full w-full object-contain p-1.5"
        height={96}
        src="/juego-todo-logo.png"
        width={96}
      />
    </div>
  );
}

function CardFace({
  children,
  className = "",
  rotateY = 0,
}: {
  children: React.ReactNode;
  className?: string;
  rotateY?: number;
}) {
  return (
    <div
      className={`absolute inset-0 overflow-hidden rounded-[1.35rem] border-2 border-[#FF1010]/80 shadow-[0_28px_90px_rgba(0,0,0,0.55)] [backface-visibility:hidden] ${className}`}
      style={{ transform: `rotateY(${rotateY}deg) translateZ(2px)` }}
    >
      <div className="diamond-plate absolute inset-0 opacity-90" aria-hidden />
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,16,16,0.18),transparent_42%)]"
        aria-hidden
      />
      <div className="relative h-full">{children}</div>
    </div>
  );
}

export function JtgcMemberIdCard({ user, identity }: { user: UserProfile; identity: ProfileIdentity }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef<{ x: number; y: number; rotX: number; rotY: number } | null>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isInteracting, setIsInteracting] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  const roles = identity.roles
    .filter((role) => role !== "fan")
    .slice(0, 3)
    .map((role) => getRoleMeta(role).shortLabel);
  const roleSummary = roles.join(" / ") || accountTypeLabels[user.accountType].toUpperCase();
  const status = identity.athlete?.status ?? "Active Member";
  const memberSince = new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(new Date(user.createdAt));

  const updateRotation = useCallback((clientX: number, clientY: number) => {
    const start = dragStart.current;
    if (!start) {
      return;
    }

    const deltaX = clientX - start.x;
    const deltaY = clientY - start.y;

    setRotation({
      x: Math.max(-MAX_ROT_X, Math.min(MAX_ROT_X, start.rotX - deltaY * ROT_SENSITIVITY)),
      y: start.rotY + deltaX * ROT_SENSITIVITY,
    });
  }, []);

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (reduceMotion) {
      return;
    }

    setIsInteracting(true);
    dragStart.current = {
      x: event.clientX,
      y: event.clientY,
      rotX: rotation.x,
      rotY: rotation.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!isInteracting) {
      return;
    }

    updateRotation(event.clientX, event.clientY);
  }

  function handlePointerUp() {
    setIsInteracting(false);
    dragStart.current = null;
  }

  const cardTransform = `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`;

  return (
    <div className="w-full max-w-[26rem] lg:w-[24rem]">
      {!reduceMotion ? (
        <p className="mb-3 text-center text-[0.56rem] font-black uppercase tracking-[0.22em] text-zinc-500 lg:text-left">
          Drag to rotate
        </p>
      ) : null}

      <div
        className="relative mx-auto w-full touch-none select-none [perspective:1400px] lg:mx-0"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        ref={cardRef}
      >
        <div
          className="relative h-[18rem] w-full cursor-grab active:cursor-grabbing"
          style={{
            transform: cardTransform,
            transformStyle: "preserve-3d",
            transition: isInteracting ? "transform 80ms linear" : "transform 520ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          <CardFace className="bg-[#050505] p-5">
            <div className="flex h-full flex-col justify-between">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[0.56rem] font-black uppercase tracking-[0.24em] text-[#FF1010]">
                    Juego Todo Official
                  </p>
                  <p className="mt-2 font-display text-[2rem] uppercase leading-none text-white sm:text-[2.35rem]">
                    Member Card
                  </p>
                  <p className="mt-2 text-[0.56rem] font-black uppercase tracking-[0.18em] text-zinc-400">
                    Weaponized Caged Fighting
                  </p>
                </div>
                <LogoEmblem className="h-16 w-16 shrink-0 sm:h-[4.5rem] sm:w-[4.5rem]" />
              </div>

              <div>
                <p className="text-[0.58rem] font-black uppercase tracking-[0.22em] text-zinc-500">Member</p>
                <p className="mt-1 font-display text-4xl uppercase leading-none text-white">{user.fullName}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[#FF1010] px-3 py-1 text-[0.58rem] font-black uppercase tracking-[0.16em] text-white">
                    {roleSummary}
                  </span>
                  <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-[0.58rem] font-black uppercase tracking-[0.16em] text-emerald-200">
                    {status}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-[0.56rem] font-black uppercase tracking-[0.2em] text-zinc-500">Member ID</p>
                <p className="font-stats text-lg font-bold tracking-[0.16em] text-white">{identity.memberId}</p>
              </div>
            </div>
          </CardFace>

          <CardFace className="bg-[#080808] p-5" rotateY={180}>
            <div className="flex h-full flex-col justify-between pt-10">
              <div className="absolute inset-x-0 top-7 h-10 bg-[#FF1010]" aria-hidden />

              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="inline-flex items-center gap-2 text-[0.56rem] font-black uppercase tracking-[0.18em] text-emerald-200">
                    <ShieldCheck size={14} aria-hidden />
                    Verified Credential
                  </p>
                  <div className="mt-2 grid gap-1.5 text-[0.68rem] sm:text-xs">
                    <div className="grid grid-cols-[5.75rem_minmax(0,1fr)] gap-2 border-b border-white/10 pb-1.5">
                      <span className="text-zinc-500">Email</span>
                      <span className="truncate text-right font-semibold text-white">{user.email}</span>
                    </div>
                    <div className="grid grid-cols-[5.75rem_minmax(0,1fr)] gap-2 border-b border-white/10 pb-1.5">
                      <span className="text-zinc-500">Affiliation</span>
                      <span className="truncate text-right font-semibold text-white">
                        {user.gym || identity.athlete?.team || "Independent"}
                      </span>
                    </div>
                    <div className="grid grid-cols-[5.75rem_minmax(0,1fr)] gap-2 border-b border-white/10 pb-1.5">
                      <span className="text-zinc-500">Region</span>
                      <span className="truncate text-right font-semibold text-white">
                        {user.city || identity.athlete?.region || "Philippines"}
                      </span>
                    </div>
                    <div className="grid grid-cols-[5.75rem_minmax(0,1fr)] gap-2">
                      <span className="text-zinc-500">Member Since</span>
                      <span className="text-right font-semibold text-white">{memberSince}</span>
                    </div>
                  </div>
                </div>
                <QrPlaceholder value={identity.memberId} />
              </div>

              <div className="border-t border-white/10 pt-3">
                <LogoEmblem className="h-12 w-12 shrink-0 opacity-90" />
              </div>
            </div>
          </CardFace>
        </div>

        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-8 -bottom-5 h-10 rounded-[100%] bg-[#FF1010]/20 blur-2xl transition-opacity duration-300"
          style={{ opacity: isInteracting ? 0.55 : 0.25 }}
        />
      </div>
    </div>
  );
}
