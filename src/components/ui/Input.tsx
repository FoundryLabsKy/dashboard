"use client";

import { forwardRef, useId } from "react";

const FIELD_CLASSES =
  "w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-ink placeholder:text-faint transition-colors focus:border-ember/50 focus:bg-white/[0.06] focus:outline-none";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, id, className = "", ...props },
  ref
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-[13px] font-medium text-muted">
          {label}
        </label>
      )}
      <input ref={ref} id={inputId} className={FIELD_CLASSES} {...props} />
      {hint && <p className="mt-1.5 text-xs text-faint">{hint}</p>}
    </div>
  );
});

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, id, className = "", ...props },
  ref
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-[13px] font-medium text-muted">
          {label}
        </label>
      )}
      <textarea ref={ref} id={inputId} className={`${FIELD_CLASSES} resize-y`} {...props} />
    </div>
  );
});
