import Link from 'next/link';

import { cn } from '@/lib/utils';

import { ALERT_METRICS, OVERVIEW_METRICS } from './constants';
import type {
  AdminDashboardData,
  DashboardCardTone,
  DashboardMetricConfig,
} from './types';

interface AdminDashboardCardsProps {
  data: AdminDashboardData;
}

const iconToneClassMap: Record<DashboardCardTone, string> = {
  slate: 'bg-white/[0.08] text-white/70 ring-white/[0.06] light:bg-gray-100 light:text-gray-600 light:ring-gray-200',
  blue: 'bg-blue-500/[0.15] text-blue-400 ring-blue-500/[0.1] light:text-blue-600',
  green: 'bg-emerald-500/[0.15] text-emerald-400 ring-emerald-500/[0.1] light:text-emerald-600',
  amber: 'bg-amber-500/[0.15] text-amber-400 ring-amber-500/[0.1] light:text-amber-600',
  red: 'bg-red-500/[0.15] text-red-400 ring-red-500/[0.1] light:text-red-600',
};

const topLineClassMap: Record<DashboardCardTone, string> = {
  slate: 'bg-zinc-900 light:bg-zinc-300',
  blue: 'bg-blue-600',
  green: 'bg-emerald-600',
  amber: 'bg-amber-500',
  red: 'bg-red-500',
};

const numberFormatter = new Intl.NumberFormat('ko-KR');

function DashboardMetricCard({
  config,
  value,
}: {
  config: DashboardMetricConfig;
  value: number;
}) {
  const Icon = config.icon;
  const cardClassName = cn(
    'group relative overflow-hidden rounded-3xl p-6 transition-transform duration-200',
    config.href ? 'block cursor-pointer hover:-translate-y-0.5' : '',
  );
  const cardContent = (
    <article
      className={cardClassName}
      style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}
    >
      <div
        className={cn(
          'mb-6 inline-flex rounded-2xl p-3 ring-1',
          iconToneClassMap[config.tone],
        )}
      >
        <Icon className="size-5" />
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <p className="text-sm font-medium" style={{ color: 'var(--color-text-tertiary)' }}>{config.label}</p>
        </div>

        <div className="flex items-end gap-2">
          <strong className="text-4xl font-semibold tracking-tight" style={{ color: 'var(--color-text-high)' }}>
            {numberFormatter.format(value)}
          </strong>
          <span className="pb-1 text-sm font-medium" style={{ color: 'var(--color-text-hint)' }}>
            {config.suffix}
          </span>
        </div>
      </div>

      <div
        className={cn(
          'pointer-events-none absolute inset-x-0 top-0 h-1',
          topLineClassMap[config.tone],
        )}
      />
    </article>
  );

  if (config.href) {
    return <Link href={config.href}>{cardContent}</Link>;
  }

  return cardContent;
}

function DashboardSection({
  title,
  description,
  metrics,
  data,
  columnsClassName,
}: {
  title: string;
  description: string;
  metrics: readonly DashboardMetricConfig[];
  data: AdminDashboardData;
  columnsClassName: string;
}) {
  return (
    <section className="space-y-5">
      <div className="space-y-1 px-1">
        <h2 className="text-xl font-semibold tracking-tight" style={{ color: 'var(--color-text-secondary)' }}>
          {title}
        </h2>
        <p className="text-sm" style={{ color: 'var(--color-text-hint)' }}>{description}</p>
      </div>

      <div className={cn('grid gap-4', columnsClassName)}>
        {metrics.map((metric) => (
          <DashboardMetricCard
            key={metric.key}
            config={metric}
            value={data[metric.key]}
          />
        ))}
      </div>
    </section>
  );
}

export default function AdminDashboardCards({
  data,
}: AdminDashboardCardsProps) {
  return (
    <div className="space-y-10 px-6 pt-8 pb-8">
      <DashboardSection
        title="전체 통계"
        description="서비스의 핵심 지표를 한눈에 확인할 수 있습니다."
        metrics={OVERVIEW_METRICS}
        data={data}
        columnsClassName="md:grid-cols-2 xl:grid-cols-4"
      />

      <DashboardSection
        title="알림"
        description="지금 바로 확인이 필요한 운영 항목입니다."
        metrics={ALERT_METRICS}
        data={data}
        columnsClassName="md:grid-cols-2"
      />
    </div>
  );
}
