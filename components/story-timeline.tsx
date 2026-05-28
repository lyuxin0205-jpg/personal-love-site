"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { useContent } from "@/lib/content-store";

export function StoryTimeline() {
  const { content } = useContent();
  const { siteText } = content;
  const timeline = useMemo(() => [...content.story].sort((a, b) => a.date.localeCompare(b.date)), [content.story]);
  return (
    <div className="mx-auto max-w-7xl">
      <div className="relative">
        <div className="absolute left-5 top-0 h-full w-px bg-gradient-to-b from-transparent via-[#8fb5a3]/28 to-transparent lg:left-[48%]" />
        {timeline.map((item, index) => (
          <motion.article
            key={`${item.date}-${item.title}`}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15%" }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className={`relative mb-16 grid gap-6 pl-14 lg:grid-cols-[0.88fr_1.12fr] lg:gap-16 lg:pl-0 ${index % 2 ? "lg:grid-cols-[1.12fr_0.88fr] lg:[&>div:first-child]:col-start-2" : ""}`}
          >
            <div className="absolute left-[15px] top-6 size-3 rounded-full border border-[#6b9a8a]/60 bg-[#f7faed] lg:left-[48%] lg:-ml-1.5" />
            <motion.div
              whileHover={{ rotate: index % 2 ? -0.4 : 0.4, y: -4 }}
              className={`group relative overflow-visible ${index % 2 ? "lg:rotate-[1.2deg]" : "lg:-rotate-[.9deg]"}`}
            >
              <span className="absolute left-1/2 top-0 z-10 h-6 w-24 -translate-x-1/2 -translate-y-1/2 bg-[#dfe8cc]/70 shadow-[0_6px_16px_rgba(54,86,76,.1)]" />
              <Link href={`/story/${item.slug}`} className="block overflow-hidden bg-[#fffdf2] p-2 shadow-[0_18px_42px_rgba(39,79,75,.12)]">
                <Image src={item.image} alt={item.title} width={900} height={620} unoptimized={item.image.startsWith("data:")} className="aspect-[1.18] w-full object-cover brightness-[1.08] contrast-[1.03] saturate-[.98] transition duration-[1800ms] group-hover:scale-[1.018]" />
              </Link>
            </motion.div>
            <div className="self-center border-l border-[#9dbbab]/32 pl-5 sm:pl-7">
              <p className="mb-3 text-sm text-[#789284]">{item.date}</p>
              <Link href={`/story/${item.slug}`} className="group/title inline-block">
                <h3 className="cinema-title mb-4 text-3xl leading-[1.22] text-[#244d49] transition duration-700 group-hover/title:text-[#1f4542] sm:text-[2.15rem]">{item.title}</h3>
              </Link>
              {"meta" in item && <p className="mb-5 w-fit bg-[#e6f0d2]/66 px-3 py-1 text-sm text-[#61796e]">{item.meta}</p>}
              <p className="max-w-[38rem] text-[16px] leading-9 text-[#315f5a]/78">{item.text}</p>
              <Link href={`/story/${item.slug}`} className="mt-6 inline-flex border-b border-[#8fb5a3]/40 pb-1 text-sm text-[#315f5a]/66 transition duration-700 hover:border-[#315f5a]/50 hover:text-[#244d49]">
                {siteText.storyDetail.openLabel}
              </Link>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
}
