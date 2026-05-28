"use client";

import { ContentPageShell } from "@/components/content-page-shell";
import { StoryTimeline } from "@/components/story-timeline";
import { useContent } from "@/lib/content-store";

export default function StoriesPage() {
  const { content } = useContent();
  const { siteText } = content;

  return (
    <ContentPageShell
      activeHref="/stories"
      eyebrow={siteText.sections.story.eyebrow}
      title={siteText.sections.story.title}
      intro={siteText.contentPages.storiesIntro}
    >
      <StoryTimeline />
    </ContentPageShell>
  );
}
