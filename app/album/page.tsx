"use client";

import { CloudAlbum } from "@/components/cloud-album";
import { ContentPageShell } from "@/components/content-page-shell";
import { PhotoWall } from "@/components/photo-wall";
import { ThreeDAlbum } from "@/components/three-d-album";
import { useContent } from "@/lib/content-store";

export default function AlbumPage() {
  const { content } = useContent();
  const { siteText } = content;

  return (
    <ContentPageShell
      activeHref="/album"
      eyebrow={siteText.sections.album.eyebrow}
      title={siteText.sections.album.title}
      intro={siteText.contentPages.albumIntro}
    >
      <div className="grid gap-14">
        <CloudAlbum />
        <PhotoWall />
        <section className="pt-4">
          <p className="mb-8 w-fit border-b border-[#8fb5a3]/32 pb-2 text-sm leading-7 text-[#6f9284]">{siteText.sections.book.eyebrow}</p>
          <ThreeDAlbum />
        </section>
      </div>
    </ContentPageShell>
  );
}
