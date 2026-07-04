"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import type { LicenseApplication } from "@/data/license-applications";
import { formatLicenseDate, formatTrainerDisciplines } from "@/data/license-applications";
import type { ProfileIdentity } from "@/lib/profile/identity";
import type { UserProfile } from "@/lib/auth/types";

const MAX_ROT_X = 28;
const ROT_SENSITIVITY = 0.35;

function QrCode({ value }: { value: string }) {
  const cells = Array.from({ length: 81 }, (_, index) => (value.charCodeAt(index % value.length) + index) % 3 !== 0);

  return (
    <div
      aria-label={`QR code for ${value}`}
      className="grid h-16 w-16 shrink-0 grid-cols-9 gap-px rounded-sm border border-black/10 bg-white p-1"
    >
      {cells.map((filled, index) => (
        <div className={filled ? "bg-black" : "bg-white"} key={`${value}-${index}`} />
      ))}
    </div>
  );
}

function CardShell({ children, rotateY = 0 }: { children: ReactNode; rotateY?: number }) {
  return (
    <div
      className="absolute inset-0 overflow-hidden rounded-[0.85rem] border border-emerald-500/25 shadow-[0_24px_70px_rgba(0,0,0,0.45)] [backface-visibility:hidden]"
      style={{ transform: `rotateY(${rotateY}deg) translateZ(2px)` }}
    >
      {children}
    </div>
  );
}

function FieldBlock({
  label,
  value,
  accent = false,
  large = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
  large?: boolean;
}) {
  return (
    <div>
      <p className={`text-[0.48rem] font-black uppercase tracking-[0.08em] text-black ${accent ? "text-emerald-700" : ""}`}>
        {label}
      </p>
      <p
        className={`mt-0.5 border-b border-black/80 pb-0.5 font-semibold leading-tight text-black ${
          large ? "text-[0.95rem] sm:text-[1.05rem]" : "text-[0.62rem] sm:text-[0.68rem]"
        } ${accent ? "text-emerald-800" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}

function TrainerCardFront({
  application,
  user,
  approved,
  preview = false,
}: {
  application: LicenseApplication | null;
  user: UserProfile;
  approved: boolean;
  preview?: boolean;
}) {
  const showDetails = preview || approved;
  const answers = application?.backgroundAnswers ?? {};
  const signatureImage = application?.uploads?.signature;

  const initials = user.fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  const fullName = showDetails && application ? application.fullName : showDetails ? user.fullName : "PENDING APPROVAL";
  const disciplines = showDetails && application ? formatTrainerDisciplines(answers) || "—" : "—";
  const gym = showDetails && application ? answers.trainingGym || application.fightTeam || "—" : "—";
  const yearsTraining = showDetails && application ? answers.yearsTraining || "—" : "—";
  const idNumber = showDetails && application ? application.idNumber : "—";
  const issuedDate = showDetails && application ? formatLicenseDate(application.issuedDate) : preview ? "Pending" : "—";
  const expiryDate = showDetails && application ? formatLicenseDate(application.expiryDate) : preview ? "Pending" : "—";
  const qrValue = showDetails && application ? application.idNumber : user.id;

  return (
    <div className="flex h-full bg-white text-black">
      <div className="relative flex w-[34%] flex-col bg-[#efefef] p-2">
        <div className="flex flex-1 items-center justify-center border border-black/15 bg-white">
          {showDetails ? (
            <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(180deg,#10b981,#047857)] font-display text-4xl text-white">
              {initials}
            </div>
          ) : (
            <div className="h-full w-full bg-[linear-gradient(180deg,#e5e5e5,#d4d4d4)]" />
          )}
        </div>
        <div className="mt-2">
          {showDetails && signatureImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt="Signature" className="mx-auto h-8 max-w-full object-contain" src={signatureImage} />
          ) : (
            <div className="border-b border-black/80 pb-4" />
          )}
          <p className="mt-1 text-center text-[0.45rem] font-black uppercase tracking-[0.14em]">Signature</p>
        </div>
        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <QrCode value={qrValue} />
          <div className="grid h-10 w-10 place-items-center rounded-sm bg-emerald-700 text-[0.42rem] font-black leading-none text-white">
            TR
          </div>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between bg-emerald-950 px-3 py-2 text-white">
          <div>
            <p className="font-display text-[1.05rem] leading-none tracking-[0.04em]">JUEGO TODO</p>
            <p className="text-[0.55rem] font-semibold tracking-[0.18em] text-emerald-200">TRAINER LICENSE</p>
          </div>
          <div
            aria-hidden
            className="grid h-10 w-10 place-items-center bg-[#FF1010] text-[0.42rem] font-black leading-none text-white [clip-path:polygon(30%_0%,70%_0%,100%_30%,100%_70%,70%_100%,30%_100%,0%_70%,0%_30%)]"
          >
            JT
          </div>
        </div>

        <div className="relative flex-1 overflow-hidden bg-[#ececec] p-3">
          <div className="relative space-y-2">
            <FieldBlock label="Full Name" large value={fullName} />
            <FieldBlock accent label="Training Disciplines" value={disciplines} />
            <FieldBlock label="Gym" value={gym} />
            <div className="grid grid-cols-2 gap-2">
              <FieldBlock label="Trainer ID" value={idNumber} />
              <FieldBlock label="Years Training" value={yearsTraining} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <FieldBlock label="Issued" value={issuedDate} />
              <FieldBlock accent label="Expires" value={expiryDate} />
            </div>
          </div>
        </div>

        <div className="bg-emerald-800 px-4 py-1.5">
          <p className="font-display text-[1.15rem] italic leading-none tracking-[0.08em] text-white">Trainer</p>
        </div>
      </div>
    </div>
  );
}

function TrainerCardBack({
  application,
  approved,
  preview = false,
}: {
  application: LicenseApplication | null;
  approved: boolean;
  preview?: boolean;
}) {
  const showDetails = preview || approved;
  const answers = application?.backgroundAnswers ?? {};

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-[#f2f2f2] text-black">
      <div className="bg-emerald-950 px-3 py-2">
        <p className="text-[0.55rem] font-black uppercase tracking-[0.12em] text-emerald-100">Training Credentials</p>
      </div>

      <div className="flex-1 px-3 py-3">
        <div className="space-y-1 text-[0.38rem]">
          <BackField label="Disciplines" value={showDetails ? formatTrainerDisciplines(answers) : ""} />
          <BackField label="Gym" value={showDetails ? answers.trainingGym || "" : ""} />
          <BackField label="Years Training" value={showDetails ? answers.yearsTraining || "" : ""} />
          <BackField label="Certifications" multiline value={showDetails ? answers.certifications || "" : ""} />
          <BackField label="Email" value={showDetails && application ? application.contactEmail || application.userEmail : ""} />
          <BackField label="Mobile" value={showDetails && application ? application.mobileNumber || "" : ""} />
        </div>
      </div>

      <div className="border-t border-black/10 bg-emerald-950 px-3 py-2 text-center">
        <p className="text-[0.34rem] leading-[0.52rem] text-emerald-100">
          Authorized JTGC trainer credential. Valid for sanctioned training and athlete development programs.
        </p>
      </div>
    </div>
  );
}

function BackField({ label, value, multiline = false }: { label: string; value: string; multiline?: boolean }) {
  return (
    <div>
      <div className="flex items-end gap-1">
        <span className="shrink-0 font-black uppercase">{label} :</span>
        <span className="min-h-[0.7rem] flex-1 border-b border-black pb-0.5 leading-none">{value || " "}</span>
      </div>
      {multiline ? <div className="mt-1 min-h-[0.7rem] border-b border-black" /> : null}
    </div>
  );
}

export function TrainerLicenseIdCard({
  user,
  identity,
  application = null,
  preview = false,
}: {
  user: UserProfile;
  identity: ProfileIdentity;
  application?: LicenseApplication | null;
  preview?: boolean;
}) {
  const dragStart = useRef<{ x: number; y: number; rotX: number; rotY: number } | null>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isInteracting, setIsInteracting] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  const approved = application?.status === "approved";
  const showApprovedState = approved && !preview;

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  const updateRotation = useCallback((clientX: number, clientY: number) => {
    const start = dragStart.current;
    if (!start) {
      return;
    }

    setRotation({
      x: Math.max(-MAX_ROT_X, Math.min(MAX_ROT_X, start.rotX - (clientY - start.y) * ROT_SENSITIVITY)),
      y: start.rotY + (clientX - start.x) * ROT_SENSITIVITY,
    });
  }, []);

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (reduceMotion) {
      return;
    }

    setIsInteracting(true);
    dragStart.current = { x: event.clientX, y: event.clientY, rotX: rotation.x, rotY: rotation.y };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerUp() {
    setIsInteracting(false);
    dragStart.current = null;
  }

  return (
    <div className="w-full max-w-[28rem]">
      {!reduceMotion ? (
        <p className="mb-3 text-center text-[0.56rem] font-black uppercase tracking-[0.22em] text-zinc-500 lg:text-left">
          Drag to rotate
        </p>
      ) : null}

      <div
        className="relative mx-auto w-full touch-none select-none [perspective:1400px]"
        onPointerCancel={handlePointerUp}
        onPointerDown={handlePointerDown}
        onPointerMove={(event) => isInteracting && updateRotation(event.clientX, event.clientY)}
        onPointerUp={handlePointerUp}
      >
        <div
          className="relative mx-auto aspect-[1.58/1] w-full max-w-[28rem] cursor-grab active:cursor-grabbing"
          style={{
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
            transformStyle: "preserve-3d",
            transition: isInteracting ? "transform 80ms linear" : "transform 520ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          <CardShell>
            <TrainerCardFront application={application} approved={approved} preview={preview} user={user} />
          </CardShell>
          <CardShell rotateY={180}>
            <TrainerCardBack application={application} approved={approved} preview={preview} />
          </CardShell>
        </div>
      </div>

      {preview ? (
        <p className="mt-4 text-center text-[0.62rem] font-black uppercase tracking-[0.16em] text-emerald-300 lg:text-left">
          Preview — Trainer License pending approval
        </p>
      ) : !showApprovedState ? (
        <p className="mt-4 text-center text-[0.62rem] font-black uppercase tracking-[0.16em] text-zinc-500 lg:text-left">
          {application?.status === "pending"
            ? "Awaiting trainer license approval"
            : application?.status === "rejected"
              ? "Trainer license not approved — resubmit required"
              : "Submit your Trainer License application to unlock credentials"}
        </p>
      ) : (
        <p className="mt-4 text-center text-[0.62rem] font-black uppercase tracking-[0.16em] text-emerald-300 lg:text-left">
          Official JTGC Trainer License • {identity.memberId}
        </p>
      )}
    </div>
  );
}
