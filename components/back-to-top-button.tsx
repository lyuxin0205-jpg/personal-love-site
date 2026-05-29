"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export function BackToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 500);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      aria-label="返回顶部"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`fixed bottom-[calc(4rem+env(safe-area-inset-bottom))] right-4 z-50 grid size-10 place-items-center rounded-full border border-[#4e8173]/18 bg-[#fffdf1]/64 text-[#315f5a]/64 shadow-[0_8px_24px_rgba(37,73,67,.055)] backdrop-blur-[3px] transition duration-500 ease-out hover:-translate-y-0.5 hover:border-[#315f5a]/34 hover:bg-[#eef5dc]/78 hover:text-[#173f3a]/82 active:translate-y-0 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#6fb79f]/24 sm:bottom-[calc(4.25rem+env(safe-area-inset-bottom))] sm:right-5 ${
        visible ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"
      }`}
    >
      <ArrowUp className="size-4" strokeWidth={1.8} />
    </button>
  );
}

