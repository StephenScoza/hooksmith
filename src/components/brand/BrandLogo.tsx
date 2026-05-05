import { cn } from '../../lib/utils';
import { HooksmithMark } from './HooksmithMark';

export function BrandLogo({
  size = 'md',
  showTagline = true,
  className
}: {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  className?: string;
}) {
  const iconSize = size === 'lg' ? 'h-20 w-20' : size === 'sm' ? 'h-11 w-11' : 'h-14 w-14';
  const titleClassName =
    size === 'lg'
      ? 'text-4xl sm:text-5xl'
      : size === 'sm'
        ? 'text-xl'
        : 'text-2xl sm:text-3xl';
  const taglineClassName = size === 'sm' ? 'text-[10px]' : 'text-xs sm:text-sm';

  return (
    <div className={cn('flex items-center gap-4', className)}>
      <HooksmithMark className={iconSize} />

      <div>
        <div className={cn('font-black uppercase leading-none tracking-[0.06em]', titleClassName)}>
          <span className="text-[var(--brand-ice)]">Hook</span>
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
