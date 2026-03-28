'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import styles from '../app/[slug]/Home.module.css';

interface HeroProps {
    hero: {
        title: string;
        subtitle: string;
        videoUrl?: string;
        imageUrl?: string;
        backgroundImageUrl?: string;
        logoUrl?: string;
        audioUrl?: string;
        button?: {
            text: string;
            link: string;
        };
    };
    slug: string;
}

const getSafeUrl = (url: string | undefined) => {
    if (!url) return '';
    if (url.startsWith('blob:') || url.startsWith('http')) return url;
    return `/qrs${url}`;
};

export default function HeroSection({ hero, slug }: HeroProps) {
    const [hasPlayed, setHasPlayed] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (hero.audioUrl) {
            audioRef.current = new Audio(getSafeUrl(hero.audioUrl));
        }
    }, [hero.audioUrl]);

    const handleInteraction = () => {
        if (hero.audioUrl && !hasPlayed && audioRef.current) {
            audioRef.current.play().catch(e => console.error("Audio playback failed:", e));
            setHasPlayed(true);
        }
    };

    return (
        <section
            className={`${styles.hero} animate-slide-up`}
            style={{ cursor: hero.audioUrl && !hasPlayed ? 'pointer' : 'default' }}
            onClick={handleInteraction}
        >
            {hero.videoUrl ? (
                <video className={styles.heroVideo} autoPlay loop muted playsInline src={getSafeUrl(hero.videoUrl)} />
            ) : hero.backgroundImageUrl ? (
                <img src={getSafeUrl(hero.backgroundImageUrl)} alt="Hero Background" className={styles.heroBackgroundImage} />
            ) : null}
            <div className={styles.heroContent}>
                {hero.logoUrl && <img src={getSafeUrl(hero.logoUrl)} alt="Logo" className={styles.heroLogo} />}
                <h1 className={styles.heroTitle}>{hero.title}</h1>
                <p className={styles.heroSubtitle}>{hero.subtitle}</p>
                {hero.button && hero.button.text && (
                    <Link href={`/${slug}${hero.button.link}`} className={styles.actionButton} onClick={(e) => e.stopPropagation()}>
                        {hero.button.text}
                    </Link>
                )}
            </div>
        </section>
    );
}
