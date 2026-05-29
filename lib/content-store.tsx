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
        contentRef.current = next;
        setLastSavedAt(new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }));
        setStatus("ready");
        return Promise.resolve({ ok: true, content: next });
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
      setStatus("ready");
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
