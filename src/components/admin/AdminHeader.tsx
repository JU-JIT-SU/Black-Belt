'use client';

import { useSelectedLayoutSegment } from 'next/navigation';

import { ADMIN_META, type AdminPageKey } from '@/constants/adminMeta';

function isAdminPageKey(value: string): value is AdminPageKey {
  return value in ADMIN_META;
}

export default function AdminHeader() {
  const segment = useSelectedLayoutSegment();
  const page =
    segment && isAdminPageKey(segment) ? segment : 'dashboard';
  const { title, description } = ADMIN_META[page];

  return (
    <header
      className="flex justify-center"
      style={{
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <div className="w-full max-w-7xl px-6 py-6 space-y-1">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-high)' }}>{title}</h1>
        <p className="text-sm" style={{ color: 'var(--color-text-hint)' }}>{description}</p>
      </div>
    </header>
  );
}
