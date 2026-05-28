"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Circle } from "lucide-react";
import { useContent } from "@/lib/content-store";

export function WishList() {
  const { content, updateContent } = useContent();
  const { siteText, wishes } = content;
  const done = siteText.wishlist.completed;

  function toggleWish(wish: string) {
    updateContent((current) => {
      const completed = current.siteText.wishlist.completed.includes(wish)
        ? current.siteText.wishlist.completed.filter((item) => item !== wish)
        : [...current.siteText.wishlist.completed, wish];

      return {
        ...current,
        siteText: {
          ...current.siteText,
          wishlist: { ...current.siteText.wishlist, completed }
        }
      };
    });
  }

  return (
    <div className="border border-[#9dbbab]/22 bg-white/48 p-6 shadow-[0_16px_42px_rgba(37,73,67,.07)] sm:p-8">
      <p className="mb-4 text-sm text-[#6f9284]">{siteText.wishlist.eyebrow}</p>
      <h2 className="cinema-title mb-8 text-4xl text-[#244d49]">{siteText.wishlist.title}</h2>
      <div className="grid gap-3">
        {wishes.map((wish) => {
          const checked = done.includes(wish);
          return (
            <motion.button
              key={wish}
              layout
              onClick={() => toggleWish(wish)}
              className="group flex items-center gap-4 border border-[#9dbbab]/18 bg-[#fffdf1]/56 p-4 text-left transition hover:bg-[#fffdf1]/86"
            >
              <span className={`grid size-8 shrink-0 place-items-center rounded-full border transition ${checked ? "border-[#6f9f60] bg-[#6f9f60] text-white" : "border-[#315f5a]/18 text-[#315f5a]/42"}`}>
                {checked ? <Check className="size-4" /> : <Circle className="size-4" />}
              </span>
              <span className={`text-[15px] leading-7 transition ${checked ? "text-[#315f5a]/42 line-through" : "text-[#315f5a]/72 group-hover:text-[#244d49]"}`}>{wish}</span>
              <AnimatePresence>{checked && <motion.span initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} className="ml-auto text-sm text-[#6f9f60]">{siteText.wishlist.doneLabel}</motion.span>}</AnimatePresence>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
