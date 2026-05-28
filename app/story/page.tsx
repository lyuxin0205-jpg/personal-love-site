"use client";

import { usePathname } from "next/navigation";
import { StoryDetailView } from "@/components/story-detail-view";

export default function StoryFallbackPage() {
  const pathname = usePathname();
  const slug = pathname.split("/").filter(Boolean).at(1) || "";

  return <StoryDetailView slug={slug} />;
}
