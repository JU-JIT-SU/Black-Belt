'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Search, Menu, X } from 'lucide-react';
import Postcard from '@/components/community/Postcard';
import PromoAdSidebar from '@/components/community/PromoAdSidebar';
import PromoAdBannerMobile from '@/components/community/PromoAdBannerMobile';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { useSportPosts } from '@/hooks/useCommunity';
import { useAuth } from '@/hooks/useAuth';
import { SPORTS } from '@/constants/sports';
import type { Post } from '@/types/community';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useCommunityListState } from '@/hooks/useCommunityListState';

interface SportCommunityClientProps {
  initialPosts: Post[];
  sport: { slug: string; name: string; icon: string; hero: string; heroPos: string; color: string };
}

export default function SportCommunityClient({ initialPosts, sport }: SportCommunityClientProps) {
  const { searchQuery, setSearchQuery, debouncedSearch, hoveredSlug, setHoveredSlug, isScrollRestoredRef } =
    useCommunityListState();
  const { user, loading } = useAuth();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useSportPosts(sport.slug, initialPosts);

  const posts = useMemo(() => data.pages.flatMap((page) => page), [data]);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) =>
      post.title.toLowerCase().includes(debouncedSearch.toLowerCase()),
    );
  }, [posts, debouncedSearch]);

  useEffect(() => {
    const lastPostId = sessionStorage.getItem('lastPostId');
    if (isScrollRestoredRef.current || !lastPostId) return;
    if (filteredPosts.length > 0) {
      const timer = setTimeout(() => {
        const el = document.getElementById(lastPostId);
        if (el) {
          el.scrollIntoView({ block: 'center', behavior: 'instant' });
          sessionStorage.removeItem('lastPostId');
          isScrollRestoredRef.current = true;
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [filteredPosts]);

  const observerRef = useInfiniteScroll(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  });

  const [drawerOpen, setDrawerOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (drawerOpen && drawerRef.current) {
      const first = drawerRef.current.querySelector<HTMLElement>('a[href], button:not([disabled])');
      first?.focus();
    }
  }, [drawerOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!drawerOpen) return;
      if (e.key === 'Escape') { closeDrawer(); return; }
      if (e.key !== 'Tab' || !drawerRef.current) return;
      const focusable = Array.from(
        drawerRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [drawerOpen, closeDrawer]);

  return (
    <section
      className="w-full min-h-screen"
      style={{ background: 'var(--color-bg-page)' }}
      aria-label={`${sport.name} 커뮤니티`}
    >
      {/* ── Hero ── */}
      <div className="relative h-[320px] overflow-hidden flex items-end">
        <Image
          fill
          src={sport.hero}
          alt=""
          aria-hidden="true"
          style={{ objectFit: 'cover', objectPosition: sport.heroPos, opacity: 0.38, filter: 'grayscale(10%)' }}
          priority
          sizes="100vw"
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(var(--color-scrim-rgb),0.96) 0%, rgba(var(--color-scrim-rgb),0.45) 60%, rgba(var(--color-scrim-rgb),0.2) 100%)' }}
        />
        <div className="relative z-10 px-6 pb-5 flex items-end gap-3">
          <span style={{ fontSize: '36px', lineHeight: 1 }}>{sport.icon}</span>
          <h1 className="font-extrabold text-text-primary text-[38px] leading-none tracking-[-0.04em]">
            {sport.name}
          </h1>
        </div>
      </div>

      {/* ── 3-column layout ── */}
      <div className="max-w-[1200px] mx-auto px-4 py-6 flex gap-5 items-start">

        {/* ── Left sidebar: Promo Ad ── */}
        <aside
          className="hidden lg:flex flex-col shrink-0"
          style={{
            width: '220px',
            position: 'sticky',
            top: '80px',
            background: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border-medium)',
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          <PromoAdSidebar />
        </aside>

        {/* ── Center: search/write + posts ── */}
        <section className="flex-1 min-w-0">
          {/* Search + write */}
          <div
            className="flex items-center gap-3 mb-4"
            style={{
              position: 'sticky',
              top: '64px',
              zIndex: 10,
              background: 'var(--color-bg-page)',
              padding: '10px 0',
              marginTop: '-10px',
            }}
          >
            {/* Mobile sidebar trigger */}
            <button
              ref={triggerRef}
              className="lg:hidden shrink-0 w-10 h-10 flex items-center justify-center rounded-full"
              onClick={() => setDrawerOpen(true)}
              aria-expanded={drawerOpen}
              aria-label="사이드바 열기"
              style={{ background: 'var(--color-bg-tint)', border: '1px solid var(--color-border-medium)' }}
            >
              <Menu size={16} aria-hidden="true" />
            </button>

            <div
              className="flex items-center gap-2 flex-1 h-10"
              style={{
                background: 'var(--color-bg-tint)',
                border: '1px solid var(--color-border-medium)',
                borderRadius: '999px',
                padding: '0 16px',
              }}
            >
              <Search size={14} style={{ opacity: 0.4, flexShrink: 0 }} aria-hidden="true" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`${sport.name} 게시글 검색...`}
                aria-label="게시글 검색"
                className="flex-1 bg-transparent border-none outline-none text-text-primary min-w-0"
                style={{ fontSize: '13.5px' }}
              />
            </div>

            {!loading && user && (
              <Link
                href={`/community/sport/${sport.slug}/write`}
                className="shrink-0 h-10 flex items-center rounded-full text-white text-[13px] font-semibold whitespace-nowrap"
                style={{ background: sport.color, padding: '0 20px', transition: 'opacity 0.15s' }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = '0.85')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = '1')}
              >
                글쓰기
              </Link>
            )}
          </div>

          {/* Mobile promo banner (lg 이상에서는 좌측 사이드바에만 있으므로 숨김) */}
          <PromoAdBannerMobile />

          {/* Posts */}
          {isLoading ? (
            <div className="flex justify-center py-20">
              <LoadingSpinner />
            </div>
          ) : filteredPosts.length > 0 ? (
            <div
              role="list"
              aria-label={`${sport.name} 게시글 목록`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1px',
                background: 'var(--color-bg-tint)',
                borderRadius: '12px',
                overflow: 'hidden',
              }}
            >
              {filteredPosts.map((post) => (
                <div
                  key={post.id}
                  id={post.id}
                  role="listitem"
                  onClick={() => sessionStorage.setItem('lastPostId', post.id)}
                >
                  <Postcard
                    post={{
                      ...post,
                      nickname: post.nickname ?? '알 수 없음',
                      avatar_url: post.avatar_url ?? '',
                      image_url: post.image_url ?? null,
                      video_url: post.video_url ?? null,
                    }}
                    userId={user?.id ?? ''}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div
              className="flex flex-col items-center justify-center py-32"
              aria-live="polite"
              style={{ color: 'var(--color-text-disabled)' }}
            >
              <p style={{ fontSize: '32px', marginBottom: '12px' }}>{sport.icon}</p>
              <p style={{ fontSize: '15px' }}>{sport.name} 커뮤니티의 첫 글을 작성해보세요</p>
            </div>
          )}

          {hasNextPage && (
            <div ref={observerRef} className="h-16 flex items-center justify-center">
              <div role="status" aria-live="polite" aria-label={isFetchingNextPage ? '더 불러오는 중' : ''}>
                {isFetchingNextPage && (
                  <div
                    className="w-6 h-6 border-2 rounded-full animate-spin"
                    style={{ borderColor: sport.color, borderTopColor: 'transparent' }}
                    aria-hidden="true"
                  />
                )}
              </div>
            </div>
          )}
        </section>

        {/* ── Right sidebar: other sports ── */}
        <aside
          className="hidden lg:flex flex-col shrink-0"
          style={{
            width: '260px',
            position: 'sticky',
            top: '80px',
            background: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border-medium)',
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid var(--color-border)',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: 'var(--color-text-tertiary)',
              textTransform: 'uppercase',
            }}
          >
            스포츠 커뮤니티
          </div>

          <div style={{ padding: '6px 0' }}>
            {/* 공지 링크 */}
            <Link
              href="/community"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 16px',
                background: hoveredSlug === '__community' ? 'var(--color-bg-tint)' : 'transparent',
                borderLeft: `3px solid ${hoveredSlug === '__community' ? '#2563eb' : 'transparent'}`,
                textDecoration: 'none',
                transition: 'background 0.15s',
              }}
              onMouseEnter={() => setHoveredSlug('__community')}
              onMouseLeave={() => setHoveredSlug(null)}
            >
              <div
                style={{
                  width: '34px', height: '34px', borderRadius: '50%',
                  background: 'rgba(37,99,235,0.15)', border: '1.5px solid rgba(37,99,235,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '17px', flexShrink: 0,
                }}
              >
                📢
              </div>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-high)' }}>공지</span>
            </Link>

            {SPORTS.map(({ slug, name, image, color }) => {
              const isActive = slug === sport.slug;
              if (isActive) {
                return (
                  <div
                    key={slug}
                    className="flex items-center gap-3"
                    style={{
                      padding: '10px 16px',
                      background: 'var(--color-btn-basic)',
                      borderLeft: `3px solid ${color}`,
                    }}
                  >
                    <div
                      style={{
                        width: '34px', height: '34px', borderRadius: '50%',
                        background: color + '33', border: `1.5px solid ${color}88`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Image src={image} alt={name} width={20} height={20} style={{ objectFit: 'contain' }} className="light:invert" />
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)' }}>{name}</span>
                    <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: color, marginLeft: 'auto', flexShrink: 0 }} />
                  </div>
                );
              }
              return (
                <Link
                  key={slug}
                  href={`/community/sport/${slug}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 16px',
                    background: hoveredSlug === slug ? 'var(--color-bg-tint)' : 'transparent',
                    borderLeft: `3px solid ${hoveredSlug === slug ? color : 'transparent'}`,
                    textDecoration: 'none',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={() => setHoveredSlug(slug)}
                  onMouseLeave={() => setHoveredSlug(null)}
                >
                  <div
                    style={{
                      width: '34px', height: '34px', borderRadius: '50%',
                      background: color + '33', border: `1.5px solid ${color}66`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Image src={image} alt={name} width={20} height={20} style={{ objectFit: 'contain' }} className="light:invert" />
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-high)' }}>{name}</span>
                </Link>
              );
            })}
          </div>
        </aside>
      </div>

      <div style={{ paddingBottom: '64px' }} />

      {/* ── Mobile drawer (lg 미만에서만 렌더) ── */}
      {drawerOpen && (
        <div
          ref={drawerRef}
          role="dialog"
          aria-modal="true"
          aria-label="커뮤니티 메뉴"
          className="lg:hidden fixed inset-0 z-50 flex"
        >
          {/* Panel */}
          <div
            style={{
              width: '300px',
              height: '100%',
              overflowY: 'auto',
              background: 'var(--color-bg-surface)',
              borderRight: '1px solid var(--color-border-medium)',
              display: 'flex',
              flexDirection: 'column',
              flexShrink: 0,
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '14px 16px',
                borderBottom: '1px solid var(--color-border-medium)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'sticky',
                top: 0,
                zIndex: 1,
                background: 'var(--color-bg-surface)',
              }}
            >
              <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                커뮤니티 메뉴
              </span>
              <button
                onClick={closeDrawer}
                aria-label="메뉴 닫기"
                style={{ padding: '6px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-tertiary)', display: 'flex', alignItems: 'center' }}
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            {/* Sports nav */}
            <div>
              <div
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--color-border)',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  color: 'var(--color-text-secondary)',
                  textTransform: 'uppercase',
                }}
              >
                스포츠 커뮤니티
              </div>
              <div style={{ padding: '6px 0' }}>
                {/* 공지 링크 */}
                <Link
                  href="/community"
                  onClick={closeDrawer}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '10px 16px', textDecoration: 'none',
                    transition: 'background 0.15s', borderLeft: '3px solid transparent',
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = 'var(--color-bg-tint)';
                    el.style.borderLeftColor = '#2563eb';
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = 'transparent';
                    el.style.borderLeftColor = 'transparent';
                  }}
                >
                  <div
                    style={{
                      width: '34px', height: '34px', borderRadius: '50%',
                      background: 'rgba(37,99,235,0.15)', border: '1.5px solid rgba(37,99,235,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '17px', flexShrink: 0,
                    }}
                  >
                    📢
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-high)' }}>공지</span>
                </Link>
                {SPORTS.map(({ slug, name, image, color }) => {
                  const isActive = slug === sport.slug;
                  if (isActive) {
                    return (
                      <div
                        key={slug}
                        className="flex items-center gap-3"
                        style={{ padding: '10px 16px', background: 'var(--color-btn-basic)', borderLeft: `3px solid ${color}` }}
                      >
                        <div
                          style={{
                            width: '34px', height: '34px', borderRadius: '50%',
                            background: color + '33', border: `1.5px solid ${color}88`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <Image src={image} alt={name} width={20} height={20} style={{ objectFit: 'contain' }} className="light:invert" />
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)' }}>{name}</span>
                        <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: color, marginLeft: 'auto', flexShrink: 0 }} />
                      </div>
                    );
                  }
                  return (
                    <Link
                      key={slug}
                      href={`/community/sport/${slug}`}
                      onClick={closeDrawer}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '10px 16px', textDecoration: 'none',
                        transition: 'background 0.15s', borderLeft: '3px solid transparent',
                      }}
                      onMouseEnter={(e) => {
                        const el = e.currentTarget as HTMLElement;
                        el.style.background = 'var(--color-bg-tint)';
                        el.style.borderLeftColor = color;
                      }}
                      onMouseLeave={(e) => {
                        const el = e.currentTarget as HTMLElement;
                        el.style.background = 'transparent';
                        el.style.borderLeftColor = 'transparent';
                      }}
                    >
                      <div
                        style={{
                          width: '34px', height: '34px', borderRadius: '50%',
                          background: color + '33', border: `1.5px solid ${color}66`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Image src={image} alt={name} width={20} height={20} style={{ objectFit: 'contain' }} className="light:invert" />
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-high)' }}>{name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Backdrop */}
          <div
            style={{ flex: 1, background: 'rgba(0,0,0,0.5)' }}
            onClick={closeDrawer}
            aria-hidden="true"
          />
        </div>
      )}
    </section>
  );
}
