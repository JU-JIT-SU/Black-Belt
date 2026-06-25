'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  FileText,
  Calendar,
  Users,
  HelpCircle,
  LogOut,
  Sun,
  Moon,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/hooks/useAuth';

const ADMIN_NAV_ITEMS = [
  { label: '대시보드', href: '/admin', icon: LayoutDashboard, exact: true },
  { label: '게시글', href: '/admin/posts', icon: FileText, exact: false },
  { label: '대회일정', href: '/admin/competitions', icon: Calendar, exact: false },
  { label: '유저', href: '/admin/users', icon: Users, exact: false },
  { label: '고객지원', href: '/admin/support', icon: HelpCircle, exact: false },
];

export default function AdminTopNav() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  return (
    <nav
      className="fixed top-0 inset-x-0 z-50 h-16 flex items-center px-8 md:px-12 border-b border-white/[0.06] light:border-black/[0.08]"
      style={{
        background: 'var(--color-nav-bg)',
        backdropFilter: 'blur(14px)',
      }}
      aria-label="관리자 내비게이션"
    >
      {/* 로고 */}
      <Link
        href="/admin"
        aria-label="관리자 대시보드로 이동"
        className="shrink-0 mr-8 flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-btn-focus focus-visible:ring-offset-2"
        style={{
          fontWeight: 800,
          fontSize: '15px',
          letterSpacing: '0.08em',
          color: 'var(--color-text-primary)',
          textDecoration: 'none',
        }}
      >
        ACTIVIO
        <span
          className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md tracking-normal"
          style={{
            background: 'var(--color-btn-focus)',
            color: 'var(--color-btn-focus-text)',
          }}
        >
          관리자
        </span>
      </Link>

      {/* 관리자 네비 링크 */}
      <div className="flex items-center gap-0.5 flex-1" role="list">
        {ADMIN_NAV_ITEMS.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname?.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              role="listitem"
              aria-current={isActive ? 'page' : undefined}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                ${
                  isActive
                    ? 'text-white bg-white/10 light:text-[#0f1117] light:bg-black/[0.06]'
                    : 'text-[#a1a1aa] hover:text-white hover:bg-white/[0.06] light:text-[#6b7280] light:hover:text-[#0f1117] light:hover:bg-black/[0.06]'
                }`}
            >
              <Icon size={14} aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* 우측: 테마 토글 + 유저 + 로그아웃 */}
      <div className="flex items-center gap-2 shrink-0">
        {mounted && (
          <button
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label={theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
            className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors
                       text-white/60 hover:text-white hover:bg-white/[0.06]
                       light:text-[#6b7280] light:hover:text-[#0f1117] light:hover:bg-black/[0.06]"
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        )}

        {user && (
          <>
            <div
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border"
              style={{
                background: 'var(--color-btn-basic)',
                borderColor: 'var(--color-border-medium)',
              }}
            >
              <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                {user.name ?? '관리자'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => logout()}
              aria-label="로그아웃"
              className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors
                         text-white/60 hover:text-white hover:bg-white/[0.06]
                         light:text-[#6b7280] light:hover:text-[#0f1117] light:hover:bg-black/[0.06]"
            >
              <LogOut size={16} />
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
