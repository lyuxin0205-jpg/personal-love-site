"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { AmbientLayers } from "@/components/ambient-layers";
import { MusicPlayer } from "@/components/music-player";
import { Starfield } from "@/components/starfield";
import { StoryNotFoundView } from "@/components/story-not-found-view";
import { useContent } from "@/lib/content-store";

export function StoryDetailView({ slug }: { slug: string }) {
  const { content } = useContent();
  const { siteText } = content;
  const pageRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: pageRef, offset: ["start start", "end start"] });
  const photoY = useTransform(scrollYProgress, [0, 1], ["0px", "-44px"]);
  const airY = useTransform(scrollYProgress, [0, 1], ["0px", "70px"]);
  const item = content.story.find((entry) => entry.slug === slug);
  if (!item) return <StoryNotFoundView />;
  const city = item.city || item.place.split("/")[0]?.trim() || item.place;
  const topDetails = [
    { label: siteText.storyDetail.dateLabel, value: item.date },
    { label: siteText.storyDetail.cityLabel, value: city },
    { label: siteText.storyDetail.weatherLabel, value: item.weather },
    { label: siteText.storyDetail.timeLabel, value: item.time },
    { label: siteText.storyDetail.musicLabel, value: item.music }
  ];
  const quietDetails = [
    { label: siteText.storyDetail.placeLabel, value: item.place },
    { label: siteText.storyDetail.photoLabel, value: item.meta }
  ];

  return (
    <main ref={pageRef} className="relative min-h-screen overflow-x-clip bg-ink px-5 pb-36 pt-8 text-cream sm:px-8 lg:px-14">
      <Starfield />
      <AmbientLayers />
      <motion.div style={{ y: airY }} className="pointer-events-none absolute inset-x-0 top-0 h-[72vh] bg-[linear-gradient(180deg,rgba(178,218,210,.34),rgba(245,247,237,0)_72%)]" />
      <motion.div initial={{ opacity: 0, y: 18, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 1.05, ease: [0.22, 1, 0.36, 1] }} className="relative z-10 mx-auto max-w-6xl">
        <Link
          href="/#story"
          className="inline-flex rounded-full border border-[#4e8173]/28 bg-[#fffdf1]/54 px-3.5 py-1.5 text-sm font-medium text-[#214f49] transition duration-500 ease-out hover:-translate-y-0.5 hover:border-[#315f5a]/42 hover:bg-[#eef5dc]/72 hover:text-[#173f3a] active:translate-y-0 active:scale-[0.98]"
        >
          {siteText.storyDetail.backLabel}
        </Link>

        <article className="pt-12 sm:pt-16">
          <section className="border-y border-[#9dbbab]/24 py-5">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {topDetails.map((detail, index) => (
                <motion.div
                  key={detail.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.78, delay: 0.12 + index * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  className="border-l border-[#8fb5a3]/26 pl-3"
                >
                  <p className="mb-2 text-[11px] text-[#6f9284]/78">{detail.label}</p>
                  <p className="text-[14px] leading-6 text-[#244d49]/84">{detail.value}</p>
                </motion.div>
              ))}
            </div>
          </section>

          <section className="grid gap-10 py-12 sm:py-16 lg:grid-cols-[0.82fr_1.18fr] lg:items-end lg:gap-14">
            <div className="lg:pb-10">
              <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.24, ease: [0.22, 1, 0.36, 1] }} className="mb-5 w-fit border-b border-[#8fb5a3]/30 pb-2 text-sm leading-7 text-[#6f9284]">
                {item.meta}
              </motion.p>
              <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.34, ease: [0.22, 1, 0.36, 1] }} className="cinema-title text-balance text-[2.25rem] leading-[1.18] text-[#244d49] sm:text-[4rem]">
                {item.title}
              </motion.h1>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.1, delay: 0.55 }} className="mt-7 max-w-xl text-[16px] leading-9 text-[#315f5a]/70 sm:text-[17px]">
                {item.text}
              </motion.p>
            </div>

            <motion.figure style={{ y: photoY, rotate: -0.45 }} whileHover={{ y: -8, rotate: -0.15 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} className="relative">
              <span className="absolute left-[16%] top-0 z-10 h-6 w-24 -translate-y-1/2 rotate-[-2deg] bg-[#dfe8cc]/76 shadow-[0_6px_16px_rgba(54,86,76,.1)]" />
              <span className="absolute right-[14%] top-0 z-10 h-5 w-20 -translate-y-1/2 rotate-[2.4deg] bg-[#e8ead2]/70 shadow-[0_6px_16px_rgba(54,86,76,.08)]" />
              <div className="relative bg-[#fffdf2] p-2 shadow-[0_24px_68px_rgba(37,73,67,.14)]">
                <Image src={item.image} alt={item.title} width={1400} height={980} priority unoptimized={item.image.startsWith("data:")} className="aspect-[4/3] w-full object-cover brightness-[1.08] contrast-[1.02] saturate-[.88] blur-[0.15px]" />
                <div className="pointer-events-none absolute inset-2 bg-[linear-gradient(110deg,rgba(255,255,255,.18),rgba(255,255,255,0)_35%,rgba(140,181,170,.12)_78%,rgba(255,255,255,.08))]" />
              </div>
              <figcaption className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#315f5a]/52">
                {quietDetails.map((detail) => (
                  <span key={detail.label}>{detail.label}：{detail.value}</span>
                ))}
              </figcaption>
            </motion.figure>
          </section>

          <section className="mx-auto grid max-w-5xl gap-8 border-t border-[#9dbbab]/22 py-12 sm:py-16 lg:grid-cols-[0.32fr_0.68fr]">
            <motion.aside initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-12%" }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} className="text-sm leading-8 text-[#6f9284]">
              {topDetails.map((detail) => (
                <p key={detail.label} className="border-b border-[#9dbbab]/18 py-2">
                  <span className="mr-3 text-[#315f5a]/42">{detail.label}</span>
                  <span className="text-[#244d49]/70">{detail.value}</span>
                </p>
              ))}
            </motion.aside>

            <motion.article
              initial={{ opacity: 0, y: 18, filter: "blur(5px)" }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-12%" }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="bg-[#fffdf1]/38 px-5 py-7 shadow-[0_18px_50px_rgba(37,73,67,.055)] sm:px-8 sm:py-9"
            >
              <p className="story-prose text-[17px] leading-[2.15] text-[#244d49]/78 sm:text-[18px]">
                {item.detailText}
              </p>
            </motion.article>
          </section>
        </article>
      </motion.div>
      <MusicPlayer />
    </main>
  );
}
