import { Flame, Hammer } from 'lucide-react';
import { cn } from '../../lib/utils';

export function BrandLogo({
  size = 'md',
  showTagline = true,
  className
}: {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  className?: string;
}) {
  const iconSize = size === 'lg' ? 'h-16 w-16' : size === 'sm' ? 'h-10 w-10' : 'h-12 w-12';
  const titleClassName =
    size === 'lg'
      ? 'text-4xl sm:text-5xl'
      : size === 'sm'
        ? 'text-xl'
        : 'text-2xl sm:text-3xl';
  const taglineClassName = size === 'sm' ? 'text-[10px]' : 'text-xs sm:text-sm';

  return (
    <div className={cn('flex items-center gap-4', className)}>
      <div className="relative">
        <div className={cn('grid place-items-center rounded-[1.5rem] border border-white/10 bg-[var(--brand-navy)] shadow-lg shadow-black/25', iconSize)}>
          <Hammer className="h-[60%] w-[60%] -translate-y-1 rotate-[-12deg] text-white" strokeWidth={2.2} />
          <Flame className="absolute bottom-[16%] right-[16%] h-[32%] w-[32%] text-[var(--brand-orange)]" strokeWidth={2.2} />
        </div>
        <div className="absolute -top-1 right-2 h-2.5 w-6 rotate-[-12deg] rounded-sm bg-[var(--brand-orange)] shadow-sm shadow-[var(--brand-orange)]/40" />
      </div>

      <div>
        <div className={cn('font-black uppercase leading-none tracking-[0.06em]', titleClassName)}>
          <span className="text-[var(--brand-navy-ink)] dark:text-[var(--brand-ice)]">Hook</span>
          <span className="text-[var(--brand-orange)]">smith</span>
        </div>
        {showTagline ? (
          <p className={cn('mt-1 uppercase tracking-[0.28em] text-[var(--brand-slate)]', taglineClassName)}>
            Forge Discord Webhooks Visually.
          </p>
        ) : null}
      </div>
    </div>
  );
}
