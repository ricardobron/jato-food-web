import { cn } from '@/lib/utils';

type LogoProps = {
  className?: string;
  /** Color of the wordmark text. Defaults to current text color. */
  tone?: 'flame' | 'inherit' | 'cream';
};

/**
 * Jato wordmark. The "jet flame" sits as an ember accent on the final stroke —
 * the single brand mark reused across landing, login, sidebar and header.
 */
export const Logo = ({ className, tone = 'inherit' }: LogoProps) => {
  const toneClass =
    tone === 'flame'
      ? 'text-flame'
      : tone === 'cream'
      ? 'text-cream'
      : 'text-current';

  return (
    <span
      className={cn('jato-wordmark inline-flex items-baseline', toneClass, className)}
    >
      JAT
      <span className="relative">
        O
        {/* ember spark — the jet exhaust */}
        <span className="absolute -right-1.5 -top-1 h-1.5 w-1.5 rounded-full bg-ember" />
      </span>
    </span>
  );
};
