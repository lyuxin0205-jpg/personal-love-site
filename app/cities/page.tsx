"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ContentPageShell } from "@/components/content-page-shell";
import { LoveMap } from "@/components/love-map";
import { useContent } from "@/lib/content-store";

export default function CitiesPage() {
  const { content } = useContent();
  const { siteText, trips, story } = content;

  return (
    <ContentPageShell
      activeHref="/cities"
      eyebrow={siteText.sections.map.eyebrow}
      title={siteText.sections.map.title}
      intro={siteText.contentPages.citiesIntro}
    >
      <div className="grid gap-14">
        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {trips.map((trip, index) => {
            const related = story.find((item) => item.city === trip.city || item.place.includes(trip.city));
            return (
              <motion.article
                key={trip.city}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.8, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
                className="border border-[#8fb5a3]/18 bg-[#fffdf1]/46 p-5 shadow-[0_12px_28px_rgba(37,73,67,.045)]"
              >
                <p className="cinema-title text-3xl leading-tight text-[#244d49]">{trip.city}</p>
                <p className="mt-5 min-h-24 text-[15px] leading-8 text-[#315f5a]/72">{trip.caption}</p>
                {related && (
                  <Link href={`/story/${related.slug}`} className="mt-6 inline-flex border-b border-[#8fb5a3]/40 pb-1 text-sm text-[#315f5a]/66 transition duration-700 hover:border-[#315f5a]/50 hover:text-[#244d49]">
                    {siteText.storyDetail.openLabel}
                  </Link>
                )}
              </motion.article>
            );
          })}
        </section>
        <LoveMap />
      </div>
    </ContentPageShell>
  );
}
