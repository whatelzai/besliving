"use client";
import Link from 'next/link';
import type { ComponentProps } from 'react';
import { useTranslate } from './PreferencesProvider';
export default function LocalizedLink(props: ComponentProps<typeof Link>) {
 const t=useTranslate();
 return <Link {...props} title={props.title ? t(props.title) : undefined} aria-label={props['aria-label'] ? t(props['aria-label']) : undefined}/>;
}
