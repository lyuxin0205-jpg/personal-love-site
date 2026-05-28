"use client";

import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { useEffect, useState } from "react";
import { AmbientLayers } from "@/components/ambient-layers";
import { AnniversaryReminders } from "@/components/anniversary-reminders";
import { CloudAlbum } from "@/components/cloud-album";
import { CoupleDiary } from "@/components/couple-diary";
import { Hero } from "@/components/hero";
import { LoadingCurtain } from "@/components/loading-curtain";
import { LifeFragments } from "@/components/life-fragments";
import { LoveMap } from "@/components/love-map";
import { MessageBoard } from "@/components/message-board";
import { MusicPlayer } from "@/components/music-player";
import { PhotoWall } from "@/components/photo-wall";
import { PrivateGate } from "@/components/private-gate";
import { SectionHeader } from "@/components/section-header";
import { StoryTimeline } from "@/components/story-timeline";
import { ThreeDAlbum } from "@/components/three-d-album";
import { TimeAtmosphere } from "@/components/time-atmosphere";
import { WishList } from "@/components/wish-list";
import { Starfield } from "@/components/starfield";
import { useContent } from "@/lib/content-store";

export default function Home() {
  const [ready, setReady] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const { content } = useContent();
  const { siteText } = content;
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.4 });

  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), 1350);
    setUnlocked(window.localStorage.getItem("only-us-unlocked") === "true");
    return () => window.clearTimeout(timer);
  }, []);

  if (!unlocked) {
    return (
      <PrivateGate
        onUnlock={() => {
          window.localStorage.setItem("only-us-unlocked", "true");
          setUnlocked(true);
        }}
      />
    );
  }

  return (
    <main className="relative min-h-screen overflow-x-clip bg-ink text-cream selection:bg-gold/25 selection:text-cream">
      <AnimatePresence>{!ready && <LoadingCurtain />}</AnimatePresence>
      <motion.div className="fixed left-0 top-0 z-[70] h-[2px] origin-left bg-gold/70" style={{ scaleX }} />
      <Starfield />
      <AmbientLayers />
      <nav className="fixed left-1/2 top-4 z-50 flex w-[calc(100%-1.25rem)] max-w-md -translate-x-1/2 items-center justify-between rounded-full border border-cream/10 bg-white/72 px-2 py-2 text-[14px] text-cream/74 shadow-[0_10px_30px_rgba(84,117,93,.12)] backdrop-blur-xl sm:top-6 sm:px-3">
        {siteText.navigation.map((item) => (
          <motion.a key={item.href} href={item.href} whileHover={{ y: -1 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }} className="rounded-full px-3 py-2 transition duration-500 hover:bg-gold/12 hover:text-cream">
            {item.label}
          </motion.a>
        ))}
      </nav>

      <Hero />

      <section className="memory-section relative z-10 px-5 py-14 sm:px-8 lg:px-14">
        <SectionHeader eyebrow={siteText.sections.time.eyebrow} title={siteText.sections.time.title} />
        <TimeAtmosphere />
      </section>

      <section id="story" className="memory-section relative z-10 px-5 py-20 sm:px-8 lg:px-14">
        <SectionHeader eyebrow={siteText.sections.story.eyebrow} title={siteText.sections.story.title} />
        <StoryTimeline />
      </section>

      <section className="memory-section relative z-10 px-5 py-14 sm:px-8 lg:px-14">
        <SectionHeader eyebrow={siteText.sections.fragments.eyebrow} title={siteText.sections.fragments.title} />
        <LifeFragments />
      </section>

      <section id="album" className="memory-section relative z-10 px-5 py-20 sm:px-8 lg:px-14">
        <SectionHeader eyebrow={siteText.sections.album.eyebrow} title={siteText.sections.album.title} />
        <CloudAlbum />
        <PhotoWall />
      </section>

      <section className="memory-section relative z-10 px-5 py-20 sm:px-8 lg:px-14">
        <SectionHeader eyebrow={siteText.sections.book.eyebrow} title={siteText.sections.book.title} />
        <ThreeDAlbum />
      </section>

      <section id="diary" className="memory-section relative z-10 grid gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[1.08fr_0.92fr] lg:px-14">
        <div>
          <SectionHeader eyebrow={siteText.sections.diary.eyebrow} title={siteText.sections.diary.title} />
          <CoupleDiary />
        </div>
        <div className="lg:pt-24">
          <SectionHeader eyebrow={siteText.sections.message.eyebrow} title={siteText.sections.message.title} />
          <MessageBoard />
        </div>
      </section>

      <section id="map" className="memory-section relative z-10 px-5 py-20 sm:px-8 lg:px-14">
        <SectionHeader eyebrow={siteText.sections.map.eyebrow} title={siteText.sections.map.title} />
        <LoveMap />
      </section>

      <section id="future" className="memory-section relative z-10 grid gap-10 px-5 pb-40 pt-20 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:px-14">
        <AnniversaryReminders />
        <WishList />
      </section>

      <footer className="relative z-10 px-5 pb-28 text-center text-sm leading-7 text-cream/50">
        <p>{siteText.footer.text}</p>
        <p>{siteText.footer.contact}</p>
      </footer>

      <MusicPlayer />
    </main>
  );
}
