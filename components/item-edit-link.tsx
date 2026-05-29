import Link from "next/link";

type EditSection = "story" | "photos" | "diarySeeds" | "trips" | "anniversaries" | "wishes";

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
    "inline-flex w-fit items-center rounded-full border border-[#4e8173]/30 bg-[#fffdf1]/78 px-3 py-1.5 text-xs font-medium text-[#214f49] shadow-[0_8px_20px_rgba(37,73,67,.07)] backdrop-blur-md transition duration-500 ease-out hover:-translate-y-0.5 hover:border-[#315f5a]/44 hover:bg-[#eef5dc]/90 hover:text-[#173f3a] active:translate-y-0 active:scale-[0.98]";
  const fixedClass =
    "fixed bottom-[calc(4.35rem+env(safe-area-inset-bottom))] right-4 z-[60] sm:bottom-[calc(4.7rem+env(safe-area-inset-bottom))] sm:right-5";

  return (
    <Link href={href} className={`${baseClass} ${fixed ? fixedClass : ""} ${className}`} aria-label="编辑这一条">
      编辑这一条
    </Link>
  );
}
