import { messages } from './messages';
export type Locale = 'en' | 'zh' | 'ms';
export const localeTag: Record<Locale, string> = { en: 'en-MY', zh: 'zh-CN', ms: 'ms-MY' };
export function validLocale(value: string | undefined): Locale { return value === 'zh' || value === 'ms' ? value : 'en'; }
export function translate(text: string, locale: Locale): string {
  if (locale === 'en') return text;
  const key = text.replace(/\s+/g, ' ').trim();
  const entry = messages[key];
  if (!entry) {
    // Only known UI templates; never translate arbitrary sentences or stored values.
    const photo = key.match(/^View photo (\d+): (.+)$/);
    if (photo) return locale === 'zh' ? `查看照片 ${photo[1]}：${translate(photo[2], locale)}` : `Lihat foto ${photo[1]}: ${translate(photo[2], locale)}`;
    const room = key.match(/^(Explore room|About room) (U[123]|G[234])$/);
    if (room) return locale === 'zh' ? `${room[1] === 'Explore room' ? '探索房间' : '关于房间'} ${room[2]}` : `${room[1] === 'Explore room' ? 'Terokai bilik' : 'Tentang bilik'} ${room[2]}`;
    const soon = key.match(/^Meet (U[123]|G[234]) soon\.$/);
    if (soon) return locale === 'zh' ? `${soon[1]} 即将与您见面。` : `Kenali ${soon[1]} tidak lama lagi.`;
    const money = key.match(/^RM ([\d,.]+)\/mo$/);
    if (money) return `RM ${money[1]}${locale === 'zh' ? '/月' : '/bulan'}`;
    return text;
  }
  const lead = /^\s/.test(text) ? ' ' : '';
  const tail = /\s$/.test(text) ? ' ' : '';
  return lead + entry[locale] + tail;
}
