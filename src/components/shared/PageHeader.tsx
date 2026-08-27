import type { RiskBand } from '@/lib/data/types';
import { clsx } from 'clsx';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: {
    label: string;
    variant: RiskBand | 'info';
  };
  children?: React.ReactNode;
}

export default function PageHeader({
  title,
  subtitle,
  badge,
  children,
}: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6 animate-fade-in">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            {title}
          </h1>
          {badge && (
            <span
              className={clsx(
                'risk-badge',
                badge.variant === 'info'
                  ? 'risk-badge--guarded'
                  : `risk-badge--${badge.variant.toLowerCase()}`
              )}
            >
              {badge.label}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  );
}
