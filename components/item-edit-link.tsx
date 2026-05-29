import Link from "next/link";
import { PencilLine } from "lucide-react";

type EditSection = "story" | "photos" | "diarySeeds" | "lifeFragments" | "trips" | "anniversaries" | "wishes";

export function ItemEditLink({
  section,
  item,
  fixed = false,
  className = ""
}: {
  section: EditSection;
  item: string | number;
  fixed?: boolean;
  className?: string;
}) {
  const href = `/admin?section=${section}&item=${encodeURIComponent(String(item))}`;
  const baseClass =
    "inline-grid size-8 shrink-0 place-items-center rounded-full border border-[#4e8173]/16 bg-[#fffdf1]/34 text-[#315f5a]/45 opacity-70 shadow-[0_8px_20px_rgba(37,73,67,.035)] backdrop-blur-[2px] transition duration-500 ease-out hover:-translate-y-0.5 hover:border-[#315f5a]/30 hover:bg-[#eef5dc]/72 hover:text-[#173f3a]/80 hover:opacity-100 active:translate-y-0 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#6fb79f]/22";
  const fixedClass =
    "fixed bottom-[calc(4.35rem+env(safe-area-inset-bottom))] right-4 z-[60] sm:bottom-[calc(4.7rem+env(safe-area-inset-bottom))] sm:right-5";

  return (
    <Link href={href} className={`${baseClass} ${fixed ? fixedClass : ""} ${className}`} aria-label="编辑这一条" title="编辑这一条">
      <PencilLine className="size-4" strokeWidth={1.7} aria-hidden="true" />
    </Link>
  );
}
