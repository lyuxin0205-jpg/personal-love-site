import { daysUntil } from "@/lib/date";
import { ItemEditLink } from "@/components/item-edit-link";
import { useContent } from "@/lib/content-store";

export function AnniversaryReminders() {
  const { content } = useContent();
  const { anniversaries, siteText } = content;
  return (
    <div className="border border-[#9dbbab]/22 bg-[#fffdf1]/66 p-6 shadow-[0_16px_42px_rgba(37,73,67,.08)] sm:p-8">
      <div className="mb-7 flex items-center gap-3">
        <div>
          <p className="text-sm text-[#6f9284]">{siteText.reminders.eyebrow}</p>
          <h2 className="cinema-title text-3xl text-[#244d49]">{siteText.reminders.title}</h2>
        </div>
      </div>
      <div className="grid gap-4">
        {anniversaries.map((item, index) => {
          const left = daysUntil(item.date);
          return (
            <article key={`${item.title}-${item.date}-${index}`} className="relative border-b border-[#9dbbab]/18 bg-white/38 p-4 pr-12 last:border-b-0">
              <ItemEditLink section="anniversaries" item={index} className="absolute right-3 top-3 opacity-40 hover:opacity-85" />
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[#244d49]">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-[#315f5a]/58">{item.note}</p>
                </div>
                <div className="text-right">
                  <p className="cinema-title text-3xl text-[#6f9f60]">{left >= 0 ? left : 365 + left}</p>
                  <p className="text-xs text-[#315f5a]/40">{siteText.reminders.dayUnit}</p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
