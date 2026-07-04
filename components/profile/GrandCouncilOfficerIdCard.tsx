"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import type { LicenseApplication } from "@/data/license-applications";
import { formatLicenseDate, getRestrictionLabel } from "@/data/license-applications";
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
      className="absolute inset-0 overflow-hidden rounded-[0.85rem] border border-amber-500/30 shadow-[0_24px_70px_rgba(0,0,0,0.45)] [backface-visibility:hidden]"
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
      <p className={`text-[0.48rem] font-black uppercase tracking-[0.08em] text-black ${accent ? "text-amber-700" : ""}`}>
        {label}
      </p>
      <p
        className={`mt-0.5 border-b border-black/80 pb-0.5 font-semibold leading-tight text-black ${
          large ? "text-[0.95rem] sm:text-[1.05rem]" : "text-[0.62rem] sm:text-[0.68rem]"
        } ${accent ? "text-amber-800" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}

function OfficerCardFront({
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
  const profilePhoto = application?.uploads?.profilePhoto;
  const signatureImage = application?.uploads?.signature;
  const answers = application?.backgroundAnswers ?? {};

  const initials = user.fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  const fullName = showDetails && application ? application.fullName : showDetails ? user.fullName : "PENDING APPROVAL";
  const position =
    showDetails && application
      ? answers.officerPosition || application.positionTitle || getRestrictionLabel(application.restrictionCode)
      : "—";
  const region = showDetails && application ? answers.officerRegion || "—" : "—";
  const province = showDetails && application ? answers.officerProvince || application.addressProvince || "—" : "—";
  const office = showDetails && application ? answers.officerOffice || "—" : "—";
  const appointmentDate =
    showDetails && application ? formatLicenseDate(answers.appointmentDate) : preview ? "Pending" : "—";
  const idNumber = showDetails && application ? application.idNumber : "—";
  const committee = showDetails && application ? answers.committee || "—" : "—";
  const qrValue = showDetails && application ? application.idNumber : user.id;

  return (
    <div className="flex h-full bg-[#f7f3ea] text-black">
      <div className="relative flex w-[34%] flex-col bg-[#ece5d4] p-2">
        <div className="flex flex-1 items-center justify-center border border-black/15 bg-white">
          {showDetails && profilePhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt="" className="h-full w-full object-cover" src={profilePhoto} />
          ) : showDetails ? (
            <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(180deg,#d4d4d8,#a1a1aa)] font-display text-4xl text-white">
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
          <div className="grid h-10 w-10 place-items-center rounded-sm bg-black text-[0.42rem] font-black leading-none text-amber-300">
            GC
          </div>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between bg-black px-3 py-2 text-white">
          <div>
            <p className="font-display text-[1.05rem] leading-none tracking-[0.04em]">JUEGO TODO</p>
            <p className="text-[0.55rem] font-semibold tracking-[0.18em] text-amber-300">GRAND COUNCIL PH</p>
          </div>
          <div
            aria-hidden
            className="grid h-10 w-10 place-items-center bg-amber-400 text-[0.42rem] font-black leading-none text-black [clip-path:polygon(30%_0%,70%_0%,100%_30%,100%_70%,70%_100%,30%_100%,0%_70%,0%_30%)]"
          >
            GC
          </div>
        </div>

        <div className="relative flex-1 overflow-hidden bg-[#f0ead8] p-3">
          <div
            className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.07]"
            aria-hidden
          >
            <span className="font-display text-4xl uppercase tracking-[0.08em] text-black">Grand Council</span>
          </div>

          <div className="relative space-y-2">
            <FieldBlock label="Full Name" large value={fullName} />
            <FieldBlock accent label="Position" value={position} />
            <div className="grid grid-cols-2 gap-2">
              <FieldBlock label="Region" value={region} />
              <FieldBlock label="Province" value={province} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <FieldBlock label="Office" value={office} />
              <FieldBlock label="Appointment Date" value={appointmentDate} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <FieldBlock label="Officer ID" value={idNumber} />
              <FieldBlock label="Committee" value={committee} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-black via-zinc-900 to-amber-700 px-4 py-1.5">
          <p className="font-display text-[1.15rem] italic leading-none tracking-[0.08em] text-amber-100">
            Grand Council Officer
          </p>
        </div>
      </div>
    </div>
  );
}

function OfficerCardBack({
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
    <div className="relative flex h-full flex-col overflow-hidden bg-[#f2ead8] text-black">
      <div className="bg-black px-3 py-2">
        <p className="text-[0.55rem] font-black uppercase tracking-[0.12em] text-amber-300">Grand Council Officer Credentials</p>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-2 gap-0 px-3 py-3">
        <div className="min-w-0 pr-2">
          <p className="text-[0.42rem] font-black uppercase tracking-[0.08em] text-black">Service Record</p>
          <div className="mt-2 space-y-1 text-[0.38rem]">
            <BackField label="Years of Service" value={showDetails ? answers.yearsOfService || "" : ""} />
            <BackField label="Assigned Chapter" value={showDetails ? answers.assignedChapter || "" : ""} />
            <BackField label="Committee" value={showDetails ? answers.committee || "" : ""} />
            <BackField label="Office" value={showDetails ? answers.officerOffice || "" : ""} />
          </div>
        </div>

        <div className="min-w-0 border-l border-black/10 pl-2">
          <p className="text-[0.42rem] font-black uppercase tracking-[0.08em] text-black">Contact</p>
          <div className="mt-2 space-y-1 text-[0.38rem]">
            <BackField label="Email" value={showDetails && application ? application.contactEmail || application.userEmail : ""} />
            <BackField label="Mobile" value={showDetails && application ? application.mobileNumber || "" : ""} />
            <BackField label="Region" value={showDetails ? answers.officerRegion || "" : ""} />
            <BackField label="Province" value={showDetails ? answers.officerProvince || "" : ""} />
          </div>
        </div>
      </div>

      <div className="border-t border-black/10 bg-black px-3 py-2 text-center">
        <p className="text-[0.34rem] leading-[0.52rem] text-amber-100">
          This credential identifies an appointed officer of the Juego Todo Grand Council PH. Unauthorized duplication
          or misuse is prohibited.
        </p>
      </div>
    </div>
  );
}

function BackField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="flex items-end gap-1">
        <span className="shrink-0 font-black uppercase">{label} :</span>
        <span className="min-h-[0.7rem] flex-1 border-b border-black pb-0.5 leading-none">{value || " "}</span>
      </div>
    </div>
  );
}

export function GrandCouncilOfficerIdCard({
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
        onPointerMove={handlePointerMove}
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
            <OfficerCardFront application={application} approved={approved} preview={preview} user={user} />
          </CardShell>
          <CardShell rotateY={180}>
            <OfficerCardBack application={application} approved={approved} preview={preview} />
          </CardShell>
        </div>

        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-8 -bottom-4 h-8 rounded-[100%] bg-amber-500/20 blur-2xl"
        />
      </div>

      {preview ? (
        <p className="mt-4 text-center text-[0.62rem] font-black uppercase tracking-[0.16em] text-amber-200 lg:text-left">
          Preview — Grand Council Officer ID pending approval
        </p>
      ) : !showApprovedState ? (
        <p className="mt-4 text-center text-[0.62rem] font-black uppercase tracking-[0.16em] text-zinc-500 lg:text-left">
          {application?.status === "pending"
            ? "Awaiting Grand Council approval"
            : application?.status === "rejected"
              ? "Officer application not approved — resubmit required"
              : "Submit your Grand Council Officer application to unlock credentials"}
        </p>
      ) : (
        <p className="mt-4 text-center text-[0.62rem] font-black uppercase tracking-[0.16em] text-amber-300 lg:text-left">
          Official Grand Council Officer ID • {identity.memberId}
        </p>
      )}
    </div>
  );
}
