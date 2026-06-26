'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Trophy, MessageSquare, FileText, Lock } from 'lucide-react';
import { SPORTS } from '@/constants/sports';
import { formatDate } from '@/utils/formatDate';
import { buildPostUrl } from '@/lib/slug';

interface Props {
  profile: {
    nickname: string;
    avatar_url: string | null;
    role: string;
    belt_level: string | null;
  } | null;
  stats: {
    postCount: number;
    commentCount: number;
  } | null;
  competitions: {
    id: string;
    name: string;
    location: string | null;
    event_data: string | null;
    apply_deadline: string | null;
  }[];
  notices: {
    id: string;
    title: string;
    content: string;
    image_url: string | null;
    created_at: string;
    nickname: string;
  }[];
}

export default function DashboardClient({ profile, stats, competitions, notices }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const isGuest = profile === null;
  const isAdmin = profile?.role === 'admin';
  const featured = notices[0] ?? null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/community?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const cardStyle: React.CSSProperties = {
    background: 'var(--color-bg-surface)',
    border: '1px solid var(--color-border-medium)',
    borderRadius: '14px',
    overflow: 'hidden',
  };

  const cardHeaderStyle: React.CSSProperties = {
    padding: '14px 18px',
    borderBottom: '1px solid var(--color-border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  return (
    <div className="w-full min-h-screen" style={{ background: 'var(--color-bg-page)' }}>
      <div className="max-w-[1200px] mx-auto px-5 py-8">

        {/* ── Top bar ── */}
        <div className="flex items-center justify-between mb-7 gap-4">
          <h1 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)', whiteSpace: 'nowrap' }}>
            {isGuest ? (
              '안녕하세요'
            ) : (
              <>
                안녕하세요,{' '}
                <span style={{ color: '#60a5fa' }}>{profile!.nickname}</span>님 🔥
              </>
            )}
          </h1>

          <form onSubmit={handleSearch} className="flex items-center" style={{ maxWidth: '280px', width: '100%' }}>
            <div
              className="flex items-center gap-2 w-full h-9"
              style={{
                background: 'var(--color-bg-tint)',
                border: '1px solid var(--color-border-medium)',
                borderRadius: '8px',
                padding: '0 12px',
              }}
            >
              <Search size={13} style={{ color: 'var(--color-text-hint)', flexShrink: 0 }} />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="검색..."
                className="flex-1 bg-transparent border-none outline-none text-text-primary min-w-0"
                style={{ fontSize: '13px' }}
              />
            </div>
          </form>
        </div>

        {/* ── Row 1: Notice + Competitions ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[65%_1fr] gap-5 mb-5">

          {/* Notice card (~65%) */}
          <div style={{ minWidth: 0, ...cardStyle }}>
            {/* Header */}
            <div style={cardHeaderStyle}>
              <div className="flex items-center gap-2">
                <span style={{ fontSize: '13px' }}>📢</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)' }}>공지</span>
              </div>
              <Link href="/community" style={{ fontSize: '11px', color: 'var(--color-text-hint)', textDecoration: 'none' }}>
                전체보기
              </Link>
            </div>

            {/* Featured notice */}
            {featured ? (
              <Link
                href={buildPostUrl(featured.title, featured.id)}
                style={{ display: 'block', textDecoration: 'none' }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = '0.9')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = '1')}
              >
                {/* Image area */}
                <div style={{ position: 'relative', height: '220px', background: 'var(--color-bg-surface-alt)', overflow: 'hidden' }}>
                  {featured.image_url ? (
                    <Image src={featured.image_url} alt={featured.title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" style={{ opacity: 0.75 }} />
                  ) : (
                    <div
                      style={{
                        position: 'absolute', inset: 0,
                        background: 'linear-gradient(135deg, rgba(37,99,235,0.2) 0%, rgba(139,92,246,0.15) 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <span style={{ fontSize: '48px', opacity: 0.4 }}>📢</span>
                    </div>
                  )}
                  <div
                    style={{
                      position: 'absolute', inset: 0,
                      background: 'linear-gradient(to top, rgba(var(--color-scrim-rgb),0.95) 0%, rgba(var(--color-scrim-rgb),0.3) 50%, transparent 100%)',
                    }}
                  />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em',
                        color: '#60a5fa', background: 'rgba(37,99,235,0.2)',
                        border: '1px solid rgba(37,99,235,0.3)',
                        padding: '2px 8px', borderRadius: '999px',
                        marginBottom: '8px',
                      }}
                    >
                      공지
                    </span>
                    <h2
                      style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1.3, letterSpacing: '-0.02em' }}
                      className="line-clamp-2"
                    >
                      {featured.title}
                    </h2>
                    <p style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginTop: '6px' }}>
                      {featured.nickname} · {formatDate(featured.created_at)}
                    </p>
                  </div>
                </div>

                {/* Body text */}
                <div style={{ padding: '16px 20px' }}>
                  <p className="line-clamp-2" style={{ fontSize: '13px', color: 'var(--color-text-tertiary)', lineHeight: 1.65 }}>
                    {featured.content}
                  </p>
                </div>
              </Link>
            ) : (
              <div
                style={{
                  height: '220px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexDirection: 'column', gap: '8px',
                  color: 'var(--color-text-disabled)',
                }}
              >
                <span style={{ fontSize: '32px' }}>📢</span>
                <p style={{ fontSize: '13px' }}>등록된 공지가 없습니다</p>
              </div>
            )}
          </div>

          {/* Competitions card (~35%) */}
          <div style={{ minWidth: 0, ...cardStyle }}>
            <div style={cardHeaderStyle}>
              <div className="flex items-center gap-2">
                <Trophy size={14} style={{ color: '#f59e0b' }} />
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)' }}>다가오는 대회</span>
              </div>
              <Link href="/competitions" style={{ fontSize: '11px', color: 'var(--color-text-hint)', textDecoration: 'none' }}>
                전체보기
              </Link>
            </div>

            {competitions.length > 0 ? (
              <div>
                {competitions.map((comp, i) => (
                  <div
                    key={comp.id}
                    style={{
                      padding: '12px 18px',
                      borderBottom: i < competitions.length - 1 ? '1px solid var(--color-border)' : 'none',
                      display: 'flex', alignItems: 'center', gap: '12px',
                    }}
                  >
                    <div
                      style={{
                        width: '36px', height: '36px', borderRadius: '8px',
                        background: 'rgba(245,158,11,0.12)',
                        border: '1px solid rgba(245,158,11,0.25)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {comp.event_data ? (
                        <>
                          <span style={{ fontSize: '10px', fontWeight: 800, color: '#f59e0b', lineHeight: 1 }}>
                            {new Date(comp.event_data).getMonth() + 1}월
                          </span>
                          <span style={{ fontSize: '13px', fontWeight: 800, color: '#f59e0b', lineHeight: 1 }}>
                            {new Date(comp.event_data).getDate()}
                          </span>
                        </>
                      ) : (
                        <Trophy size={14} style={{ color: '#f59e0b' }} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="line-clamp-1" style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--color-text-high)' }}>
                        {comp.name}
                      </p>
                      {comp.location && (
                        <p className="line-clamp-1" style={{ fontSize: '11px', color: 'var(--color-text-hint)', marginTop: '2px' }}>
                          📍 {comp.location}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '40px 24px', textAlign: 'center', color: 'var(--color-text-disabled)', fontSize: '13px' }}>
                예정된 대회가 없습니다
              </div>
            )}
          </div>
        </div>

        {/* ── Row 2: 도장찾기 | 스포츠커뮤니티 | 마이페이지 (equal 1/3 each) ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

          {/* 도장찾기 */}
          <div style={cardStyle}>
            <div style={cardHeaderStyle}>
              <div className="flex items-center gap-2">
                <MapPin size={14} style={{ color: '#10b981' }} />
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)' }}>도장 찾기</span>
              </div>
              <Link href="/dojangs" style={{ fontSize: '11px', color: 'var(--color-text-hint)', textDecoration: 'none' }}>
                전체보기
              </Link>
            </div>
            <div style={{ padding: '28px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <div
                style={{
                  width: '60px', height: '60px', borderRadius: '16px',
                  background: 'rgba(16,185,129,0.12)', border: '1.5px solid rgba(16,185,129,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <MapPin size={28} style={{ color: '#10b981' }} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '6px' }}>내 근처 도장 찾기</p>
                <p style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', lineHeight: 1.6 }}>
                  위치 기반으로<br />가까운 도장을 검색해보세요
                </p>
              </div>
              <Link
                href="/dojangs"
                style={{
                  padding: '9px 24px', borderRadius: '8px',
                  background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)',
                  fontSize: '13px', fontWeight: 600, color: '#10b981',
                  textDecoration: 'none', transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'rgba(16,185,129,0.25)')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'rgba(16,185,129,0.15)')}
              >
                도장 찾기 →
              </Link>
            </div>
          </div>

          {/* 스포츠 커뮤니티 */}
          <div style={cardStyle}>
            <div style={cardHeaderStyle}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)' }}>스포츠 커뮤니티</span>
              <Link href="/community" style={{ fontSize: '11px', color: 'var(--color-text-hint)', textDecoration: 'none' }}>
                전체보기
              </Link>
            </div>
            <div style={{ padding: '6px 0' }}>
              {SPORTS.map(({ slug, name, icon, iconSize, color }) => (
                <Link
                  key={slug}
                  href={`/community/sport/${slug}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '9px 18px',
                    borderLeft: '3px solid transparent',
                    textDecoration: 'none', transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = 'var(--color-bg-tint)';
                    (e.currentTarget as HTMLElement).style.borderLeftColor = color;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                    (e.currentTarget as HTMLElement).style.borderLeftColor = 'transparent';
                  }}
                >
                  <div style={{
                    width: '26px', height: '26px', borderRadius: '50%',
                    background: color + '1a', border: `1.5px solid ${color}44`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <span style={{ fontSize: iconSize, lineHeight: 1 }}>{icon}</span>
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-high)' }}>{name}</span>
                  <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--color-text-disabled)' }}>→</span>
                </Link>
              ))}
            </div>
          </div>

          {/* 마이페이지 */}
          <div style={cardStyle}>
            <div style={cardHeaderStyle}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)' }}>내 활동</span>
              {!isGuest && (
                <Link href="/mypage" style={{ fontSize: '11px', color: 'var(--color-text-hint)', textDecoration: 'none' }}>
                  마이페이지 →
                </Link>
              )}
            </div>

            {isGuest ? (
              <div
                style={{
                  padding: '36px 20px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px',
                }}
              >
                <div
                  style={{
                    width: '52px', height: '52px', borderRadius: '50%',
                    background: 'var(--color-bg-tint)', border: '1.5px solid var(--color-border-medium)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Lock size={22} style={{ color: 'var(--color-text-hint)' }} />
                </div>
                <p style={{ fontSize: '13px', color: 'var(--color-text-tertiary)', textAlign: 'center', lineHeight: 1.6 }}>
                  로그인하면 내 활동을<br />확인할 수 있습니다
                </p>
                <Link
                  href="/login"
                  style={{
                    padding: '9px 24px', borderRadius: '8px',
                    background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.3)',
                    fontSize: '13px', fontWeight: 600, color: '#60a5fa',
                    textDecoration: 'none', transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'rgba(37,99,235,0.25)')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'rgba(37,99,235,0.15)')}
                >
                  로그인
                </Link>
              </div>
            ) : (
              <div style={{ padding: '20px 18px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Profile row */}
                <div className="flex items-center gap-3">
                  <div
                    style={{
                      width: '44px', height: '44px', borderRadius: '50%',
                      background: 'rgba(37,99,235,0.2)', border: '2px solid rgba(37,99,235,0.35)',
                      overflow: 'hidden', flexShrink: 0, position: 'relative',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    {profile!.avatar_url ? (
                      <Image src={profile!.avatar_url} alt={profile!.nickname} fill sizes="44px" className="object-cover" />
                    ) : (
                      <span style={{ fontSize: '18px', fontWeight: 800, color: '#60a5fa' }}>
                        {profile!.nickname[0]?.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)' }}>{profile!.nickname}</p>
                    {profile!.belt_level && (
                      <p style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>{profile!.belt_level}</p>
                    )}
                  </div>
                  {isAdmin && (
                    <span
                      style={{
                        fontSize: '10px', fontWeight: 700,
                        color: '#f59e0b', background: 'rgba(245,158,11,0.15)',
                        border: '1px solid rgba(245,158,11,0.3)',
                        padding: '2px 7px', borderRadius: '999px',
                        flexShrink: 0,
                      }}
                    >
                      ADMIN
                    </span>
                  )}
                </div>

                {/* Stats */}
                <div className="flex gap-3">
                  <div
                    style={{
                      flex: 1, padding: '12px', borderRadius: '10px',
                      background: 'var(--color-bg-tint)',
                      border: '1px solid var(--color-border)',
                      textAlign: 'center',
                    }}
                  >
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <FileText size={12} style={{ color: '#60a5fa' }} />
                      <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary)', fontWeight: 600 }}>게시글</span>
                    </div>
                    <p style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-text-primary)' }}>{stats!.postCount}</p>
                  </div>
                  <div
                    style={{
                      flex: 1, padding: '12px', borderRadius: '10px',
                      background: 'var(--color-bg-tint)',
                      border: '1px solid var(--color-border)',
                      textAlign: 'center',
                    }}
                  >
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <MessageSquare size={12} style={{ color: '#8b5cf6' }} />
                      <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary)', fontWeight: 600 }}>댓글</span>
                    </div>
                    <p style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-text-primary)' }}>{stats!.commentCount}</p>
                  </div>
                </div>

                {/* Mypage link */}
                <Link
                  href="/mypage"
                  style={{
                    display: 'block', padding: '9px',
                    background: 'var(--color-bg-tint)',
                    border: '1px solid var(--color-border-medium)',
                    borderRadius: '8px', textAlign: 'center',
                    fontSize: '12.5px', fontWeight: 600, color: 'var(--color-text-secondary)',
                    textDecoration: 'none', transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--color-border-medium)')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--color-bg-tint)')}
                >
                  마이페이지 →
                </Link>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
