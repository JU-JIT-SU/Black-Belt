'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePromoPosts } from '@/hooks/useCommunity';
import { buildPostUrl } from '@/lib/slug';

const PAGE_SIZE = 5;
const ITEM_HEIGHT = 76;
const DOTS_HEIGHT = 38;

export default function PromoAdSidebar() {
  const { data: posts = [] } = usePromoPosts();
  const [page, setPage] = useState(0);

  const totalPages = Math.max(1, Math.ceil(posts.length / PAGE_SIZE));
  const currentPosts = posts.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const hasMultiplePages = posts.length > PAGE_SIZE;

  // 항상 5칸 고정 — 빈 슬롯은 placeholder
  const slots = Array.from({ length: PAGE_SIZE }, (_, i) => currentPosts[i] ?? null);

  useEffect(() => {
    if (!hasMultiplePages) return;
    const timer = setInterval(() => {
      setPage((p) => (p + 1) % totalPages);
    }, 4000);
    return () => clearInterval(timer);
  }, [hasMultiplePages, totalPages]);

  return (
    <>
      {/* 헤더 */}
      <div
        style={{
          padding: '10px 14px',
          borderBottom: '1px solid var(--color-border-medium)',
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '0.1em',
          color: 'var(--color-text-tertiary)',
          textTransform: 'uppercase',
        }}
      >
        홍보
      </div>

      {/* 카드 영역 — 5칸 고정 높이 */}
      <div style={{ height: `${ITEM_HEIGHT * PAGE_SIZE}px`, display: 'flex', flexDirection: 'column' }}>
        {posts.length === 0 ? (
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
            }}
          >
            <div style={{ fontSize: '32px', opacity: 0.2 }}>📢</div>
            <p style={{ fontSize: '11px', textAlign: 'center', padding: '0 16px', lineHeight: 1.6, color: 'var(--color-text-disabled)' }}>
              이 곳에 광고를<br />게재해보세요
            </p>
          </div>
        ) : (
          slots.map((post, idx) => (
            <div
              key={idx}
              style={{
                height: `${ITEM_HEIGHT}px`,
                flexShrink: 0,
                borderBottom: idx < PAGE_SIZE - 1 ? '1px solid var(--color-bg-tint)' : 'none',
                overflow: 'hidden',
              }}
            >
              {post ? (
                <Link
                  href={buildPostUrl(post.title, post.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    height: '100%',
                    padding: '0 14px',
                    textDecoration: 'none',
                    transition: 'background 0.12s',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = 'var(--color-bg-tint)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                  }}
                >
                  {post.nickname && (
                    <p
                      style={{
                        fontSize: '10px',
                        color: 'var(--color-text-secondary)',
                        marginBottom: '2px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {post.nickname}
                    </p>
                  )}
                  <p
                    style={{
                      fontSize: '12.5px',
                      fontWeight: 600,
                      color: 'var(--color-text-primary)',
                      lineHeight: 1.35,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      marginBottom: '2px',
                    }}
                  >
                    {post.title}
                  </p>
                  <p
                    style={{
                      fontSize: '10.5px',
                      color: 'var(--color-text-secondary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {post.content.slice(0, 40)}
                  </p>
                </Link>
              ) : (
                // 빈 슬롯 — 높이만 차지
                <div style={{ height: '100%' }} />
              )}
            </div>
          ))
        )}
      </div>

      {/* 도트 인디케이터 — 항상 고정 높이 유지 */}
      <div
        style={{
          height: `${DOTS_HEIGHT}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '5px',
          borderTop: '1px solid var(--color-bg-tint)',
        }}
      >
        {hasMultiplePages &&
          Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setPage(i)}
              aria-label={`${i + 1}페이지`}
              style={{
                padding: '8px 5px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  display: 'block',
                  width: i === page ? '16px' : '6px',
                  height: '6px',
                  borderRadius: '3px',
                  background: i === page ? '#2563eb' : 'var(--color-text-disabled)',
                  transition: 'all 0.3s',
                }}
              />
            </button>
          ))}
      </div>
    </>
  );
}
