"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ArrowDown } from "lucide-react";
import { ItemEditLink } from "@/components/item-edit-link";
import { daysBetween } from "@/lib/date";
import { useContent } from "@/lib/content-store";

export function Hero() {
  const { content } = useContent();
  const { couple, siteText } = content;
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 32, damping: 24 });
  const smoothY = useSpring(mouseY, { stiffness: 32, damping: 24 });
  const imageX = useTransform(smoothX, [-0.5, 0.5], [-8, 8]);
  const imageY = useTransform(smoothY, [-0.5, 0.5], [-6, 6]);
  const [days, setDays] = useState(daysBetween(couple.startDate));

  useEffect(() => {
    setDays(daysBetween(couple.startDate));
    const timer = window.setInterval(() => setDays(daysBetween(couple.startDate)), 60_000);
    return () => window.clearInterval(timer);
  }, [couple.startDate]);

  return (
    <section
      className="relative min-h-[104vh] overflow-hidden bg-[linear-gradient(180deg,#fbfbef_0%,#f3f7eb_48%,#e8f3ec_100%)] px-5 pb-24 pt-28 sm:px-8 lg:px-14"
      onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        mouseX.set((event.clientX - rect.left) / rect.width - 0.5);
        mouseY.set((event.clientY - rect.top) / rect.height - 0.5);
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(220,235,191,.42),transparent_28rem),radial-gradient(circle_at_88%_22%,rgba(177,224,218,.24),transparent_28rem),linear-gradient(90deg,rgba(255,253,242,.97)_0%,rgba(255,253,242,.88)_48%,rgba(238,247,240,.56)_100%)]" />
      <motion.div className="pointer-events-none absolute right-[-8%] top-[19vh] hidden h-[46vh] w-[52vw] max-w-[720px] opacity-[0.13] sm:block" style={{ x: imageX, y: imageY }}>
        <motion.div animate={{ scale: [1, 1.012, 1] }} transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }} className="relative h-full w-full [mask-image:linear-gradient(90deg,transparent_0%,black_24%,black_68%,transparent_100%)]">
          <Image src={couple.backgroundImage} alt="" fill priority unoptimized={couple.backgroundImage.startsWith("data:")} className="object-cover brightness-[1.2] contrast-[.76] saturate-[.42] blur-[0.35px]" />
        </motion.div>
      </motion.div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(180deg,rgba(244,246,235,0),#f4f6eb_86%)]" />

      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-7rem)] max-w-7xl content-center">
        <motion.div
          initial={{ opacity: 0, y: 22, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.15, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl"
        >
          <ItemEditLink section="basic" item="section" className="mb-4" />
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="mb-6 inline-flex border-b border-[#7fb7ac]/38 pb-2 text-sm text-[#3f6862] transition hover:border-[#315f5a]/50 hover:text-[#214f49]"
          >
            {couple.leftName} {couple.nameConnector} {couple.rightName}
          </button>
          <h1 className="cinema-title text-balance text-[clamp(2.25rem,5.25vw,5.2rem)] leading-[1.13] text-[#214f49]">
            {couple.heroLine}
          </h1>
          <p className="mt-6 max-w-2xl text-[17px] leading-9 text-[#315f5a]/82 sm:text-[18px]">{couple.subLine}</p>

          <div className="mt-8 grid max-w-2xl gap-2 text-[15px] leading-7 text-[#315f5a]/78 sm:grid-cols-3">
            {couple.heroNotes.map((note, index) => (
              <p key={`${note}-${index}`} className="border border-[#8fb5a3]/18 bg-[#fffdf1]/34 px-4 py-3 shadow-[0_8px_20px_rgba(37,73,67,.035)]">
                {note}
              </p>
            ))}
          </div>

          <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-end">
            <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }} className="w-fit border border-[#7fb7ac]/20 bg-[#fffdf1]/24 px-5 py-3 shadow-[0_10px_24px_rgba(37,73,67,.035)]">
              <p className="text-sm text-warm">{siteText.hero.togetherLabel}</p>
              <div className="mt-1 flex items-end gap-2">
                <span className="cinema-title text-5xl text-cream">{days}</span>
                <span className="mb-2 text-base text-cream/58">{siteText.hero.dayUnit}</span>
              </div>
            </motion.div>
            <motion.a href="#story" whileHover={{ y: -2 }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }} className="inline-flex w-fit items-center gap-3 rounded-full bg-[#6fb79f] px-5 py-3 text-sm text-white transition duration-500 hover:bg-[#5da98f]">
              {siteText.hero.scrollLabel}
              <ArrowDown className="size-4" />
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
