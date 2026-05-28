"use client";

import Link from "next/link";
import { AmbientLayers } from "@/components/ambient-layers";
import { useContent } from "@/lib/content-store";

export function StoryNotFoundView() {
  const { content } = useContent();
  const { siteText } = content;
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-ink px-5 text-center text-cream">
      <AmbientLayers />
      <div className="relative z-10 max-w-md">
        <h1 className="cinema-title text-4xl leading-tight text-[#244d49] sm:text-5xl">{siteText.storyDetail.notFoundTitle}</h1>
        <p className="mt-5 text-[16px] leading-8 text-[#315f5a]/68">{siteText.storyDetail.notFoundDescription}</p>
        <Link href="/" className="mt-8 inline-flex rounded-full bg-[#6fb79f] px-5 py-3 text-sm text-white transition duration-700 hover:bg-[#5da98f]">
          {siteText.storyDetail.notFoundBackLabel}
        </Link>
      </div>
    </main>
  );
}
