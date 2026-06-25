'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import {
  LogOut,
  UserCircle,
  Menu,
  X,
  Sun,
  Moon,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/hooks/useAuth';

const NAV_ITEMS = [
  { label: '커뮤니티', href: '/community' },
  { label: '대회일정', href: '/competitions' },
  { label: '도장찾기', href: '/dojangs' },
];

export default function TopNav() {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
    <nav
      className="sticky top-0 z-50 h-16 flex items-center px-8 md:px-12 border-b border-white/[0.06] light:border-black/[0.08]"
      style={{
        background: 'var(--color-nav-bg)',
        backdropFilter: 'blur(14px)',
      }}
      aria-label="주요 내비게이션"
    >
      {/* 로고 */}
      <Link
        href="/"
        aria-label="홈으로 이동"
        className="shrink-0 mr-10 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-btn-focus focus-visible:ring-offset-2 focus-visible:ring-offset-[#111]"
        style={{
          fontWeight: 800,
          fontSize: '15px',
          letterSpacing: '0.08em',
          color: 'var(--color-text-primary)',
          textDecoration: 'none',
        }}
      >
        ACTIVIO
      </Link>

      {/* 중앙 네비 링크 (데스크탑) */}
      <div className="hidden md:flex items-center gap-0.5 flex-1" role="list">
        <Link
          href="/dashboard"
          role="listitem"
          aria-current={pathname === '/dashboard' ? 'page' : undefined}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200
            ${
              pathname === '/dashboard'
                ? 'text-white bg-white/10 light:text-[#0f1117] light:bg-black/[0.06]'
                : 'text-[#a1a1aa] hover:text-white hover:bg-white/[0.06] light:text-[#6b7280] light:hover:text-[#0f1117] light:hover:bg-black/[0.06]'
            }`}
        >
          대시보드
        </Link>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              role="listitem"
              aria-current={isActive ? 'page' : undefined}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                ${
                  isActive
                    ? 'text-white bg-white/10 light:text-[#0f1117] light:bg-black/[0.06]'
                    : 'text-[#a1a1aa] hover:text-white hover:bg-white/[0.06] light:text-[#6b7280] light:hover:text-[#0f1117] light:hover:bg-black/[0.06]'
                }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* flex-1 spacer on mobile */}
      <div className="flex-1 md:hidden" />

      {/* 햄버거 버튼 (모바일) */}
      <button
        type="button"
        className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg
                   text-white bg-white/[0.1] border border-white/[0.18]
                   hover:bg-white/[0.18] hover:border-white/[0.3] transition-colors mr-1
                   light:text-[#374151] light:bg-black/[0.06] light:border-black/[0.12]
                   light:hover:bg-black/[0.1] light:hover:border-black/[0.2]"
        onClick={() => setMenuOpen((v) => !v)}
        aria-label={menuOpen ? '메뉴 닫기' : '메뉴 열기'}
        aria-expanded={menuOpen}
      >
        {menuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* 우측 유저 영역 */}
      <div className="flex items-center gap-2 shrink-0">
        {mounted && (
          <button
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label={
              theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'
            }
            className="w-9 h-9 flex items-center justify-center rounded-lg
                       text-white/60 hover:text-white hover:bg-white/[0.06] transition-colors
                       light:text-[#6b7280] light:hover:text-[#0f1117] light:hover:bg-black/[0.06]"
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        )}
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
                {user.name ?? '사용자'}
              </span>
            </button>

            {dropdownOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-44 rounded-xl overflow-hidden
                           border border-white/10 light:border-black/[0.1] shadow-2xl"
                style={{ background: 'var(--color-bg-surface)' }}
              >
                {user.role === 'admin' && (
                  <>
                    <Link
                      href="/admin"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-[#d1d5db]
                                 hover:bg-white/[0.06] hover:text-white transition-colors
                                 light:text-[#374151] light:hover:bg-black/[0.05] light:hover:text-[#0f1117]"
                    >
                      관리자 대시보드
                    </Link>
                    <div className="h-px bg-white/[0.06] light:bg-black/[0.08]" />
                  </>
                )}
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
        ) : (
          <div className="hidden sm:flex items-center gap-2">
            <Link
              href="/login"
              className="px-4 py-2 rounded-lg text-sm font-medium text-[#a1a1aa]
                         hover:text-white hover:bg-white/[0.06] transition-colors duration-200
                         light:text-[#6b7280] light:hover:text-[#0f1117] light:hover:bg-black/[0.06]"
            >
              로그인
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 rounded-full text-sm font-semibold text-white
                         bg-btn-focus hover:opacity-90 active:scale-[0.97]
                         transition-all duration-200"
              style={{ boxShadow: '0 4px 14px rgba(37,99,235,0.35)' }}
            >
              회원가입
            </Link>
          </div>
        )}
      </div>
    </nav>
    {/* 모바일 드로어 — nav 바깥에 위치: nav의 backdropFilter가 fixed 자식의 containing block을 바꾸는 문제 방지 */}
    {menuOpen && (
      <div
        className="md:hidden fixed top-16 inset-x-0 z-50"
        style={{ background: 'var(--color-bg-page)', borderBottom: '1px solid var(--color-border)' }}
        role="dialog"
        aria-label="모바일 메뉴"
      >
          <nav
            className="flex flex-col px-6 pt-6 pb-6 gap-2"
            aria-label="모바일 내비게이션"
          >
            <Link
              href="/dashboard"
              onClick={() => setMenuOpen(false)}
              className={`px-5 py-4 rounded-xl text-base font-semibold transition-colors duration-200
                ${pathname === '/dashboard' ? 'text-white bg-white/10 light:text-[#0f1117] light:bg-black/[0.06]' : 'text-white/60 hover:text-white hover:bg-white/[0.06] light:text-[#6b7280] light:hover:text-[#0f1117] light:hover:bg-black/[0.06]'}`}
            >
              대시보드
            </Link>
            {NAV_ITEMS.map((item) => {
              const isActive = pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`px-5 py-4 rounded-xl text-base font-semibold transition-colors duration-200
                    ${
                      isActive
                        ? 'text-white bg-white/10 light:text-[#0f1117] light:bg-black/[0.06]'
                        : 'text-white/60 hover:text-white hover:bg-white/[0.06] light:text-[#6b7280] light:hover:text-[#0f1117] light:hover:bg-black/[0.06]'
                    }`}
                >
                  {item.label}
                </Link>
              );
            })}
            {!loading && user && user.role === 'admin' && (
              <Link
                href="/admin"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-5 py-4 rounded-xl text-base font-semibold
                           text-white/60 hover:text-white hover:bg-black transition-colors
                           light:text-[#6b7280] light:hover:text-[#0f1117] light:hover:bg-black/[0.06]"
              >
                관리자 대시보드
              </Link>
            )}
            {!loading && !user && (
              <div
                className="flex gap-3 mt-4 pt-4"
                style={{ borderTop: '1px solid var(--color-border)' }}
              >
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="flex-1 py-3 text-center rounded-xl text-sm font-medium text-white/70 hover:text-white bg-white/[0.06] hover:bg-white/[0.1] transition-colors light:text-[#6b7280] light:hover:text-[#0f1117] light:bg-black/[0.06] light:hover:bg-black/[0.1]"
                >
                  로그인
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMenuOpen(false)}
                  className="flex-1 py-3 text-center rounded-xl text-sm font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] transition-colors"
                >
                  회원가입
                </Link>
              </div>
            )}
          </nav>
      </div>
    )}
    </>
  );
}
