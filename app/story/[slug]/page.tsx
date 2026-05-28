import type { Metadata } from "next";
import { StoryDetailView } from "@/components/story-detail-view";
import { siteText, story } from "@/data/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return story.map((item) => ({ slug: item.slug }));
}

type StoryPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: StoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = story.find((entry) => entry.slug === slug);
  if (!item) return { title: siteText.storyDetail.notFoundTitle };
  return {
    title: `${item.title} | ${siteText.metadata.title}`,
    description: item.text,
    openGraph: {
      title: item.title,
      description: item.text,
      images: [item.image]
    }
  };
}

export default async function StoryPage({ params }: StoryPageProps) {
  const { slug } = await params;
  return <StoryDetailView slug={slug} />;
}
