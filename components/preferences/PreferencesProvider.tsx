"use client";
import { createContext, useContext, useState, type ReactNode } from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import { enUS, zhCN, msMY } from '@clerk/localizations';
import { translate, type Locale } from '@/lib/i18n';
type Preferences = { locale: Locale; theme: 'light' | 'dark'; setLocale: (locale: Locale) => void; setTheme: (theme: 'light' | 'dark') => void };
const Context = createContext<Preferences | null>(null);
export function usePreferences() { const value = useContext(Context); if (!value) throw new Error('Preferences provider missing'); return value; }
export function useTranslate() { const { locale } = usePreferences(); return (text: string) => translate(text, locale); }
function save(name: string, value: string) { document.cookie = `${name}=${value}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`; }
export function PreferencesProvider({ children, initialLocale, initialTheme }: { children: ReactNode; initialLocale: Locale; initialTheme: 'light' | 'dark' }) {
  const [locale, updateLocale] = useState(initialLocale);
  const [theme, updateTheme] = useState(initialTheme);
  const setLocale = (value: Locale) => { updateLocale(value); save('besliving-locale', value); document.documentElement.lang = value === 'zh' ? 'zh-Hans' : value; };
  const setTheme = (value: 'light' | 'dark') => { updateTheme(value); save('besliving-theme', value); document.documentElement.classList.toggle('dark', value === 'dark'); document.documentElement.style.colorScheme = value; };
  return <Context.Provider value={{locale, theme, setLocale, setTheme}}><ClerkProvider signInUrl="/auth" signUpUrl="/auth" afterSignOutUrl="/" localization={{en: enUS, zh: zhCN, ms: msMY}[locale]} appearance={{ variables: { colorPrimary: theme === 'dark' ? '#c4d2a7' : '#344b39', colorBackground: theme === 'dark' ? '#202923' : '#fffef8', colorText: theme === 'dark' ? '#f2f3e9' : '#263d33', colorInputBackground: theme === 'dark' ? '#151d18' : '#ffffff', colorInputText: theme === 'dark' ? '#f2f3e9' : '#263d33', colorTextSecondary: theme === 'dark' ? '#b7c0b4' : '#626e60' } }}>{children}</ClerkProvider></Context.Provider>;
}
