import { cn } from '../../lib/utils';

export function HooksmithMark({
  className,
  tile = true
}: {
  className?: string;
  tile?: boolean;
}) {
  return (
    <svg viewBox="0 0 120 120" aria-hidden="true" className={cn(className)} fill="none">
      {tile ? <rect x="4" y="4" width="112" height="112" rx="26" fill="#111827" /> : null}
      <path d="M27 43 63 31h30v20H61l-22 7-12-5z" fill="#F3F4F6" />
      <path d="M87 31h10l10 8v16L93 46z" fill="#D1D5DB" />
      <path d="m65 23 18-4 5 8-22 2z" fill="#F97316" />
      <path d="M42 54v22c0 18 11 30 28 30 17 0 28-12 28-30 0-10-4-18-11-24" stroke="#F3F4F6" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M42 35v21" stroke="#F3F4F6" strokeWidth="11" strokeLinecap="round" />
      <path d="M68 62c-7 6-10 11-10 17 0 8 5 14 13 14 9 0 15-7 15-16 0-8-3-12-9-18 1 6-2 10-9 13z" fill="#F97316" />
      <path d="M33 43 30 57 20 52l2-9z" fill="#F3F4F6" />
      <path d="M48 37 42 54 33 43z" fill="#111827" opacity=".95" />
    </svg>
  );
}
