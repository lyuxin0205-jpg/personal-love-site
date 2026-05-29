"use client";

import { motion } from "framer-motion";
import { ItemEditLink } from "@/components/item-edit-link";
import { useContent } from "@/lib/content-store";

const rotations = ["-rotate-[1.2deg]", "rotate-[.8deg]", "-rotate-[.4deg]", "rotate-[1.4deg]", "-rotate-[.8deg]"];

export function LifeFragments() {
  const { content } = useContent();
  const { lifeFragments } = content;
  return (
    <div className="mx-auto max-w-7xl">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
        {lifeFragments.map((item, index) => (
          <motion.article
            key={`${item.time}-${item.place}-${index}`}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-12%" }}
            transition={{ duration: 0.9, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -5 }}
            className={`relative min-h-[210px] border border-[#d6dfc8] bg-[#fffdf1]/78 shadow-[0_14px_34px_rgba(37,73,67,.08)] backdrop-blur-[6px] ${rotations[index % rotations.length]} lg:min-h-[260px]`}
          >
            <ItemEditLink section="lifeFragments" item={index} className="absolute right-3 top-3 z-10 opacity-25 hover:opacity-85" />
            <motion.div animate={{ y: [0, index % 2 ? -3 : 3, 0] }} transition={{ duration: 9 + index, repeat: Infinity, ease: "easeInOut" }} className="h-full p-5">
              <span className="absolute left-1/2 top-0 h-5 w-20 -translate-x-1/2 -translate-y-1/2 bg-[#dfe9c8]/72 shadow-[0_4px_12px_rgba(58,86,70,.08)]" />
              <p className="mb-5 flex items-center justify-between gap-4 pr-8 text-[12px] text-[#6b8072]">
                <span>{item.time}</span>
                <span>{item.place}</span>
              </p>
              <p className="text-[17px] leading-8 text-[#274f4b] sm:text-[18px]">{item.text}</p>
            </motion.div>
          </motion.article>
        ))}
      </div>
    </div>
  );
}
