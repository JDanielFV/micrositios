"use client";
import Header from '../components/Header/Header';
import db from '../../db.json';
import styles from './Home.module.css';
import { SpeedInsights } from "@vercel/speed-insights/next"
import { useState } from 'react';

// Reusable Button Component
const ActionButton = ({ text, link }: { text: string, link: string }) => (
  <a href={link} className={styles.actionButton}>{text}</a>
);

// Hero Section Component
const Hero = ({ content }: { content: typeof db.hero }) => {
  const [audioPlayed, setAudioPlayed] = useState(false);

  const playAudio = () => {
    if (!audioPlayed) {
      const audio = new Audio('/not214c/audio.mp3'); // Assuming audio.mp3 is in the public folder
      audio.play().catch(e => console.error("Error playing audio:", e));
      setAudioPlayed(true);
    }
  };

  return (
    <section className={`${styles.section} ${styles.hero}`} onClick={playAudio}>
      <video autoPlay loop muted playsInline className={styles.heroVideo}>
        <source src="/not214c/fondo.mov" type="video/mp4" />
      </video>
      <div className={styles.heroContent}>
        <img src={content.profileImage} alt="Profile" className={styles.profileImage} />
        <h1 className={styles.heroTitle}>{content.title}</h1>
        <p className={styles.heroSubtitle}>{content.subtitle}</p>
        <ActionButton text={content.button.text} link={content.button.link} />
      </div>
    </section>
  );
};

// About Section Component
const About = ({ content }: { content: typeof db.about }) => (
  <section id="about" className={`${styles.section} ${styles.about}`}>
    <div className={styles.aboutContent}>
      <h2 className={styles.sectionTitle}>{content.title}</h2>
      <p>{content.text}</p>
    </div>
    <div 
      className={styles.aboutImage}
      style={{ backgroundImage: `url(${content.imageUrl})` }}
    ></div>
  </section>
);

// Main Contact Section Component
const MainContact = ({ content }: { content: typeof db.mainContact }) => (
  <section className={styles.section}>
    <h2 className={styles.sectionTitle}>{content.title}</h2>
    <p>{content.text}</p>
    <ActionButton text={content.button.text} link={content.button.link} />
  </section>
);

// Main Page
export default function Home() {
  return (
    <>
      <Header links={db.navigation} />
      <main className={styles.container}>
        <Hero content={db.hero} />
        <About content={db.about} />
        <MainContact content={db.mainContact} />
      </main>
    </>
  );
}
