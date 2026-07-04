"use client";

import { Upload } from "lucide-react";
import type { ReactNode } from "react";

export function FormGroup({
  title,
  description,
  children,
  columns = 2,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  columns?: 2 | 3;
}) {
  const gridClass = columns === 3 ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2";

  return (
    <section className="rounded-2xl border border-white/8 bg-black/20 p-4 sm:p-5">
      <div className="mb-4 border-b border-white/8 pb-3">
        <h3 className="text-xs font-black uppercase tracking-[0.18em] text-white">{title}</h3>
        {description ? <p className="mt-1.5 text-xs leading-5 text-zinc-500">{description}</p> : null}
      </div>
      <div className={`grid gap-4 ${gridClass}`}>{children}</div>
    </section>
  );
}

export function Field({
  label,
  value,
  onChange,
  type = "text",
  className = "",
  required = false,
  placeholder,
  readOnly = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  className?: string;
  required?: boolean;
  placeholder?: string;
  readOnly?: boolean;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="text-[0.62rem] font-black uppercase tracking-[0.16em] text-zinc-500">{label}</span>
      <input
        className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white outline-none ring-red-500/40 read-only:cursor-not-allowed read-only:opacity-70 focus:ring-4"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        required={required}
        type={type}
        value={value}
      />
    </label>
  );
}

export function TextAreaField({
  label,
  value,
  onChange,
  className = "",
  required = false,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="text-[0.62rem] font-black uppercase tracking-[0.16em] text-zinc-500">{label}</span>
      <textarea
        className="mt-2 min-h-24 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white outline-none ring-red-500/40 focus:ring-4"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        value={value}
      />
    </label>
  );
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  optionLabels,
  className = "",
  required = false,
  placeholder = "Select...",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  optionLabels?: Record<string, string>;
  className?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="text-[0.62rem] font-black uppercase tracking-[0.16em] text-zinc-500">{label}</span>
      <select
        className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white outline-none ring-red-500/40 focus:ring-4"
        onChange={(event) => onChange(event.target.value)}
        required={required}
        value={value}
      >
        {!value ? <option value="">{placeholder}</option> : null}
        {options.map((option) => (
          <option key={option} value={option}>
            {optionLabels?.[option] ?? option}
          </option>
        ))}
      </select>
    </label>
  );
}

export function FileUploadField({
  label,
  value,
  onFileSelect,
  accept,
  required = false,
  className = "",
}: {
  label: string;
  value: string;
  onFileSelect: (file: File) => Promise<void> | void;
  accept: string;
  required?: boolean;
  className?: string;
}) {
  const fileName = value ? "File uploaded" : "No file selected";

  return (
    <label className={`block ${className}`}>
      <span className="text-[0.62rem] font-black uppercase tracking-[0.16em] text-zinc-500">{label}</span>
      <div className="mt-2 rounded-xl border border-dashed border-white/15 bg-black/30 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className={`text-sm ${value ? "text-emerald-200" : "text-zinc-400"}`}>{fileName}</p>
            <p className="mt-1 text-xs text-zinc-500">PNG, JPG, or PDF up to 2MB</p>
          </div>
          <span className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-full border border-white/10 px-4 text-xs font-black uppercase tracking-[0.14em] text-white">
            <Upload className="mr-2" size={14} aria-hidden />
            Choose File
          </span>
        </div>
        <input
          accept={accept}
          className="mt-3 block w-full text-xs text-zinc-400 file:mr-3 file:rounded-full file:border-0 file:bg-[#FF1010] file:px-4 file:py-2 file:text-xs file:font-black file:uppercase file:tracking-[0.14em] file:text-white"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              void onFileSelect(file);
            }
          }}
          required={required && !value}
          type="file"
        />
      </div>
    </label>
  );
}
