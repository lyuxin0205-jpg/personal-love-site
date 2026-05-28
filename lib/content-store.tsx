"use client";

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { siteContent } from "@/data/site";
import { isSupabaseConfigured, loadSiteContentFromSupabase, saveSiteContentToSupabase, uploadMediaToSupabase } from "@/lib/supabase-client";

export type SiteContent = typeof siteContent;

type ContentContextValue = {
  content: SiteContent;
  status: "loading" | "ready" | "saving" | "error";
  saveError: string;
  lastSavedAt: string;
  isRemote: boolean;
  setContent: (next: SiteContent) => void;
  updateContent: (updater: (current: SiteContent) => SiteContent) => void;
  resetContent: () => void;
  refreshContent: () => Promise<void>;
  uploadFile: (file: File, folder: "images" | "audio") => Promise<string>;
  storageKey: string;
};

const STORAGE_KEY = "supabase:shared-content";
const ContentContext = createContext<ContentContextValue | null>(null);

function deriveStoryCity(entry: SiteContent["story"][number]) {
  if ("city" in entry && entry.city) return entry.city;
  return entry.place.split("/")[0]?.trim() || entry.place;
}

function withDerivedContent(content: SiteContent): SiteContent {
  const couple = { ...siteContent.couple, ...content.couple };
  const gate = { ...siteContent.siteText.gate, ...content.siteText.gate };
  const wishlist = { ...siteContent.siteText.wishlist, ...content.siteText.wishlist } as SiteContent["siteText"]["wishlist"] & { completed?: string[] };

  if (couple.password === "0520") couple.password = "0419";
  gate.placeholder = gate.placeholder.replace("0520", "0419");
  wishlist.completed ||= [];

  return {
    ...siteContent,
    ...content,
    couple,
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
      gate,
      storyDetail: { ...siteContent.siteText.storyDetail, ...content.siteText.storyDetail },
      album: { ...siteContent.siteText.album, ...content.siteText.album },
      diary: { ...siteContent.siteText.diary, ...content.siteText.diary },
      messageBoard: { ...siteContent.siteText.messageBoard, ...content.siteText.messageBoard },
      reminders: { ...siteContent.siteText.reminders, ...content.siteText.reminders },
      wishlist,
      map: { ...siteContent.siteText.map, ...content.siteText.map },
      albumBook: { ...siteContent.siteText.albumBook, ...content.siteText.albumBook },
      player: { ...siteContent.siteText.player, ...content.siteText.player },
      loading: { ...siteContent.siteText.loading, ...content.siteText.loading },
      footer: { ...siteContent.siteText.footer, ...content.siteText.footer }
    }
  };
}

export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContentState] = useState<SiteContent>(siteContent);
  const [status, setStatus] = useState<ContentContextValue["status"]>("loading");
  const [saveError, setSaveError] = useState("");
  const [lastSavedAt, setLastSavedAt] = useState("");
  const remoteEnabled = isSupabaseConfigured();
  const saveTimer = useRef<number | null>(null);
  const loaded = useRef(false);

  const saveRemote = useCallback(
    (next: SiteContent) => {
      if (!remoteEnabled || typeof window === "undefined") {
        setStatus("ready");
        return;
      }

      if (saveTimer.current) window.clearTimeout(saveTimer.current);
      setStatus("saving");
      saveTimer.current = window.setTimeout(async () => {
        try {
          await saveSiteContentToSupabase(next);
          setSaveError("");
          setLastSavedAt(new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }));
          setStatus("ready");
        } catch (error) {
          setSaveError(error instanceof Error ? error.message : "保存失败");
          setStatus("error");
        }
      }, 650);
    },
    [remoteEnabled]
  );

  const refreshContent = useCallback(async () => {
    if (!remoteEnabled) {
      setContentState(withDerivedContent(siteContent));
      setStatus("ready");
      return;
    }

    setStatus((current) => (current === "saving" ? current : "loading"));
    try {
      const result = await loadSiteContentFromSupabase();
      const normalized = withDerivedContent(result.content);
      setContentState(normalized);
      setSaveError("");
      setStatus("ready");

      if (result.empty && !loaded.current) {
        saveRemote(normalized);
      }
      loaded.current = true;
    } catch (error) {
      setContentState(withDerivedContent(siteContent));
      setSaveError(error instanceof Error ? error.message : "读取 Supabase 失败，当前显示默认占位内容。");
      setStatus("error");
      loaded.current = true;
    }
  }, [remoteEnabled, saveRemote]);

  useEffect(() => {
    void refreshContent();
  }, [refreshContent]);

  useEffect(() => {
    if (!remoteEnabled || typeof window === "undefined") return;
    const timer = window.setInterval(() => {
      if (status === "ready") void refreshContent();
    }, 15_000);
    return () => window.clearInterval(timer);
  }, [refreshContent, remoteEnabled, status]);

  const value = useMemo<ContentContextValue>(() => {
    function persist(next: SiteContent) {
      const normalized = withDerivedContent(next);
      setContentState(normalized);
      saveRemote(normalized);
    }

    return {
      content,
      status,
      saveError,
      lastSavedAt,
      isRemote: remoteEnabled,
      setContent: persist,
      updateContent: (updater) => persist(updater(content)),
      resetContent: () => {
        persist(siteContent);
      },
      refreshContent,
      uploadFile: (file, folder) => uploadMediaToSupabase(file, folder),
      storageKey: STORAGE_KEY
    };
  }, [content, lastSavedAt, refreshContent, remoteEnabled, saveError, saveRemote, status]);

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent() {
  const value = useContext(ContentContext);
  if (!value) throw new Error("useContent must be used inside ContentProvider");
  return value;
}
