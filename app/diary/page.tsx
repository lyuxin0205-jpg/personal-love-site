"use client";

import { ContentPageShell } from "@/components/content-page-shell";
import { CoupleDiary } from "@/components/couple-diary";
import { LifeFragments } from "@/components/life-fragments";
import { MessageBoard } from "@/components/message-board";
import { useContent } from "@/lib/content-store";

export default function DiaryPage() {
  const { content } = useContent();
  const { siteText } = content;

  return (
    <ContentPageShell
      activeHref="/diary"
      eyebrow={siteText.sections.diary.eyebrow}
      title={siteText.sections.diary.title}
      intro={siteText.contentPages.diaryIntro}
    >
      <div className="grid gap-16">
        <section>
          <p className="mb-8 w-fit border-b border-[#8fb5a3]/32 pb-2 text-sm leading-7 text-[#6f9284]">{siteText.sections.fragments.eyebrow}</p>
          <LifeFragments />
        </section>
        <section className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr]">
          <div>
            <p className="mb-8 w-fit border-b border-[#8fb5a3]/32 pb-2 text-sm leading-7 text-[#6f9284]">{siteText.sections.diary.title}</p>
            <CoupleDiary />
          </div>
          <div className="lg:pt-16">
            <p className="mb-8 w-fit border-b border-[#8fb5a3]/32 pb-2 text-sm leading-7 text-[#6f9284]">{siteText.sections.message.title}</p>
            <MessageBoard />
          </div>
        </section>
      </div>
    </ContentPageShell>
  );
}
