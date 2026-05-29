"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Circle } from "lucide-react";
import { ItemEditLink } from "@/components/item-edit-link";
import { useContent } from "@/lib/content-store";

export function WishList() {
  const { content, updateContent } = useContent();
  const { siteText, wishes } = content;
  const wishlistText = siteText.wishlist as typeof siteText.wishlist & { completed?: string[] };
  const done = wishlistText.completed || [];

  function toggleWish(wish: string) {
    updateContent((current) => {
      const currentWishlist = current.siteText.wishlist as typeof current.siteText.wishlist & { completed?: string[] };
      const currentCompleted = currentWishlist.completed || [];
      const completed = currentCompleted.includes(wish)
        ? currentCompleted.filter((item: string) => item !== wish)
        : [...currentCompleted, wish];

      return {
        ...current,
        siteText: {
          ...current.siteText,
          wishlist: { ...current.siteText.wishlist, completed } as typeof current.siteText.wishlist & { completed: string[] }
        }
      };
    });
  }

  return (
    <div className="border border-[#9dbbab]/22 bg-white/48 p-6 shadow-[0_16px_42px_rgba(37,73,67,.07)] sm:p-8">
      <p className="mb-4 text-sm text-[#6f9284]">{siteText.wishlist.eyebrow}</p>
      <h2 className="cinema-title mb-8 text-4xl text-[#244d49]">{siteText.wishlist.title}</h2>
      <div className="grid gap-3">
        {wishes.map((wish, index) => {
          const checked = done.includes(wish);
          return (
            <motion.div
              key={`${wish}-${index}`}
              layout
              tabIndex={0}
              className="group relative flex flex-wrap items-center gap-4 border border-[#9dbbab]/18 bg-[#fffdf1]/56 p-4 pr-12 text-left transition hover:bg-[#fffdf1]/86 focus-within:bg-[#fffdf1]/80 focus:outline-none"
            >
              <ItemEditLink section="wishes" item={index} className="pointer-events-none absolute right-3 top-3 opacity-0 transition-opacity duration-500 group-hover:pointer-events-auto group-hover:opacity-75 group-focus-within:pointer-events-auto group-focus-within:opacity-75" />
              <button type="button" onClick={() => toggleWish(wish)} className="flex min-w-0 flex-1 items-center gap-4 text-left">
                <span className={`grid size-8 shrink-0 place-items-center rounded-full border transition ${checked ? "border-[#6f9f60] bg-[#6f9f60] text-white" : "border-[#315f5a]/18 text-[#315f5a]/42"}`}>
                  {checked ? <Check className="size-4" /> : <Circle className="size-4" />}
                </span>
                <span className={`text-[15px] leading-7 transition ${checked ? "text-[#315f5a]/42 line-through" : "text-[#315f5a]/72 group-hover:text-[#244d49]"}`}>{wish}</span>
              </button>
              <AnimatePresence>{checked && <motion.span initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} className="ml-auto text-sm text-[#6f9f60]">{siteText.wishlist.doneLabel}</motion.span>}</AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
