"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { motion } from "framer-motion";
import { AmbientLayers } from "@/components/ambient-layers";
import { MusicPlayer } from "@/components/music-player";
import { Starfield } from "@/components/starfield";
import { useContent } from "@/lib/content-store";

export function ContentPageShell({
  eyebrow,
  title,
  intro,
  activeHref,
  children
}: {
  eyebrow: string;
  title: string;
  intro: string;
  activeHref: string;
  children: ReactNode;
}) {
  const { content } = useContent();
  const { siteText } = content;

  return (
    <main className="relative min-h-screen overflow-x-clip bg-ink px-5 pb-36 pt-8 text-cream sm:px-8 lg:px-14">
      <Starfield />
      <AmbientLayers />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,253,241,.74),rgba(232,243,236,.42)_58%,rgba(244,246,235,.88))]" />
      <div className="relative z-10 mx-auto max-w-7xl">
        <header className="mb-14">
          <div className="mb-9 flex flex-wrap items-center justify-between gap-4 border-b border-[#8fb5a3]/20 pb-5">
            <Link href="/" className="border-b border-[#8fb5a3]/36 pb-1 text-sm text-[#315f5a]/66 transition duration-700 hover:border-[#315f5a]/50 hover:text-[#244d49]">
              {siteText.contentPages.homeLabel}
            </Link>
            <nav className="flex flex-wrap gap-2 text-sm text-[#315f5a]/62">
              {siteText.navigation.slice(0, 4).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full border px-4 py-2 transition duration-500 ${
                    activeHref === item.href
                      ? "border-[#8fb5a3]/38 bg-[#fffdf1]/58 text-[#244d49] shadow-[0_8px_20px_rgba(37,73,67,.045)]"
                      : "border-transparent hover:border-[#8fb5a3]/24 hover:bg-[#fffdf1]/36"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-3xl"
          >
            <p className="mb-4 w-fit border-b border-[#8fb5a3]/32 pb-2 text-sm leading-7 text-[#6f9284]">{eyebrow}</p>
            <h1 className="cinema-title text-balance text-[2.4rem] leading-[1.18] text-[#214f49] sm:text-[4.6rem]">{title}</h1>
            <p className="mt-6 max-w-2xl text-[16px] leading-9 text-[#315f5a]/72 sm:text-[18px]">{intro}</p>
          </motion.div>
        </header>

        {children}
      </div>
      <MusicPlayer />
    </main>
  );
}
