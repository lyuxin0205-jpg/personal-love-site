"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ItemEditLink } from "@/components/item-edit-link";
import { useContent } from "@/lib/content-store";

export function ThreeDAlbum() {
  const { content } = useContent();
  const { photos, siteText } = content;
  const [page, setPage] = useState(0);
  if (!photos.length) return null;
  const current = photos[page % photos.length];
  const next = photos[(page + 1) % photos.length];

  return (
    <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-center">
      <div className="max-w-md text-[16px] leading-8 text-cream/60">
        <p>{siteText.albumBook.description}</p>
      </div>
      <div className="perspective-1200 relative min-h-[420px] overflow-hidden rounded-[1.6rem] border border-cream/10 bg-white/48 p-4 shadow-[0_14px_40px_rgba(84,117,93,.10)] sm:p-7">
        <motion.div key={page} initial={{ rotateY: -18, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} className="preserve-3d grid h-full gap-4 sm:grid-cols-2">
          {[current, next].map((photo, index) => (
            <div key={photo.src} className="relative min-h-[360px] overflow-hidden rounded-[1.25rem] border border-cream/10 bg-white/45">
              <ItemEditLink section="photos" item={(page + index) % photos.length} className="absolute right-3 top-3 z-10 bg-white/55" />
              <Image src={photo.src} alt={photo.title} fill unoptimized={photo.src.startsWith("data:")} className="object-cover brightness-[1.18] contrast-[.98] saturate-[1.04]" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-cream/40 to-transparent p-5">
                <p className="text-base text-white drop-shadow">{photo.title}</p>
              </div>
            </div>
          ))}
        </motion.div>
        <div className="absolute bottom-6 right-6 flex gap-2">
          <button aria-label={siteText.album.previousLabel} onClick={() => setPage((value) => (value - 1 + photos.length) % photos.length)} className="grid size-10 place-items-center rounded-full bg-white/74 text-cream transition hover:bg-white">
            <ChevronLeft className="size-5" />
          </button>
          <button aria-label={siteText.album.nextLabel} onClick={() => setPage((value) => (value + 1) % photos.length)} className="grid size-10 place-items-center rounded-full bg-[#6fb79f] text-white transition hover:bg-[#5da98f]">
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
