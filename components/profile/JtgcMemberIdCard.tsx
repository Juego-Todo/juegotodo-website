"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import type { LicenseApplication } from "@/data/license-applications";
import {
  formatLicenseDate,
  getLicenseFightTeam,
  getRestrictionLabel,
  licenseRestrictionOptions,
  licenseReturnAddress,
} from "@/data/license-applications";
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

function CardShell({
  children,
  rotateY = 0,
}: {
  children: ReactNode;
  rotateY?: number;
}) {
  return (
    <div
      className="absolute inset-0 overflow-hidden rounded-[0.85rem] border border-black/10 shadow-[0_24px_70px_rgba(0,0,0,0.45)] [backface-visibility:hidden]"
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
      <p className={`text-[0.48rem] font-black uppercase tracking-[0.08em] text-black ${accent ? "text-[#FF1010]" : ""}`}>
        {label}
      </p>
      <p
        className={`mt-0.5 border-b border-black/80 pb-0.5 font-semibold leading-tight text-black ${
          large ? "text-[0.95rem] sm:text-[1.05rem]" : "text-[0.62rem] sm:text-[0.68rem]"
        } ${accent ? "text-[#FF1010]" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}

function LicenseCardFront({
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

  const initials = user.fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  const fullName = showDetails && application ? application.fullName : showDetails ? user.fullName : "PENDING APPROVAL";
  const position =
    showDetails && application
      ? application.title || application.positionTitle || getRestrictionLabel(application.restrictionCode)
      : "—";
  const nationality = showDetails && application ? application.nationality : "—";
  const gender = showDetails && application ? application.gender : "—";
  const dateOfBirth = showDetails && application ? formatLicenseDate(application.dateOfBirth) : "—";
  const idNumber = showDetails && application ? application.idNumber : "—";
  const fightTeam = showDetails && application ? getLicenseFightTeam(application) || "—" : "—";
  const restrictions = showDetails && application ? application.restrictions || "None" : "—";
  const issuedDate = showDetails && application ? formatLicenseDate(application.issuedDate) : preview ? "Pending" : "—";
  const expiryDate = showDetails && application ? formatLicenseDate(application.expiryDate) : preview ? "Pending" : "—";
  const qrValue = showDetails && application ? application.idNumber : user.id;

  return (
    <div className="flex h-full bg-white text-black">
      <div className="relative flex w-[34%] flex-col bg-[#efefef] p-2">
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
          <div className="h-10 w-10 rounded-br-[1.5rem] bg-[#FF1010]" aria-hidden />
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between bg-black px-3 py-2 text-white">
          <div>
            <p className="font-display text-[1.15rem] leading-none tracking-[0.04em]">JUEGO TODO</p>
            <p className="text-[0.55rem] font-semibold tracking-[0.18em]">PHILIPPINES</p>
          </div>
          <div
            aria-hidden
            className="grid h-10 w-10 place-items-center bg-[#FF1010] text-[0.42rem] font-black leading-none text-white [clip-path:polygon(30%_0%,70%_0%,100%_30%,100%_70%,70%_100%,30%_100%,0%_70%,0%_30%)]"
          >
            JT
          </div>
        </div>

        <div className="relative flex-1 overflow-hidden bg-[#ececec] p-3">
          <div
            className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.08]"
            aria-hidden
          >
            <span className="font-display text-5xl uppercase tracking-[0.08em] text-black">Juego Todo</span>
          </div>

          <div className="relative space-y-2">
            <FieldBlock label="Full Name" large value={fullName} />
            <FieldBlock label="Position / Title" value={position} />
            <div className="grid grid-cols-3 gap-2">
              <FieldBlock label="Nationality" value={nationality} />
              <FieldBlock label="Gender" value={gender} />
              <FieldBlock label="Date of Birth" value={dateOfBirth} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <FieldBlock label="ID Number" value={idNumber} />
              <FieldBlock label="Fight Team" value={fightTeam} />
            </div>
            <FieldBlock label="Restrictions" value={restrictions} />
            <div className="grid grid-cols-2 gap-2">
              <FieldBlock label="Issued Date" value={issuedDate} />
              <FieldBlock accent label="Expiry Date" value={expiryDate} />
            </div>
          </div>
        </div>

        <div className="bg-[#FF1010] px-4 py-1.5">
          <p className="font-display text-[1.35rem] italic leading-none tracking-[0.08em] text-white">Member</p>
        </div>
      </div>
    </div>
  );
}

function LicenseCardBack({
  application,
  approved,
  preview = false,
}: {
  application: LicenseApplication | null;
  approved: boolean;
  preview?: boolean;
}) {
  const showDetails = preview || approved;
  const activeCode = showDetails && application ? application.restrictionCode : null;

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-[#f2f2f2] text-black">
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.07]"
        aria-hidden
      >
        <span className="font-display -rotate-[18deg] text-[2.4rem] uppercase tracking-[0.18em] text-black">
          Juego Todo
        </span>
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 h-[3.25rem] w-[3.25rem] rounded-tr-[100%] bg-[#E31E24]"
      />

      <div className="relative grid min-h-0 flex-1 grid-cols-2 gap-0 px-2 pt-2">
        <div className="min-w-0 pr-1.5">
          <div className="bg-black px-1.5 py-[0.2rem]">
            <p className="text-[0.42rem] font-black uppercase tracking-[0.06em] text-white">I. Restriction</p>
          </div>
          <ul className="mt-1.5 space-y-0 text-[0.38rem] leading-[0.92rem]">
            {licenseRestrictionOptions.map((option) => {
              const isActive = activeCode === option.code;
              const dotIndex = option.label.indexOf(". ");
              const displayCode = option.label.slice(0, dotIndex + 1);
              const displayRole = option.label.slice(dotIndex + 2);

              return (
                <li
                  className={`flex gap-1 ${isActive ? "font-black text-[#E31E24]" : "font-semibold"}`}
                  key={option.code}
                >
                  <span className="w-[2rem] shrink-0 font-black">{displayCode}</span>
                  <span>{displayRole}</span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="min-w-0 pl-1.5">
          <div className="bg-black px-1.5 py-[0.2rem]">
            <p className="text-[0.42rem] font-black uppercase tracking-[0.06em] text-white">In Case Of Emergency</p>
          </div>
          <div className="mt-1.5 space-y-1 text-[0.38rem]">
            <EmergencyField label="Name" value={showDetails && application ? application.emergencyContactName : ""} />
            <EmergencyField
              label="Relationship"
              value={showDetails && application ? application.emergencyContactRelationship : ""}
            />
            <EmergencyField
              label="Address"
              multiline
              value={showDetails && application ? application.emergencyContactAddress : ""}
            />
            <EmergencyField
              label="Phone Number"
              value={showDetails && application ? application.emergencyContactPhone : ""}
            />
          </div>
          <p className="mt-2 text-[0.33rem] leading-[0.52rem] text-black">
            Please report any loss or damage from this card to the <strong>Juego Todo PH</strong> administration
            immediately. Replacement cards may be issued subject to applicable fees and procedures.
          </p>
        </div>
      </div>

      <div className="relative bg-black px-2 py-[0.2rem]">
        <p className="text-[0.42rem] font-black uppercase tracking-[0.06em] text-white">If Found, Please Return To:</p>
      </div>

      <div className="relative px-2 pb-2 pt-1.5 text-center">
        <p className="font-serif text-[0.92rem] font-bold uppercase leading-none tracking-[0.04em] text-black">
          {licenseReturnAddress.organization}
        </p>
        <p className="mt-1 text-[0.34rem] leading-[0.5rem] text-black">
          {licenseReturnAddress.line1} {licenseReturnAddress.line2}
        </p>
        <p className="mt-1.5 text-[0.33rem] leading-[0.5rem] text-black">
          By presenting this card, the member agrees to abide by the rules, regulations, and code of conduct set forth
          by Juego Todo Grand Council PH.
        </p>
        <p className="mt-1.5 text-[0.34rem] font-black italic leading-[0.48rem] text-black">
          “THE FIRST PROFESSIONAL FMA HYBRID IN PHILIPPINE HISTORY”
        </p>
        <div className="mx-auto mt-2 max-w-[9rem] border-b border-black" />
        <p className="mt-0.5 text-[0.32rem] font-black uppercase tracking-[0.1em] text-black">Chairman/Owner JGPH</p>
      </div>
    </div>
  );
}

function EmergencyField({
  label,
  value,
  multiline = false,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
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

export function JtgcMemberIdCard({
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
            <LicenseCardFront application={application} approved={approved} preview={preview} user={user} />
          </CardShell>
          <CardShell rotateY={180}>
            <LicenseCardBack application={application} approved={approved} preview={preview} />
          </CardShell>
        </div>

        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-8 -bottom-4 h-8 rounded-[100%] bg-[#FF1010]/20 blur-2xl"
        />
      </div>

      {preview ? (
        <p className="mt-4 text-center text-[0.62rem] font-black uppercase tracking-[0.16em] text-amber-200 lg:text-left">
          Preview — pending admin approval
        </p>
      ) : !showApprovedState ? (
        <p className="mt-4 text-center text-[0.62rem] font-black uppercase tracking-[0.16em] text-zinc-500 lg:text-left">
          {application?.status === "pending"
            ? "Awaiting admin approval"
            : application?.status === "rejected"
              ? "License not approved — resubmit your application"
              : "Submit your license application to unlock card details"}
        </p>
      ) : (
        <p className="mt-4 text-center text-[0.62rem] font-black uppercase tracking-[0.16em] text-emerald-300 lg:text-left">
          Official JTGC License • {identity.memberId}
        </p>
      )}
    </div>
  );
}
