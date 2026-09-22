"use client";
import { Children, type ReactNode } from 'react';
import { usePreferences } from './PreferencesProvider';
import { translate } from '@/lib/i18n';
/** Explicit presentation text only. Elements, field values, and user data are never traversed. */
export function Localized({ children }: { children: ReactNode }) {
 const { locale } = usePreferences();
 return <>{Children.map(children, child => typeof child === 'string' ? translate(child, locale) : child)}</>;
}
export function Text({ children }: { children: string }) {
 const { locale } = usePreferences();
 return <>{translate(children, locale)}</>;
}
