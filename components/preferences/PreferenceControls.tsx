"use client";
import { Languages, Moon, Sun } from 'lucide-react';
import { usePreferences, useTranslate } from './PreferencesProvider';
import type { Locale } from '@/lib/i18n';
export function PreferenceControls() {
  const { locale, theme, setLocale, setTheme } = usePreferences();
  const t = useTranslate();
  return <div className="preference-controls">
    <label className="language-control"><Languages size={17} aria-hidden="true"/><span className="sr-only">{t('Language')}</span><select aria-label={t('Language')} value={locale} onChange={e=>setLocale(e.target.value as Locale)}><option value="en">English</option><option value="zh">中文</option><option value="ms">Bahasa Melayu</option></select></label>
    <button type="button" className="theme-control" aria-label={t(theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode')} title={t(theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode')} onClick={()=>setTheme(theme === 'light' ? 'dark' : 'light')}>{theme === 'light' ? <Moon size={18}/> : <Sun size={18}/>}</button>
  </div>;
}
