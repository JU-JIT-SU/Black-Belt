'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { Search, MapPin } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import Script from 'next/script';

interface KakaoPlace {
  id: string;
  place_name: string;
  address_name: string;
  phone: string;
  place_url: string;
  category_name: string;
  x: string;
  y: string;
  distance?: string;
}

function parseTags(categoryName: string, placeName: string): string[] {
  const tags: string[] = [];
  const lower = (categoryName + ' ' + placeName).toLowerCase();
  if (lower.includes('주짓수') || lower.includes('bjj')) tags.push('BJJ');
  if (lower.includes('nogi') || lower.includes('노기')) tags.push('NOGI');
  if (lower.includes('유도')) tags.push('유도');
  if (lower.includes('레슬링')) tags.push('레슬링');
  if (lower.includes('복싱') || lower.includes('boxing')) tags.push('복싱');
  if (lower.includes('태권도')) tags.push('태권도');
  if (lower.includes('mma') || lower.includes('종합격투')) tags.push('MMA');
  if (lower.includes('무에타이') || lower.includes('킥복싱')) tags.push('무에타이');
  if (tags.length === 0) tags.push('도장');
  return tags.slice(0, 3);
}

function formatDistance(dist?: string): string {
  if (!dist) return '';
  const m = parseInt(dist, 10);
  if (isNaN(m)) return '';
  if (m < 1000) return `${m}m`;
  return `${(m / 1000).toFixed(1)}km`;
}

export default function DojangClient() {
  const [searchQuery, setSearchQuery] = useState('');
  const [dojangs, setDojangs] = useState<KakaoPlace[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationDenied, setLocationDenied] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<naver.maps.Map | undefined>(undefined);
  const markersRef = useRef<naver.maps.Marker[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const infoWindowRef = useRef<any>(undefined);
  const cardListRef = useRef<HTMLDivElement>(null);
  const debouncedSearch = useDebounce(searchQuery, 500);

  const buildInfoWindowHTML = useCallback((place: KakaoPlace): string => {
    const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const dist = formatDistance(place.distance);
    const kakaoUrl = place.place_url || `https://place.map.kakao.com/${place.id}`;
    // 이 InfoWindow는 의도적으로 다크 고정 — CSS 변수 불가(JS template literal)
    return `<div style="background:#1e1e1e;border:1px solid rgba(255,255,255,0.12);border-radius:12px;padding:14px 16px;min-width:180px;max-width:240px;box-shadow:0 8px 24px rgba(0,0,0,0.45);position:relative;font-family:inherit;">
      <button onclick="if(window.__closeIW)window.__closeIW();" style="position:absolute;top:8px;right:8px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.1);border-radius:50%;width:20px;height:20px;color:rgba(255,255,255,0.5);cursor:pointer;font-size:11px;line-height:20px;padding:0;">✕</button>
      <div style="font-size:13px;font-weight:700;color:#f0f0f0;margin-bottom:4px;padding-right:24px;">${esc(place.place_name)}</div>
      ${place.address_name ? `<div style="font-size:11px;color:#9ca3af;margin-bottom:2px;">${esc(place.address_name)}</div>` : ''}
      ${dist ? `<div style="font-size:10px;color:#6b7280;margin-bottom:8px;">${dist}</div>` : '<div style="margin-bottom:8px;"></div>'}
      <a href="${esc(kakaoUrl)}" target="_blank" rel="noopener noreferrer" style="font-size:11px;color:#60a5fa;text-decoration:none;">카카오맵에서 보기 →</a>
    </div>`;
  }, []);

  const clearMarkers = useCallback(() => {
    if (infoWindowRef.current) infoWindowRef.current.close();
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
  }, []);

  const displayMarkers = useCallback(
    (places: KakaoPlace[]) => {
      clearMarkers();
      if (!places.length || !mapInstance.current) return;

      mapInstance.current.setCenter(
        new window.naver.maps.LatLng(Number(places[0].y), Number(places[0].x)),
      );
      mapInstance.current.setZoom(13);

      places.forEach((place) => {
        const marker = new window.naver.maps.Marker({
          position: new window.naver.maps.LatLng(Number(place.y), Number(place.x)),
          map: mapInstance.current,
          title: place.place_name,
        });

        window.naver.maps.Event.addListener(marker, 'click', () => {
          if (infoWindowRef.current) infoWindowRef.current.close();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const NaverMaps = window.naver.maps as any;
          const iw = new NaverMaps.InfoWindow({
            content: buildInfoWindowHTML(place),
            borderWidth: 0,
            disableAnchor: false,
            backgroundColor: 'transparent',
            pixelOffset: new NaverMaps.Point(0, -6),
          });
          (window as typeof window & { __closeIW?: () => void }).__closeIW = () => iw.close();
          iw.open(mapInstance.current!, marker);
          infoWindowRef.current = iw;
          setSelectedId(place.id);
        });

        markersRef.current.push(marker);
      });
    },
    [clearMarkers, buildInfoWindowHTML],
  );

  const SPORT_KEYWORDS = ['유도', '주짓수', '복싱', 'MMA', '레슬링', '태권도'];

  const fetchKakaoKeywords = useCallback(
    async (keywords: string[], extraParams = '') => {
      const headers = { Authorization: `KakaoAK ${process.env.NEXT_PUBLIC_KAKAO_LOCAL_API_KEY}` };
      const results = await Promise.allSettled(
        keywords.map((kw) =>
          fetch(
            `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(kw)}${extraParams}&size=15`,
            { headers },
          ).then((r) => r.json()),
        ),
      );
      const seen = new Set<string>();
      return results.flatMap((r) => {
        if (r.status !== 'fulfilled') return [];
        return (r.value.documents ?? []) as KakaoPlace[];
      }).filter((doc) => {
        if (seen.has(doc.id)) return false;
        seen.add(doc.id);
        return true;
      });
    },
    [],
  );

  const fetchByLocation = useCallback(
    async (lat: number, lng: number) => {
      setIsLoading(true);
      try {
        const docs = await fetchKakaoKeywords(
          SPORT_KEYWORDS,
          `&x=${lng}&y=${lat}&radius=5000`,
        );
        setDojangs(docs);
        setSelectedId(null);
        setShowDetail(false);
        displayMarkers(docs);
      } catch {
        // silent
      } finally {
        setIsLoading(false);
        setIsLocating(false);
      }
    },
    [fetchKakaoKeywords, displayMarkers],
  );

  const fetchDefaultDojangs = useCallback(async () => {
    setIsLoading(true);
    try {
      const docs = await fetchKakaoKeywords(SPORT_KEYWORDS);
      setDojangs(docs);
      setSelectedId(null);
      setShowDetail(false);
      displayMarkers(docs);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }, [fetchKakaoKeywords, displayMarkers]);

  const initMap = useCallback(() => {
    if (!mapRef.current || !window.naver) return;
    mapInstance.current = new window.naver.maps.Map(mapRef.current, {
      center: new window.naver.maps.LatLng(37.5665, 126.978),
      zoom: 12,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    window.naver.maps.Event.addListener(mapInstance.current as any, 'click', () => {
      if (infoWindowRef.current) infoWindowRef.current.close();
      setSelectedId(null);
    });
    setMapLoaded(true);

    // 기본 목록 먼저 표시
    fetchDefaultDojangs();

    // 위치 권한이 있으면 내 위치 기반으로 업데이트
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude } }) => {
        mapInstance.current?.setCenter(new window.naver.maps.LatLng(latitude, longitude));
        fetchByLocation(latitude, longitude);
      },
      () => {
        setLocationDenied(true);
        setIsLocating(false);
      },
    );
  }, [fetchDefaultDojangs, fetchByLocation]);

  const handleUseMyLocation = () => {
    setIsLocating(true);
    setLocationDenied(false);
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude } }) => {
        mapInstance.current?.setCenter(new window.naver.maps.LatLng(latitude, longitude));
        fetchByLocation(latitude, longitude);
      },
      () => {
        setLocationDenied(true);
        setIsLocating(false);
      },
    );
  };

  const handleSearch = useCallback(async () => {
    if (!debouncedSearch.trim()) return;
    setIsLoading(true);
    try {
      const keywords = SPORT_KEYWORDS.map((kw) => `${debouncedSearch} ${kw}`);
      const docs = await fetchKakaoKeywords(keywords);
      setDojangs(docs);
      setSelectedId(null);
      setShowDetail(false);
      displayMarkers(docs);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, fetchKakaoKeywords, displayMarkers]);

  // 실시간 검색 — debouncedSearch 변경 시 자동 실행
  useEffect(() => {
    if (debouncedSearch.trim()) handleSearch();
  }, [debouncedSearch, handleSearch]);

  const isSelected = (id: string) => selectedId === id;
  const selectedDojang = dojangs.find((d) => d.id === selectedId) ?? null;

  return (
    <>
      <Script
        src={`https://openapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID}`}
        strategy="lazyOnload"
        onLoad={initMap}
      />

      <div
        style={{
          height: 'calc(100vh - 64px)',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--color-bg-page)',
        }}
      >
        {/* ── Header bar ── */}
        <div
          className="flex items-center gap-3 shrink-0 px-4 py-3 md:px-8 md:py-4"
          style={{
            background: 'var(--color-bg-page)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <h1
            style={{
              fontSize: '17px',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              letterSpacing: '-0.02em',
              whiteSpace: 'nowrap',
            }}
          >
            도장 찾기
          </h1>

          <div style={{ flex: 1 }} />

          {/* Search double-bezel */}
          <div
            style={{
              background: 'var(--color-bg-tint)',
              border: '1px solid var(--color-border-medium)',
              borderRadius: '12px',
              padding: '2px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'var(--color-bg-surface)',
                borderRadius: '10px',
                padding: '8px 12px',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)',
                width: 'clamp(120px, 35vw, 260px)',
              }}
            >
              <Search size={13} style={{ color: 'var(--color-text-tertiary)', flexShrink: 0 }} aria-hidden="true" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isLocating ? '현재 위치 확인 중...' : '지역 / 도장명 검색...'}
                aria-label="도장 검색"
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: '14px',
                  color: 'var(--color-text-primary)',
                  fontFamily: 'inherit',
                }}
              />
            </div>
          </div>

          {/* My location button */}
          <button
            type="button"
            onClick={handleUseMyLocation}
            disabled={isLocating}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: isLocating ? 'rgba(37,99,235,0.1)' : 'var(--color-bg-tint)',
              border: `1px solid ${isLocating ? 'rgba(37,99,235,0.3)' : 'var(--color-border-medium)'}`,
              borderRadius: '999px',
              padding: '7px 16px',
              fontSize: '12px',
              fontWeight: 500,
              color: isLocating ? '#60a5fa' : 'var(--color-text-secondary)',
              cursor: isLocating ? 'default' : 'pointer',
              fontFamily: 'inherit',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s',
            }}
          >
            <MapPin size={13} aria-hidden="true" />
            <span className="hidden sm:inline">
              {isLocating ? '위치 확인 중...' : '내 위치 사용'}
            </span>
          </button>
        </div>

        {/* ── Body: left list + right map ── */}
        <div className="dojang-body">

          {/* Left panel */}
          <div
            ref={cardListRef}
            className="dojang-panel"
          >
            {/* ── Detail view ── */}
            {showDetail && selectedDojang ? (() => {
              const tags = parseTags(selectedDojang.category_name, selectedDojang.place_name);
              const dist = formatDistance(selectedDojang.distance);
              const kakaoUrl = selectedDojang.place_url;
              return (
                <div>
                  <button
                    type="button"
                    onClick={() => { setShowDetail(false); setSelectedId(null); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-text-tertiary)',
                      fontSize: '12px',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      marginBottom: '14px',
                      padding: '4px 0',
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    목록으로
                  </button>

                  <div
                    style={{
                      background: 'var(--color-bg-tint)',
                      border: '1px solid var(--color-border-medium)',
                      borderRadius: '16px',
                      padding: '2px',
                    }}
                  >
                    <div
                      style={{
                        background: 'var(--color-bg-surface)',
                        borderRadius: '14px',
                        padding: '18px 16px',
                        boxShadow: 'inset 0 1px 0 var(--color-highlight-shadow)',
                      }}
                    >
                      <h2
                        style={{
                          fontSize: '16px',
                          fontWeight: 700,
                          color: 'var(--color-text-primary)',
                          marginBottom: '8px',
                          letterSpacing: '-0.02em',
                        }}
                      >
                        {selectedDojang.place_name}
                      </h2>

                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '16px' }}>
                        {tags.map((tag) => (
                          <span
                            key={tag}
                            style={{
                              background: 'rgba(37,99,235,0.12)',
                              border: '1px solid rgba(37,99,235,0.25)',
                              color: '#93c5fd',
                              fontSize: '10px',
                              fontWeight: 600,
                              padding: '3px 9px',
                              borderRadius: '5px',
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div
                        style={{
                          borderTop: '1px solid var(--color-border)',
                          paddingTop: '14px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px',
                        }}
                      >
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                          <span style={{ fontSize: '13px', flexShrink: 0 }}>📍</span>
                          <span style={{ fontSize: '11.5px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                            {selectedDojang.address_name}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          <span style={{ fontSize: '13px', flexShrink: 0 }}>📞</span>
                          <span style={{ fontSize: '11.5px', color: 'var(--color-text-secondary)' }}>
                            {selectedDojang.phone || '정보 없음'}
                          </span>
                        </div>
                        {dist && (
                          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <span style={{ fontSize: '13px', flexShrink: 0 }}>📏</span>
                            <span style={{ fontSize: '11.5px', color: '#60a5fa', fontWeight: 700 }}>{dist}</span>
                          </div>
                        )}
                      </div>

                      <a
                        href={kakaoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          marginTop: '18px',
                          background: '#2563eb',
                          color: '#fff',
                          borderRadius: '10px',
                          padding: '11px 0',
                          fontSize: '12.5px',
                          fontWeight: 600,
                          textDecoration: 'none',
                          boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
                          transition: 'background 0.2s',
                        }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = '#1d4ed8')}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = '#2563eb')}
                      >
                        카카오맵에서 보기
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2.5 9.5L9.5 2.5M9.5 2.5H4.5M9.5 2.5V7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })() : (
              <>
                {/* Count */}
                {dojangs.length > 0 && (
                  <p
                    style={{
                      fontSize: '10.5px',
                      color: 'var(--color-text-tertiary)',
                      marginBottom: '10px',
                      fontWeight: 500,
                    }}
                  >
                    내 위치 5km 이내 도장 {dojangs.length}곳
                  </p>
                )}

                {/* States */}
                {isLoading ? (
                  <div
                    style={{ display: 'flex', justifyContent: 'center', paddingTop: '60px' }}
                  >
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        border: '3px solid var(--color-border-medium)',
                        borderTopColor: '#2563eb',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
                      }}
                      aria-label="검색 중"
                    />
                  </div>
                ) : locationDenied && dojangs.length === 0 ? (
                  <div style={{ padding: '24px 8px', color: 'var(--color-text-tertiary)', fontSize: '12px', textAlign: 'center' }}>
                    <MapPin size={24} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
                    <p>위치 접근이 거부되었습니다</p>
                    <p style={{ marginTop: '4px', fontSize: '11px', opacity: 0.7 }}>검색어를 입력해주세요</p>
                  </div>
                ) : dojangs.length === 0 && !isLocating ? (
                  <div style={{ padding: '24px 8px', color: 'var(--color-text-tertiary)', fontSize: '12px', textAlign: 'center' }}>
                    <MapPin size={24} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
                    <p>검색 결과가 없습니다</p>
                  </div>
                ) : (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }} aria-label="도장 목록">
                    {dojangs.map((dojang) => {
                      const tags = parseTags(dojang.category_name, dojang.place_name);
                      const dist = formatDistance(dojang.distance);
                      const sel = isSelected(dojang.id);

                      return (
                        <li
                          key={dojang.id}
                          id={`dj-card-${dojang.id}`}
                          style={{ marginBottom: '8px' }}
                        >
                          {/* double-bezel shell */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedId(dojang.id);
                              setShowDetail(true);
                            }}
                            aria-pressed={sel}
                            style={{
                              width: '100%',
                              textAlign: 'left',
                              background: sel ? 'rgba(29,78,216,0.06)' : 'var(--color-bg-tint)',
                              border: `1px solid ${sel ? 'rgba(29,78,216,0.35)' : 'var(--color-border)'}`,
                              borderRadius: '14px',
                              padding: '2px',
                              cursor: 'pointer',
                              transition: 'all 0.35s',
                              fontFamily: 'inherit',
                            }}
                            onMouseEnter={(e) => {
                              if (!sel) {
                                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(29,78,216,0.2)';
                                (e.currentTarget as HTMLElement).style.transform = 'translateX(2px)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!sel) {
                                (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)';
                                (e.currentTarget as HTMLElement).style.transform = 'translateX(0)';
                              }
                            }}
                          >
                            {/* inner core */}
                            <div
                              style={{
                                background: 'var(--color-bg-surface)',
                                borderRadius: '12px',
                                padding: '12px 14px',
                                boxShadow: 'inset 0 1px 0 var(--color-highlight-shadow)',
                              }}
                            >
                              <div
                                style={{
                                  fontSize: '13px',
                                  fontWeight: 700,
                                  color: 'var(--color-text-primary)',
                                  marginBottom: '3px',
                                }}
                              >
                                {dojang.place_name}
                              </div>
                              <div
                                style={{
                                  fontSize: '10.5px',
                                  color: 'var(--color-text-tertiary)',
                                  marginBottom: '7px',
                                }}
                              >
                                {dojang.address_name}
                              </div>
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                }}
                              >
                                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                  {tags.map((tag) => (
                                    <span
                                      key={tag}
                                      style={{
                                        background: 'var(--color-bg-tint)',
                                        border: '1px solid var(--color-border-medium)',
                                        color: 'var(--color-text-tertiary)',
                                        fontSize: '9.5px',
                                        fontWeight: 500,
                                        padding: '2px 7px',
                                        borderRadius: '5px',
                                      }}
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                                {dist && (
                                  <span
                                    style={{
                                      fontSize: '10px',
                                      fontWeight: 700,
                                      color: '#3b82f6',
                                      flexShrink: 0,
                                      marginLeft: '8px',
                                    }}
                                  >
                                    {dist}
                                  </span>
                                )}
                              </div>
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </>
            )}
          </div>

          {/* Right: map */}
          <div className="dojang-map">
            {!mapLoaded && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'var(--color-bg-surface)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10,
                }}
                role="status"
                aria-label="지도 불러오는 중"
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    border: '3px solid var(--color-border-medium)',
                    borderTopColor: '#2563eb',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                  }}
                />
              </div>
            )}
            <div
              ref={mapRef}
              role="application"
              aria-label="도장 위치 지도"
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}
