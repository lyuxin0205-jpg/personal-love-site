"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { useContent } from "@/lib/content-store";

const offsets = ["lg:translate-y-8", "lg:-translate-y-2", "lg:translate-y-14"];

export function TimeAtmosphere() {
  const ref = useRef<HTMLDivElement>(null);
  const { content } = useContent();
  const { timeAtmosphere } = content;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [22, -18]);

  return (
    <motion.div ref={ref} style={{ y }} className="mx-auto max-w-7xl">
      <div className="grid gap-4 sm:grid-cols-3 sm:gap-5">
        {timeAtmosphere.map((item, index) => (
          <motion.article
            key={`${item.season}-${item.city}`}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 1, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -4 }}
            className={`border-l border-[#8fb5a3]/32 bg-[#fffdf1]/46 px-5 py-5 shadow-[0_16px_38px_rgba(37,73,67,.055)] backdrop-blur-[5px] ${offsets[index % offsets.length]}`}
          >
            <div className="mb-5 flex items-baseline justify-between gap-4 text-[13px] text-[#6f9284]">
              <span>{item.season}</span>
              <span>{item.weather}</span>
            </div>
            <p className="mb-3 text-sm text-[#315f5a]/54">{item.city}</p>
            <p className="text-[16px] leading-8 text-[#244d49]/82">{item.line}</p>
          </motion.article>
        ))}
      </div>
    </motion.div>
  );
}
