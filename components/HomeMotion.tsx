"use client";
import { useRef, type ReactNode } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(useGSAP, ScrollTrigger);
export function HomeMotion({ children }: {
    children: ReactNode;
}) {
    const scope = useRef<HTMLDivElement>(null);
    useGSAP(() => {
        const match = gsap.matchMedia();
        match.add('(prefers-reduced-motion: no-preference)', () => {
            gsap.utils.toArray<HTMLElement>('.motion-image').forEach(el => gsap.fromTo(el, { scale: .94, opacity: .55 }, { scale: 1, opacity: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top 95%', end: 'top 35%', scrub: 1 } }));
            gsap.fromTo('.story-statement span', { opacity: .3 }, { opacity: 1, stagger: .12, ease: 'none', scrollTrigger: { trigger: '.story-statement', start: 'top 90%', end: 'bottom 55%', scrub: 1 } });
        });
        return () => match.revert();
    }, { scope });
    return <div ref={scope}>{children}</div>;
}
