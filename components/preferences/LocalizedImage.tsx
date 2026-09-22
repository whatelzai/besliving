"use client";
import Image from 'next/image';
import type { ImageProps } from 'next/image';
import { useTranslate } from './PreferencesProvider';
export default function LocalizedImage(props: ImageProps) {
 const t=useTranslate();
 return <Image {...props} alt={t(props.alt)} title={props.title ? t(props.title) : undefined}/>;
}
