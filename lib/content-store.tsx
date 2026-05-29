"use client";

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { siteContent } from "@/data/site";
import { deleteMediaFromSupabase, isSupabaseConfigured, loadSiteContentFromSupabase, saveSiteContentToSupabase, uploadMediaToSupabase } from "@/lib/supabase-client";

export type SiteContent = typeof siteContent;

export type SaveResult = {
  ok: boolean;
  error?: string;
  content?: SiteContent;
};

type ContentContextValue = {
  content: SiteContent;
  status: "loading" | "ready" | "saving" | "error";
  saveError: string;
  lastSavedAt: string;
  isRemote: boolean;
  setContent: (next: SiteContent) => Promise<SaveResult>;
  updateContent: (updater: (current: SiteContent) => SiteContent) => Promise<SaveResult>;
  resetContent: () => Promise<SaveResult>;
  refreshContent: () => Promise<void>;
  uploadFile: (file: File, folder: "images" | "audio", onProgress?: (progress: number) => void) => Promise<string>;
  deleteFile: (fileUrl: string) => Promise<void>;
  storageKey: string;
};

const STORAGE_KEY = "supabase:shared-content";
const ContentContext = createContext<ContentContextValue | null>(null);

function deriveStoryCity(entry: SiteContent["story"][number]) {
  if ("city" in entry && entry.city) return entry.city;
  return entry.place.split("/")[0]?.trim() || entry.place;
}

function normalizeDiaryAuthor(author: string, couple: SiteContent["couple"], incomingAuthors?: string[]) {
  const fallbackAuthors = siteContent.siteText.diary.authors;
  if (author === fallbackAuthors[0] || author === incomingAuthors?.[0]) return couple.leftName;
  if (author === fallbackAuthors[1] || author === incomingAuthors?.[1]) return couple.rightName;
  return author;
}

function deriveHeroLine(couple: SiteContent["couple"], incomingCouple: SiteContent["couple"]) {
  const incomingLine = incomingCouple.heroLine || siteContent.couple.heroLine;
  const defaultLine = siteContent.couple.heroLine;

  if (incomingLine === defaultLine || /^.+和.+的日常$/.test(incomingLine)) {
    return `${couple.leftName}和${couple.rightName}的日常`;
  }

  return incomingLine;
}

function withDerivedContent(content: SiteContent): SiteContent {
  const incomingCouple = content.couple || siteContent.couple;
  const couple = { ...siteContent.couple, ...incomingCouple };
  const gate = { ...siteContent.siteText.gate, ...content.siteText.gate };
  const wishlist = { ...siteContent.siteText.wishlist, ...content.siteText.wishlist } as SiteContent["siteText"]["wishlist"] & { completed?: string[] };

  if (incomingCouple.password && !incomingCouple.passwordHash) {
    couple.passwordHash = "";
  }
  if (couple.passwordHash) {
    couple.password = "";
  }
  couple.heroLine = deriveHeroLine(couple, incomingCouple);
  wishlist.completed ||= [];
  const incomingDiaryAuthors = content.siteText?.diary?.authors;
  const diary = content.diarySeeds || siteContent.diarySeeds;

  return {
    ...siteContent,
    ...content,
    couple,
    diarySeeds: diary.map((entry) => ({
      ...entry,
      by: normalizeDiaryAuthor(entry.by, couple, incomingDiaryAuthors)
    })),
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
      diary: { ...siteContent.siteText.diary, ...content.siteText.diary, authors: [couple.leftName, couple.rightName] },
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

function readFileAsDataUrl(file: File, onProgress?: (progress: number) => void) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      onProgress?.(100);
      resolve(String(reader.result));
    };
    reader.onerror = () => reject(new Error("读取文件失败"));
    reader.onprogress = (event) => {
      if (!event.lengthComputable) return;
      onProgress?.(Math.round((event.loaded / event.total) * 100));
    };
    reader.readAsDataURL(file);
  });
}

export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContentState] = useState<SiteContent>(siteContent);
  const [status, setStatus] = useState<ContentContextValue["status"]>("loading");
  const [saveError, setSaveError] = useState("");
  const [lastSavedAt, setLastSavedAt] = useState("");
  const remoteEnabled = isSupabaseConfigured();
  const contentRef = useRef<SiteContent>(siteContent);
  const loaded = useRef(false);
  const saveQueue = useRef<Promise<SaveResult>>(Promise.resolve({ ok: true }));
  const saveVersion = useRef(0);

  const saveRemote = useCallback(
    (next: SiteContent): Promise<SaveResult> => {
      if (!remoteEnabled || typeof window === "undefined") {
        const message = "Supabase 环境变量未配置，无法保存到云端。请配置 NEXT_PUBLIC_SUPABASE_URL、NEXT_PUBLIC_SUPABASE_ANON_KEY 和 NEXT_PUBLIC_SUPABASE_BUCKET。";
        contentRef.current = next;
        setSaveError(message);
        setStatus("error");
        return Promise.resolve({ ok: false, error: message, content: next });
      }

      const version = ++saveVersion.current;
      setStatus("saving");

      const run = async (): Promise<SaveResult> => {
        try {
          await saveSiteContentToSupabase(next);
          const result = await loadSiteContentFromSupabase();
          const normalized = withDerivedContent(result.content);

          if (version === saveVersion.current) {
            contentRef.current = normalized;
            setContentState(normalized);
            setSaveError("");
            setLastSavedAt(new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }));
            setStatus("ready");
          }

          return { ok: true, content: normalized };
        } catch (error) {
          const message = error instanceof Error ? error.message : "保存失败";
          if (version === saveVersion.current) {
            setSaveError(message);
            setStatus("error");
          }
          return { ok: false, error: message };
        }
      };

      saveQueue.current = saveQueue.current.then(run, run);
      return saveQueue.current;
    },
    [remoteEnabled]
  );

  const refreshContent = useCallback(async () => {
    if (!remoteEnabled) {
      const fallback = withDerivedContent(siteContent);
      contentRef.current = fallback;
      setContentState(fallback);
      setSaveError("Supabase 环境变量未配置，当前只显示默认占位内容，后台修改不会持久化。");
      setStatus("error");
      return;
    }

    setStatus((current) => (current === "saving" ? current : "loading"));
    try {
      const result = await loadSiteContentFromSupabase();
      const normalized = withDerivedContent(result.content);
      contentRef.current = normalized;
      setContentState(normalized);
      setSaveError("");
      setStatus("ready");

      if (result.empty && !loaded.current) {
        void saveRemote(normalized);
      }
      loaded.current = true;
    } catch (error) {
      const fallback = withDerivedContent(siteContent);
      contentRef.current = fallback;
      setContentState(fallback);
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
      contentRef.current = normalized;
      setContentState(normalized);
      return saveRemote(normalized);
    }

    return {
      content,
      status,
      saveError,
      lastSavedAt,
      isRemote: remoteEnabled,
      setContent: persist,
      updateContent: (updater) => persist(updater(contentRef.current)),
      resetContent: () => persist(siteContent),
      refreshContent,
      uploadFile: (file, folder, onProgress) => (remoteEnabled ? uploadMediaToSupabase(file, folder, onProgress) : readFileAsDataUrl(file, onProgress)),
      deleteFile: (fileUrl) => (remoteEnabled ? deleteMediaFromSupabase(fileUrl) : Promise.resolve()),
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
