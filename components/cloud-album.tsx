"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useContent } from "@/lib/content-store";

export function CloudAlbum() {
  const { content } = useContent();
  const { siteText } = content;
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mx-auto mb-10 flex max-w-7xl flex-col gap-5 border-y border-[#9dbbab]/22 py-5 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <p className="text-base text-[#244d49]">{siteText.album.cloudTitle}</p>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-[#315f5a]/62">{siteText.album.cloudDescription}</p>
      </div>
      <Link href="/admin?section=photos" className="inline-flex w-fit items-center justify-center gap-2 rounded-full border border-[#8fb5a3]/28 bg-[#fffdf1]/72 px-5 py-3 text-sm text-[#315f5a]/72 transition hover:bg-[#fffdf1] hover:text-[#244d49]">
        {siteText.album.cloudButton}
      </Link>
    </motion.div>
  );
}
