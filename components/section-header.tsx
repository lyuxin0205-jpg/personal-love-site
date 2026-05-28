export function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mx-auto mb-10 flex max-w-7xl items-end justify-between gap-6 sm:mb-12">
      <div>
        <div className="mb-3 flex items-center gap-3 text-[13px] text-[#6f9284]">
          <span className="h-px w-7 bg-[#6f9284]/54" />
          <span>{eyebrow}</span>
        </div>
        <h2 className="cinema-title text-balance text-[2rem] leading-[1.22] text-[#244d49] sm:text-[2.8rem]">{title}</h2>
      </div>
      <div className="hidden h-px flex-1 bg-gradient-to-r from-[#8fb5a3]/22 to-transparent lg:block" />
    </div>
  );
}
