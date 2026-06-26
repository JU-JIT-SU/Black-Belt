export const SPORTS = [
  { slug: 'judo',       name: '유도',   icon: '🥋',     iconSize: '17px', image: '/icons/sports/judo.svg',       hero: '/images/sports/judo.gif',        heroPos: 'center 30%', color: '#3b82f6' },
  { slug: 'bjj',        name: '주짓수', icon: '🤙',     iconSize: '17px', image: '/icons/sports/bjj.svg',        hero: '/images/sports/bjj.jpg',         heroPos: 'center 20%', color: '#8b5cf6' },
  { slug: 'wrestling',  name: '레슬링', icon: '🤼‍♂️',  iconSize: '17px', image: '/icons/sports/wrestling.svg',  hero: '/images/sports/wrestling.webp',  heroPos: 'center 40%', color: '#ec4899' },
  { slug: 'boxing',     name: '복싱',   icon: '🥊',     iconSize: '17px', image: '/icons/sports/boxing.svg',     hero: '/images/sports/boxing.jpg',      heroPos: 'center 30%', color: '#f59e0b' },
  { slug: 'taekwondo',  name: '태권도', icon: '🦶',     iconSize: '17px', image: '/icons/sports/taekwondo.svg',  hero: '/images/sports/taekwondo.jpeg',  heroPos: 'center 25%', color: '#10b981' },
  { slug: 'mma',        name: 'MMA',   icon: '🤜',     iconSize: '17px', image: '/icons/sports/mma.svg',        hero: '/images/bjj-2.webp',             heroPos: 'center 35%', color: '#ef4444' },
] as const;

export type SportSlug = typeof SPORTS[number]['slug'];

export function getSportBySlug(slug: string) {
  return SPORTS.find((s) => s.slug === slug) ?? null;
}
