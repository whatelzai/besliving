"use client";
import { createElement, type ComponentPropsWithRef, type ElementType } from 'react';
import { useTranslate } from './PreferencesProvider';
/** Own the element's translated accessibility text on both server and client. */
export function Translated<T extends ElementType>({as,...props}:{as:T}&ComponentPropsWithRef<T>) {
 const t=useTranslate();
 const presentation={...props} as Record<string,unknown>;
 for(const key of ['aria-label','title','placeholder']) if(typeof presentation[key]==='string') presentation[key]=t(presentation[key]);
 return createElement(as,presentation);
}
