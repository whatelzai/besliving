"use client";
import { localeTag } from '@/lib/i18n';
import { usePreferences } from './PreferencesProvider';
export function LocalizedDate({value,dateOnly=false}:{value:string;dateOnly?:boolean}) {
 const {locale}=usePreferences();
 return <time dateTime={value}>{new Intl.DateTimeFormat(localeTag[locale],{timeZone:'Asia/Kuala_Lumpur',weekday:'short',day:'numeric',month:'short',...(dateOnly?{}:{hour:'numeric',minute:'2-digit'} as const)}).format(new Date(value))}</time>;
}
