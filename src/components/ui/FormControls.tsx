import type { ButtonHTMLAttributes, InputHTMLAttributes, PropsWithChildren, ReactNode, TextareaHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

type BaseFieldProps = {
  label: string;
  hint?: string;
  counter?: string;
  error?: string;
};

export function Panel({
  children,
  className
}: PropsWithChildren<{
  className?: string;
}>) {
  return (
    <section className={cn('rounded-[1.75rem] border border-white/10 bg-[color:rgba(17,24,39,0.78)] shadow-2xl shadow-black/25 backdrop-blur', className)}>
      {children}
    </section>
  );
}

export function PanelHeader({
  eyebrow,
  title,
  description,
  action
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-white/10 px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-6">
      <div>
        {eyebrow ? <p className="text-xs font-medium uppercase tracking-[0.28em] text-[var(--brand-orange)]">{eyebrow}</p> : null}
        <h2 className="mt-1 text-xl font-semibold text-white">{title}</h2>
        {description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

function Meta({ hint, counter, error }: Pick<BaseFieldProps, 'hint' | 'counter' | 'error'>) {
  if (!hint && !counter && !error) {
    return null;
  }

  return (
    <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
      <span className={cn(error ? 'text-rose-300' : 'text-slate-500')}>{error ?? hint}</span>
      {counter ? <span className={cn('font-mono', error ? 'text-rose-300' : 'text-slate-500')}>{counter}</span> : null}
    </div>
  );
}

export function TextInput({
  label,
  hint,
  counter,
  error,
  className,
  ...props
}: BaseFieldProps & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-slate-200">{label}</span>
      </div>
      <input
        {...props}
        className={cn(
          'w-full rounded-2xl border border-white/10 bg-[color:rgba(17,24,39,0.82)] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-[color:rgba(249,115,22,0.65)] focus:ring-2 focus:ring-[color:rgba(249,115,22,0.14)]',
          className
        )}
      />
      <Meta hint={hint} counter={counter} error={error} />
    </label>
  );
}

export function TextareaInput({
  label,
  hint,
  counter,
  error,
  className,
  ...props
}: BaseFieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="block">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-slate-200">{label}</span>
      </div>
      <textarea
        {...props}
        className={cn(
          'min-h-[120px] w-full rounded-2xl border border-white/10 bg-[color:rgba(17,24,39,0.82)] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-[color:rgba(249,115,22,0.65)] focus:ring-2 focus:ring-[color:rgba(249,115,22,0.14)]',
          className
        )}
      />
      <Meta hint={hint} counter={counter} error={error} />
    </label>
  );
}

export function ToggleInput({
  label,
  hint,
  checked,
  onChange
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3">
      <div>
        <p className="text-sm font-medium text-slate-100">{label}</p>
        {hint ? <p className="mt-1 text-sm text-slate-400">{hint}</p> : null}
      </div>
      <button
        type="button"
        aria-pressed={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative mt-0.5 h-7 w-12 rounded-full border transition',
          checked ? 'border-[color:rgba(249,115,22,0.5)] bg-[color:rgba(249,115,22,0.28)]' : 'border-white/10 bg-slate-800'
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 h-5 w-5 rounded-full bg-white transition',
            checked ? 'left-[1.45rem]' : 'left-0.5'
          )}
        />
      </button>
    </div>
  );
}

export function Button({
  children,
  className,
  variant = 'primary',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
}) {
  const variantClassName =
    variant === 'primary'
      ? 'border border-[color:rgba(249,115,22,0.45)] bg-[color:rgba(249,115,22,0.16)] text-orange-50 hover:bg-[color:rgba(249,115,22,0.24)]'
      : variant === 'secondary'
        ? 'border border-white/10 bg-white/5 text-slate-100 hover:bg-white/10'
        : variant === 'danger'
          ? 'border border-rose-400/30 bg-rose-400/10 text-rose-100 hover:bg-rose-400/15'
          : 'border border-transparent bg-transparent text-slate-300 hover:bg-white/5 hover:text-white';

  return (
    <button
      {...props}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50',
        variantClassName,
        className
      )}
    >
      {children}
    </button>
  );
}

export function SmallBadge({ children, tone = 'default' }: PropsWithChildren<{ tone?: 'default' | 'warning' | 'success' }>) {
  const className =
    tone === 'warning'
      ? 'border-amber-400/25 bg-amber-400/10 text-amber-100'
      : tone === 'success'
        ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-100'
        : 'border-[color:rgba(249,115,22,0.22)] bg-[color:rgba(249,115,22,0.08)] text-orange-100';

  return <span className={cn('inline-flex rounded-full border px-2.5 py-1 text-xs font-medium', className)}>{children}</span>;
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/40 px-4 py-5 text-sm text-slate-400">
      <p className="font-medium text-slate-200">{title}</p>
      <p className="mt-1 leading-6">{description}</p>
    </div>
  );
}
