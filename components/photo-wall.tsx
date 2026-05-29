"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { ItemEditLink } from "@/components/item-edit-link";
import { useContent } from "@/lib/content-store";

const rotations = ["-rotate-[1.8deg]", "rotate-[1.1deg]", "-rotate-[.7deg]", "rotate-[2deg]", "-rotate-[1.2deg]", "rotate-[.6deg]"];
const offsets = ["mt-0", "mt-8", "mt-3", "mt-12", "mt-1", "mt-10"];

export function PhotoWall() {
  const { content } = useContent();
  const { photoPlaceholders, photos, siteText } = content;
  const [active, setActive] = useState<{ photo: (typeof photos)[number]; index: number } | null>(null);

  return (
    <>
      <div className="mx-auto max-w-7xl columns-1 gap-5 sm:columns-2 lg:columns-3">
        {photos.map((photo, index) => (
          <motion.button
            key={photo.src}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ delay: (index % 4) * 0.04, duration: 0.8 }}
            whileHover={{ y: -2, rotate: 0 }}
            onClick={() => setActive({ photo, index })}
            className={`mb-6 inline-block w-full break-inside-avoid text-left ${rotations[index % rotations.length]} ${offsets[index % offsets.length]}`}
          >
            <div className="relative bg-white p-3 pb-4 shadow-[0_18px_42px_rgba(58,91,80,.16)] ring-1 ring-[#355f56]/8 transition duration-500 hover:shadow-[0_22px_52px_rgba(58,91,80,.2)]">
              <motion.div animate={photo.live ? { scale: [1, 1.012, 1] } : {}} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }} className="overflow-hidden bg-[#eaf1df]">
                <Image src={photo.src} alt={photo.title} width={760} height={960} unoptimized={photo.src.startsWith("data:")} className="w-full object-cover brightness-[1.07] contrast-[1.02] saturate-[.96] blur-[0.1px]" style={{ aspectRatio: photo.ratio }} />
              </motion.div>
              <div className="pt-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[16px] text-[#315f5a]">{photo.title}</p>
                  <p className="shrink-0 text-xs text-[#6f9f91]">{photo.date}</p>
                </div>
                <p className="mt-1 text-xs text-[#6a8178]">{photo.place}</p>
                <p className="mt-2 text-[14px] leading-6 text-[#496f67]/78">{photo.note}</p>
              </div>
            </div>
          </motion.button>
        ))}
        {photoPlaceholders.map((slot, index) => (
          <motion.div
            key={`${slot.ratio}-${slot.note}`}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ delay: 0.08 + index * 0.05, duration: 0.9 }}
            className={`mb-6 inline-block w-full break-inside-avoid ${rotations[(index + 3) % rotations.length]} ${offsets[(index + 2) % offsets.length]}`}
          >
            <div className="relative bg-[#fffdf1]/72 p-3 pb-4 shadow-[0_14px_34px_rgba(37,73,67,.07)] ring-1 ring-[#355f56]/8">
              <div className="relative overflow-hidden bg-[#eaf1df]/52" style={{ aspectRatio: slot.ratio }}>
                <div className="absolute inset-3 border border-dashed border-[#8fb5a3]/28" />
                <div className="absolute inset-x-8 top-1/2 h-px bg-[#8fb5a3]/22" />
                <div className="absolute inset-y-8 left-1/2 w-px bg-[#8fb5a3]/18" />
              </div>
              <div className="pt-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[15px] text-[#315f5a]/64">{siteText.album.emptySlotTitle}</p>
                  <p className="shrink-0 text-xs text-[#6f9f91]/70">{siteText.album.emptySlotDateLabel}</p>
                </div>
                <p className="mt-2 text-[14px] leading-6 text-[#496f67]/56">{slot.note}</p>
                <p className="mt-1 text-xs text-[#496f67]/38">{siteText.album.emptySlotHint}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {active && (
          <motion.div className="fixed inset-0 z-[80] grid place-items-center bg-[#eef4e8]/88 p-4 backdrop-blur-xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActive(null)}>
            <button aria-label={siteText.album.closeLabel} className="absolute right-5 top-5 grid size-11 place-items-center rounded-full bg-white/85 text-[#315f5a] transition hover:bg-white" onClick={() => setActive(null)}>
              <X className="size-5" />
            </button>
            <motion.div initial={{ scale: 0.96, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.98, y: 8 }} className="w-full max-w-4xl bg-white p-3 shadow-[0_24px_72px_rgba(58,91,80,.2)]" onClick={(event) => event.stopPropagation()}>
              <Image src={active.photo.src} alt={active.photo.title} width={1400} height={1000} unoptimized={active.photo.src.startsWith("data:")} className="max-h-[78vh] w-full object-contain brightness-[1.06] contrast-[1.03] saturate-[1.08]" />
              <div className="px-2 pb-2 pt-3 text-[#315f5a]">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-lg">{active.photo.title}</p>
                    <p className="mt-1 text-sm text-[#6a8178]">{active.photo.date} / {active.photo.place}</p>
                  </div>
                  <ItemEditLink section="photos" item={active.index} />
                </div>
                <p className="mt-2 text-sm leading-6 text-[#496f67]/78">{active.photo.note}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
