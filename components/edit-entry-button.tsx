"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function EditEntryButton() {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) return null;

  return (
    <Link
      href="/admin"
      aria-label="进入内容管理"
      className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-4 z-50 grid size-11 place-items-center rounded-full border border-[#4e8173]/34 bg-[#fffdf1]/88 text-lg font-medium leading-none text-[#214f49] shadow-[0_12px_30px_rgba(37,73,67,.12)] backdrop-blur-md transition duration-500 ease-out hover:-translate-y-0.5 hover:border-[#315f5a]/46 hover:bg-[#eef5dc]/92 hover:text-[#173f3a] active:translate-y-0 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#6fb79f]/28 sm:bottom-[calc(1.25rem+env(safe-area-inset-bottom))] sm:right-5"
    >
      <span aria-hidden="true">✎</span>
    </Link>
  );
}
