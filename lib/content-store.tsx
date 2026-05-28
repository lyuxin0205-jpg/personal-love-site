"use client";

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { siteContent } from "@/data/site";

export type SiteContent = typeof siteContent;

type ContentContextValue = {
  content: SiteContent;
  setContent: (next: SiteContent) => void;
  updateContent: (updater: (current: SiteContent) => SiteContent) => void;
  resetContent: () => void;
  storageKey: string;
};

const STORAGE_KEY = "couple-site-content-v1";
const ContentContext = createContext<ContentContextValue | null>(null);

function deriveStoryCity(entry: SiteContent["story"][number]) {
  if ("city" in entry && entry.city) return entry.city;
  return entry.place.split("/")[0]?.trim() || entry.place;
}

function withDerivedContent(content: SiteContent): SiteContent {
  return {
    ...siteContent,
    ...content,
    couple: { ...siteContent.couple, ...content.couple },
    story: (content.story || siteContent.story).map((entry) => ({
      ...entry,
      city: deriveStoryCity(entry)
    })),
    siteText: {
      ...siteContent.siteText,
      ...content.siteText,
      metadata: { ...siteContent.siteText.metadata, ...content.siteText.metadata },
      navigation: siteContent.siteText.navigation.map((item, index) => ({
        ...item,
        label: content.siteText.navigation?.[index]?.label || item.label
      })),
      contentPages: { ...siteContent.siteText.contentPages, ...content.siteText.contentPages },
      hero: { ...siteContent.siteText.hero, ...content.siteText.hero },
      sections: { ...siteContent.siteText.sections, ...content.siteText.sections },
      gate: { ...siteContent.siteText.gate, ...content.siteText.gate },
      storyDetail: { ...siteContent.siteText.storyDetail, ...content.siteText.storyDetail },
      album: { ...siteContent.siteText.album, ...content.siteText.album },
      diary: { ...siteContent.siteText.diary, ...content.siteText.diary },
      messageBoard: { ...siteContent.siteText.messageBoard, ...content.siteText.messageBoard },
      reminders: { ...siteContent.siteText.reminders, ...content.siteText.reminders },
      wishlist: { ...siteContent.siteText.wishlist, ...content.siteText.wishlist },
      map: { ...siteContent.siteText.map, ...content.siteText.map },
      albumBook: { ...siteContent.siteText.albumBook, ...content.siteText.albumBook },
      player: { ...siteContent.siteText.player, ...content.siteText.player },
      loading: { ...siteContent.siteText.loading, ...content.siteText.loading },
      footer: { ...siteContent.siteText.footer, ...content.siteText.footer }
    }
  };
}

function readStoredContent() {
  if (typeof window === "undefined") return siteContent;
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (!saved) return siteContent;
  try {
    return withDerivedContent(JSON.parse(saved));
  } catch {
    return siteContent;
  }
}

export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContentState] = useState<SiteContent>(siteContent);

  useEffect(() => {
    setContentState(readStoredContent());
  }, []);

  const value = useMemo<ContentContextValue>(() => {
    function persist(next: SiteContent) {
      const normalized = withDerivedContent(next);
      setContentState(normalized);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    }

    return {
      content,
      setContent: persist,
      updateContent: (updater) => persist(updater(content)),
      resetContent: () => {
        setContentState(siteContent);
        window.localStorage.removeItem(STORAGE_KEY);
      },
      storageKey: STORAGE_KEY
    };
  }, [content]);

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent() {
  const value = useContext(ContentContext);
  if (!value) throw new Error("useContent must be used inside ContentProvider");
  return value;
}
