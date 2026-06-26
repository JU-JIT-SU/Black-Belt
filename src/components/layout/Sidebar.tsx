'use client';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '../ui/button';
import {
  LogOut,
  LogIn,
  LayoutDashboard,
  FileText,
  Users,
  HelpCircle,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const navItems = [
  { label: '커뮤니티', href: '/community', icon: '/whitebelt.svg' },
  { label: '도장찾기', href: '/dojangs', icon: '/brownbelt.svg' },
  {
    label: '대회일정',
    href: '/competitions',
    icon: '/blackbeltcompetiton.svg',
  },
];

const adminNavItems = [
  { label: '대시 보드', href: '/admin', icon: LayoutDashboard },
  { label: '게시글 관리', href: '/admin/posts', icon: FileText },
  { label: '대회일정 관리', href: '/admin/competitions', icon: Calendar },
  { label: '유저 관리', href: '/admin/users', icon: Users },
  { label: '고객 지원', href: '/admin/support', icon: HelpCircle },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const isAdmin = user?.role === 'admin';

  const handleLogout = async () => {
    await logout();
  };

  return (
    <aside
      className="fixed left-0 top-0 flex flex-col border-r w-50 h-screen bg-bg-surface border-[var(--color-border)]"
      style={{ boxShadow: '4px 0 10px rgba(0,0,0,0.08)' }}
      aria-label="사이드바 내비게이션"
    >
      <Link
        href="/"
        aria-label="홈으로 이동"
        className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-btn-focus focus-visible:ring-offset-2"
      >
        <div className="flex items-center justify-center py-6 cursor-pointer">
          <Image
            src="/blackbelt.svg"
            alt="Activio 로고"
            width={95}
            height={37}
          />
        </div>
      </Link>

      <div className="border-t border-[var(--color-border)]" aria-hidden="true" />

      <nav
        className="flex flex-col gap-1 px-3 py-3 flex-1"
        aria-label="주요 메뉴"
      >
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Button
              key={item.href}
              asChild
              variant="ghost"
              className={`w-full h-12 justify-start gap-3 bg-bg-surface text-btn-text hover:bg-btn-focus hover:text-btn-focus-text cursor-pointer
                ${isActive ? 'bg-btn-focus text-btn-focus-text hover:bg-btn-focus hover:text-btn-focus-text' : ''}`}
            >
              <Link
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                aria-label={item.label}
              >
                <Image
                  src={item.icon}
                  alt=""
                  width={44}
                  height={17}
                  aria-hidden="true"
                  className="light:invert light:opacity-70"
                />
                <span className="text-[1rem]">{item.label}</span>
              </Link>
            </Button>
          );
        })}
      </nav>

      <div className="border-t border-[var(--color-border)]" aria-hidden="true" />

      <div className="px-3 py-4 flex flex-col gap-2">
        {isAdmin && (
          <nav className="flex flex-col gap-1 mb-2" aria-label="관리자 메뉴">
            {adminNavItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Button
                  key={item.href}
                  asChild
                  variant="ghost"
                  className={`w-full h-12 justify-start gap-3 cursor-pointer bg-bg-surface text-btn-text hover:bg-btn-focus hover:text-btn-focus-text
                    ${isActive ? 'bg-btn-focus text-btn-focus-text hover:bg-btn-focus hover:text-btn-focus-text' : ''}`}
                >
                  <Link
                    href={item.href}
                    aria-current={isActive ? 'page' : undefined}
                    aria-label={item.label}
                  >
                    <Icon size={18} aria-hidden="true" />
                    <span className="text-[1rem]">{item.label}</span>
                  </Link>
                </Button>
              );
            })}
          </nav>
        )}

        {loading ? (
          <div className="h-12" aria-hidden="true" />
        ) : user ? (
          <div className="flex flex-col gap-2">
            <Link
              href="/mypage"
              className="cursor-pointer rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-btn-focus focus-visible:ring-offset-2"
              aria-label={`${user.name ?? '사용자'} 마이페이지로 이동`}
            >
              <div className="flex items-center gap-3 px-2 py-1 rounded-lg hover:bg-btn-basic transition-colors cursor-pointer">
                <div
                  className="w-9 h-9 rounded-full bg-btn-basic flex items-center justify-center overflow-hidden shrink-0"
                  aria-hidden="true"
                >
                  {user.image ? (
                    <Image src={user.image} alt="" width={36} height={36} />
                  ) : (
                    <span className="text-sm font-medium text-btn-text">
                      {user.name?.[0] ?? '?'}
                    </span>
                  )}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-medium text-text-primary truncate">
                    {user.name ?? '이름 없음'}
                  </span>
                  <span className="text-xs text-text-secondary">
                    {isAdmin ? 'Admin' : (user.belt ?? '')}
                  </span>
                </div>
              </div>
            </Link>
            <Button
              type="button"
              variant="ghost"
              className="w-full h-10 gap-2 text-text-secondary hover:text-text-primary cursor-pointer"
              onClick={handleLogout}
              aria-label="로그아웃"
            >
              <LogOut size={15} aria-hidden="true" />
              <span className="text-sm">로그아웃</span>
            </Button>
          </div>
        ) : (
          <Button
            asChild
            className="w-full h-12 gap-2 bg-btn-focus text-btn-focus-text cursor-pointer"
          >
            <Link href="/login" aria-label="로그인 페이지로 이동">
              <LogIn size={16} aria-hidden="true" />
              로그인
            </Link>
          </Button>
        )}
      </div>
    </aside>
  );
}
