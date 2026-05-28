"use client";

import { motion } from "framer-motion";
import { useContent } from "@/lib/content-store";

export function LoadingCurtain() {
  const { content } = useContent();
  const { siteText } = content;
  return (
    <motion.div
      className="fixed inset-0 z-[90] grid place-items-center bg-[#f4f6eb]"
      exit={{ opacity: 0, filter: "blur(12px)" }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <div className="mb-5 h-px w-44 overflow-hidden bg-cream/10">
          <motion.div className="h-full bg-gold/70" initial={{ x: "-100%" }} animate={{ x: "100%" }} transition={{ duration: 1.35, ease: "easeInOut" }} />
        </div>
        <p className="text-sm tracking-[0.28em] text-cream/52">{siteText.loading.text}</p>
      </motion.div>
    </motion.div>
  );
}
