'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import {
  LayoutDashboard,
  FileText,
  Calendar,
  Users,
  HelpCircle,
  LogOut,
  Sun,
  Moon,
  UserCircle,
  ExternalLink,
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
  const { user, loading, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

      {/* 우측: 커뮤니티 복귀 + 테마 토글 + 유저 드롭다운 */}
      <div className="flex items-center gap-2 shrink-0">
        {/* 커뮤니티로 돌아가기 */}
        <Link
          href="/community"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 mr-1
                     text-[#a1a1aa] hover:text-white hover:bg-white/[0.06]
                     light:text-[#6b7280] light:hover:text-[#0f1117] light:hover:bg-black/[0.06]"
          aria-label="커뮤니티 페이지로 이동"
        >
          <ExternalLink size={13} aria-hidden="true" />
          커뮤니티
        </Link>

        {/* 테마 토글 */}
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

        {/* 유저 영역 — TopNav와 동일한 드롭다운 */}
        {loading ? (
          <div
            className="w-9 h-9 rounded-full bg-white/10 light:bg-black/[0.1] animate-pulse"
            aria-hidden="true"
          />
        ) : user ? (
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen((v) => !v)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-white/10
                         bg-white/[0.05] hover:bg-white/[0.09] hover:border-white/20
                         transition-all duration-200 cursor-pointer
                         light:border-black/[0.1] light:bg-black/[0.04] light:hover:bg-black/[0.08] light:hover:border-black/[0.15]"
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
              aria-label="계정 메뉴 열기"
            >
              <div className="w-7 h-7 rounded-full bg-white/15 light:bg-black/[0.08] flex items-center justify-center overflow-hidden shrink-0">
                {user.image ? (
                  <Image
                    src={user.image}
                    alt=""
                    width={28}
                    height={28}
                    className="object-cover"
                  />
                ) : (
                  <span className="text-xs font-semibold text-white light:text-[#0f1117] select-none">
                    {user.name?.[0] ?? '?'}
                  </span>
                )}
              </div>
              <span className="text-sm font-medium text-white light:text-[#0f1117] max-w-[96px] truncate hidden sm:block">
                {user.name ?? '관리자'}
              </span>
            </button>

            {dropdownOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-44 rounded-xl overflow-hidden
                           border border-white/10 light:border-black/[0.1] shadow-2xl"
                style={{ background: 'var(--color-bg-surface)' }}
              >
                <Link
                  href="/community"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-[#d1d5db]
                             hover:bg-white/[0.06] hover:text-white transition-colors
                             light:text-[#374151] light:hover:bg-black/[0.05] light:hover:text-[#0f1117]"
                >
                  <ExternalLink size={15} aria-hidden="true" />
                  커뮤니티로 이동
                </Link>
                <div className="h-px bg-white/[0.06] light:bg-black/[0.08]" />
                <Link
                  href="/mypage"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-[#d1d5db]
                             hover:bg-white/[0.06] hover:text-white transition-colors
                             light:text-[#374151] light:hover:bg-black/[0.05] light:hover:text-[#0f1117]"
                >
                  <UserCircle size={15} aria-hidden="true" />
                  마이페이지
                </Link>
                <div className="h-px bg-white/[0.06] light:bg-black/[0.08]" />
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#d1d5db]
                             hover:bg-white/[0.06] hover:text-white transition-colors cursor-pointer
                             light:text-[#374151] light:hover:bg-black/[0.05] light:hover:text-[#0f1117]"
                >
                  <LogOut size={15} aria-hidden="true" />
                  로그아웃
                </button>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </nav>
  );
}
