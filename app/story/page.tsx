"use client";

import { usePathname } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { StoryDetailView } from "@/components/story-detail-view";

export default function StoryFallbackPage() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug") || pathname.split("/").filter(Boolean).at(1) || "";

  return <StoryDetailView slug={slug} />;
}
