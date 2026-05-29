"use client";

import { ChangeEvent, MouseEvent, ReactNode, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  ArrowDown,
  ArrowUp,
  Camera,
  CheckCircle2,
  Cloud,
  Home,
  ImagePlus,
  ListPlus,
  Music2,
  Plus,
  RefreshCw,
  Trash2
} from "lucide-react";
import { clearAccessState, hashPasscode } from "@/lib/access-control";
import { SiteContent, useContent } from "@/lib/content-store";

type EditableSection = "photos" | "story" | "timeAtmosphere" | "lifeFragments" | "anniversaries" | "wishes" | "diarySeeds" | "trips" | "basic";

const inputClass =
  "w-full rounded-2xl border border-[#9dbbab]/26 bg-white/72 px-4 py-3 text-[16px] leading-6 text-[#244d49] outline-none transition focus:border-[#6fb79f]/70 focus:bg-white";
const textareaClass = `${inputClass} min-h-28 resize-y leading-7`;
const labelClass = "mb-2 block text-[13px] text-[#6f9284]";
const panelClass = "rounded-[1.45rem] border border-[#9dbbab]/22 bg-[#fffdf1]/76 p-4 shadow-[0_16px_42px_rgba(37,73,67,.055)] sm:p-6";
const cardClass = "rounded-[1.25rem] border border-[#9dbbab]/18 bg-white/58 p-3 shadow-[0_12px_30px_rgba(37,73,67,.045)] transition duration-700";
const buttonClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#6fb79f] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#5da98f] active:scale-[0.98]";
const ghostButtonClass =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[#8fb5a3]/28 bg-white/38 px-3.5 py-2 text-sm text-[#315f5a] transition hover:bg-white/72 active:scale-[0.98]";
const dangerButtonClass =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-rose/24 px-3.5 py-2 text-sm text-rose transition hover:bg-rose/8 active:scale-[0.98]";
const highlightClass = "ring-2 ring-[#6fb79f]/48 shadow-[0_18px_48px_rgba(37,73,67,.11)]";

const adminTabs: Array<{ id: EditableSection; label: string }> = [
  { id: "photos", label: "相册" },
  { id: "story", label: "故事" },
  { id: "timeAtmosphere", label: "生活气味" },
  { id: "lifeFragments", label: "鐗囨" },
  { id: "anniversaries", label: "纪念日" },
  { id: "wishes", label: "愿望" },
  { id: "diarySeeds", label: "日记" },
  { id: "trips", label: "城市" },
  { id: "basic", label: "基础" }
];

function cloneContent(content: SiteContent): SiteContent {
  return JSON.parse(JSON.stringify(content));
}

function monthToValue(value: string) {
  return (value || "").replace(".", "-").slice(0, 7);
}

function valueToMonth(value: string) {
  return value.replace("-", ".");
}

function dotDateToValue(value: string) {
  return (value || "").replace(/\./g, "-").slice(0, 10);
}

function valueToDotDate(value: string) {
  return value.replace(/-/g, ".");
}

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

function currentMonth() {
  return new Date().toISOString().slice(0, 7).replace("-", ".");
}

function newSlug(title = "新的故事") {
  const base = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/gi, "-")
    .replace(/^-|-$/g, "");
  return `${base || "story"}-${Date.now()}`;
}

function moveItem<T>(list: T[], index: number, direction: -1 | 1) {
  const target = index + direction;
  if (target < 0 || target >= list.length) return list;
  const next = [...list];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

function nearestRatio(width: number, height: number) {
  const ratio = width / height;
  const candidates = [
    { value: "3/4", score: Math.abs(ratio - 0.75) },
    { value: "4/5", score: Math.abs(ratio - 0.8) },
    { value: "2/3", score: Math.abs(ratio - 0.66) },
    { value: "1/1", score: Math.abs(ratio - 1) },
    { value: "5/4", score: Math.abs(ratio - 1.25) },
    { value: "4/3", score: Math.abs(ratio - 1.33) },
    { value: "3/2", score: Math.abs(ratio - 1.5) },
    { value: "16/10", score: Math.abs(ratio - 1.6) }
  ];
  return candidates.sort((a, b) => a.score - b.score)[0]?.value || "3/4";
}

function readImageRatio(file: File) {
  return new Promise<string>((resolve) => {
    const image = new window.Image();
    const url = URL.createObjectURL(file);
    image.onload = () => {
      resolve(nearestRatio(image.naturalWidth, image.naturalHeight));
      URL.revokeObjectURL(url);
    };
    image.onerror = () => {
      resolve("3/4");
      URL.revokeObjectURL(url);
    };
    image.src = url;
  });
}

const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];

type OptimizedImage = {
  file: File;
  beforeSize: number;
  afterSize: number;
  width: number;
  height: number;
  format: "webp" | "jpeg";
};

function humanFileSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(0)} KB`;
  return `${(size / 1024 / 1024).toFixed(2)} MB`;
}

function randomFileName(extension: "webp" | "jpg") {
  const random = Math.random().toString(36).slice(2, 8);
  return `${Date.now()}-${random}.${extension}`;
}

function nextFrame() {
  return new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
}

async function createOptimizedBlob(canvas: HTMLCanvasElement) {
  const qualities = [0.82, 0.78, 0.75];
  let best: { blob: Blob; format: "webp" | "jpeg" } | null = null;

  for (const quality of qualities) {
    const blob = await canvasToBlob(canvas, "image/webp", quality);
    if (!blob) break;
    if (!best || blob.size < best.blob.size) best = { blob, format: "webp" };
    if (blob.size <= 1024 * 1024) return best;
  }

  if (best) return best;

  for (const quality of qualities) {
    const blob = await canvasToBlob(canvas, "image/jpeg", quality);
    if (!blob) continue;
    if (!best || blob.size < best.blob.size) best = { blob, format: "jpeg" };
    if (blob.size <= 1024 * 1024) return best;
  }

  return best;
}

async function compressImage(file: File): Promise<OptimizedImage> {
  if (!allowedImageTypes.includes(file.type)) {
    throw new Error("只支持 JPG、PNG、WebP 图片。");
  }

  await nextFrame();
  const url = URL.createObjectURL(file);

  return new Promise<OptimizedImage>((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => {
      void (async () => {
        const maxSide = 1600;
        const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
        const width = Math.max(1, Math.round(image.naturalWidth * scale));
        const height = Math.max(1, Math.round(image.naturalHeight * scale));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");
        if (!context) {
          URL.revokeObjectURL(url);
          reject(new Error("图片压缩失败：当前浏览器无法处理这张图片。"));
          return;
        }

        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = "high";
        context.drawImage(image, 0, 0, width, height);

        const optimized = await createOptimizedBlob(canvas);
        URL.revokeObjectURL(url);

        if (!optimized) {
          reject(new Error("图片压缩失败：无法生成压缩文件。"));
          return;
        }

        const { blob, format } = optimized;
        const extension = format === "webp" ? "webp" : "jpg";
        resolve({
          file: new File([blob], randomFileName(extension), { type: format === "webp" ? "image/webp" : "image/jpeg", lastModified: Date.now() }),
          beforeSize: file.size,
          afterSize: blob.size,
          width,
          height,
          format
        });
      })().catch((error) => {
        URL.revokeObjectURL(url);
        reject(error instanceof Error ? error : new Error("图片压缩失败"));
      });
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("图片读取失败，请换一张 JPG、PNG 或 WebP 图片。"));
    };
    image.src = url;
  });
}

export default function AdminPage() {
  const { content, setContent, resetContent, storageKey, status, saveError, lastSavedAt, isRemote, uploadFile, deleteFile, refreshContent } = useContent();
  const [draft, setDraft] = useState<SiteContent>(() => cloneContent(content));
  const [uploadError, setUploadError] = useState("");
  const [highlightTarget, setHighlightTarget] = useState("");
  const [dirty, setDirty] = useState(false);
  const [saveNotice, setSaveNotice] = useState("");
  const [uploadBusy, setUploadBusy] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadPhase, setUploadPhase] = useState<"idle" | "compressing" | "uploading">("idle");
  const [lastCompression, setLastCompression] = useState<OptimizedImage | null>(null);
  const [draggedPhoto, setDraggedPhoto] = useState<number | null>(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [passwordNotice, setPasswordNotice] = useState("");
  const saveVersion = useRef(0);
  const saveTimer = useRef<number | null>(null);
  const editingRef = useRef(false);

  useEffect(() => {
    if (!editingRef.current) setDraft(cloneContent(content));
  }, [content]);

  useEffect(() => {
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
  }, []);

  useEffect(() => {
    function beforeUnload(event: BeforeUnloadEvent) {
      if (!dirty && status !== "saving") return;
      event.preventDefault();
      event.returnValue = "你有未保存的修改，是否离开？";
    }

    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [dirty, status]);

  useEffect(() => {
    if (!lastSavedAt || status !== "ready" || dirty) return;
    setSaveNotice("✓ 已保存");
    const timer = window.setTimeout(() => setSaveNotice(""), 2600);
    return () => window.clearTimeout(timer);
  }, [dirty, lastSavedAt, status]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const section = params.get("section");
    if (!section) return;

    const item = params.get("item");
    const target = item ? `${section}:${item}` : `${section}:section`;
    setHighlightTarget(target);

    window.setTimeout(() => {
      const element = (item ? document.querySelector(`[data-admin-target="${target}"]`) : null) || document.getElementById(`admin-${section}`);
      element?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 320);

    const timer = window.setTimeout(() => setHighlightTarget(""), 5200);
    return () => window.clearTimeout(timer);
  }, []);

  function isHighlighted(section: string, item?: string | number) {
    return highlightTarget === `${section}:${item ?? "section"}`;
  }

  function scheduleSave(next: SiteContent) {
    const version = ++saveVersion.current;
    setDirty(true);
    setSaveNotice("");
    editingRef.current = true;
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(async () => {
      const result = await setContent(next);
      if (version !== saveVersion.current) return;

      if (result.ok) {
        if (result.content) setDraft(cloneContent(result.content));
        setDirty(false);
        setSaveNotice("✓ 已保存");
        editingRef.current = false;
        return;
      }

      setDirty(true);
      setSaveNotice("保存失败");
      editingRef.current = true;
    }, 1000);
  }

  function updateDraft(updater: (current: SiteContent) => SiteContent) {
    setDraft((current) => {
      const next = updater(cloneContent(current));
      scheduleSave(next);
      return next;
    });
  }

  function confirmNavigation(event: MouseEvent<HTMLAnchorElement>) {
    if (!dirty && status !== "saving") return;
    if (!window.confirm("你有未保存的修改，是否离开？")) {
      event.preventDefault();
    }
  }

  function updateCouple(field: keyof SiteContent["couple"], value: string) {
    updateDraft((current) => {
      const previousLeft = current.couple.leftName;
      const previousRight = current.couple.rightName;
      const couple = { ...current.couple, [field]: value };
      const nextAuthors = [couple.leftName, couple.rightName];

      return {
        ...current,
        couple,
        siteText: {
          ...current.siteText,
          diary: { ...current.siteText.diary, authors: nextAuthors }
        },
        diarySeeds: current.diarySeeds.map((entry) => ({
          ...entry,
          by: entry.by === previousLeft ? couple.leftName : entry.by === previousRight ? couple.rightName : entry.by
        }))
      };
    });
  }

  function addHeroNote() {
    updateDraft((current) => ({
      ...current,
      couple: { ...current.couple, heroNotes: [...current.couple.heroNotes, "写下一句最近想留住的小事。"] }
    }));
  }

  function updateHeroNote(index: number, value: string) {
    updateDraft((current) => {
      current.couple.heroNotes[index] = value;
      return current;
    });
  }

  function removeHeroNote(index: number) {
    if (!window.confirm("确定删除吗？")) return;
    updateDraft((current) => ({
      ...current,
      couple: { ...current.couple, heroNotes: current.couple.heroNotes.filter((_, itemIndex) => itemIndex !== index) }
    }));
  }

  function moveHeroNote(index: number, direction: -1 | 1) {
    updateDraft((current) => ({
      ...current,
      couple: { ...current.couple, heroNotes: moveItem(current.couple.heroNotes, index, direction) }
    }));
  }

  async function updateAccessPassword() {
    const nextPassword = passwordInput.trim();
    if (!nextPassword) {
      setPasswordNotice("请输入新访问密码。");
      return;
    }
    if (nextPassword.length < 4) {
      setPasswordNotice("密码至少 4 位。");
      return;
    }

    setPasswordBusy(true);
    setPasswordNotice("");
    try {
      const next = cloneContent(draft);
      next.couple = {
        ...next.couple,
        password: "",
        passwordHash: await hashPasscode(nextPassword),
        passwordUpdatedAt: new Date().toISOString(),
        accessVersion: String(Date.now())
      };
      const result = await setContent(next);
      if (!result.ok) {
        setPasswordNotice(`保存失败：${result.error || "请稍后重试"}`);
        return;
      }

      setPasswordInput("");
      if (result.content) setDraft(cloneContent(result.content));
      setDirty(false);
      clearAccessState("密码已修改，请使用新密码重新登录");
      setPasswordNotice("密码已修改，请使用新密码重新登录");
    } finally {
      setPasswordBusy(false);
    }
  }

  function updatePlayer(field: keyof SiteContent["siteText"]["player"], value: string) {
    updateDraft((current) => ({
      ...current,
      siteText: { ...current.siteText, player: { ...current.siteText.player, [field]: value } }
    }));
  }

  function updateNavigation(index: number, label: string) {
    updateDraft((current) => {
      current.siteText.navigation[index] = { ...current.siteText.navigation[index], label };
      return current;
    });
  }

  async function optimizeImageForUpload(file: File) {
    setUploadPhase("compressing");
    setUploadProgress(0);
    setLastCompression(null);
    const optimized = await compressImage(file);
    setLastCompression(optimized);
    return optimized;
  }

  async function uploadFromInput(event: ChangeEvent<HTMLInputElement>, folder: "images" | "audio") {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return "";

    try {
      setUploadBusy(true);
      setUploadProgress(0);
      setUploadPhase(folder === "images" ? "compressing" : "uploading");
      setUploadError("");
      const uploadTarget = folder === "images" ? (await optimizeImageForUpload(file)).file : file;
      setUploadPhase("uploading");
      return await uploadFile(uploadTarget, folder, setUploadProgress);
    } catch (error) {
      const message = error instanceof Error ? error.message : "上传失败";
      setUploadError(message);
      return "";
    } finally {
      setUploadBusy(false);
      setUploadPhase("idle");
      window.setTimeout(() => setUploadProgress(0), 700);
    }
  }

  async function addPhotosFromUpload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length) return;

    try {
      setUploadBusy(true);
      setUploadProgress(0);
      setUploadPhase("compressing");
      setUploadError("");
      const created: SiteContent["photos"] = [];
      for (const [index, file] of files.entries()) {
        const optimized = await optimizeImageForUpload(file);
        setUploadPhase("uploading");
        const [src, ratio] = await Promise.all([
          uploadFile(optimized.file, "images", (progress) => {
            setUploadProgress(Math.round(((index + progress / 100) / files.length) * 100));
          }),
          readImageRatio(optimized.file)
        ]);
        created.push({
          src,
          title: file.name.replace(/\.[^.]+$/, "") || "新照片",
          date: currentMonth(),
          place: "还没写地点",
          note: "写下这张照片背后的瞬间。",
          ratio,
          live: false
        });
      }

      updateDraft((current) => ({ ...current, photos: [...created, ...current.photos] }));
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "上传失败");
    } finally {
      setUploadBusy(false);
      setUploadPhase("idle");
      window.setTimeout(() => setUploadProgress(0), 700);
    }
  }

  async function replacePhotoImage(event: ChangeEvent<HTMLInputElement>, index: number) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      setUploadBusy(true);
      setUploadProgress(0);
      setUploadPhase("compressing");
      setUploadError("");
      const optimized = await optimizeImageForUpload(file);
      setUploadPhase("uploading");
      const [src, ratio] = await Promise.all([uploadFile(optimized.file, "images", setUploadProgress), readImageRatio(optimized.file)]);
      updatePhoto(index, { src, ratio });
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "上传失败");
    } finally {
      setUploadBusy(false);
      setUploadPhase("idle");
      window.setTimeout(() => setUploadProgress(0), 700);
    }
  }

  async function replaceStoryImage(event: ChangeEvent<HTMLInputElement>, index: number) {
    const url = await uploadFromInput(event, "images");
    if (url) updateStory(index, { image: url });
  }

  async function uploadHero(event: ChangeEvent<HTMLInputElement>) {
    const url = await uploadFromInput(event, "images");
    if (url) updateCouple("backgroundImage", url);
  }

  async function uploadMusic(event: ChangeEvent<HTMLInputElement>) {
    const url = await uploadFromInput(event, "audio");
    if (url) updatePlayer("src", url);
  }

  function updatePhoto(index: number, patch: Partial<SiteContent["photos"][number]>) {
    updateDraft((current) => {
      current.photos[index] = { ...current.photos[index], ...patch };
      return current;
    });
  }

  async function removePhoto(index: number) {
    if (!window.confirm("确定删除吗？")) return;
    try {
      setUploadError("");
      await deleteFile(draft.photos[index]?.src || "");
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "删除照片失败");
      return;
    }
    updateDraft((current) => ({ ...current, photos: current.photos.filter((_, itemIndex) => itemIndex !== index) }));
  }

  function movePhoto(index: number, direction: -1 | 1) {
    updateDraft((current) => ({ ...current, photos: moveItem(current.photos, index, direction) }));
  }

  function dropPhoto(targetIndex: number) {
    if (draggedPhoto === null || draggedPhoto === targetIndex) {
      setDraggedPhoto(null);
      return;
    }

    updateDraft((current) => {
      const photos = [...current.photos];
      const [item] = photos.splice(draggedPhoto, 1);
      photos.splice(targetIndex, 0, item);
      return { ...current, photos };
    });
    setDraggedPhoto(null);
  }

  function addStory() {
    updateDraft((current) => ({
      ...current,
      story: [
        {
          slug: newSlug(),
          date: currentMonth(),
          city: "新的城市",
          time: "鍌嶆櫄",
          place: "还没写地点",
          weather: "有风",
          music: current.siteText.player.title,
          meta: "新的城市 / 傍晚 / 有风",
          title: "新的故事",
          image: current.couple.backgroundImage,
          text: "写一小段故事摘要。",
          detailText: "像私人日记一样写下那一天发生的事。"
        },
        ...current.story
      ]
    }));
  }

  function updateStory(index: number, patch: Partial<SiteContent["story"][number]>) {
    updateDraft((current) => {
      current.story[index] = { ...current.story[index], ...patch };
      return current;
    });
  }

  function removeStory(index: number) {
    if (!window.confirm("确定删除吗？")) return;
    updateDraft((current) => ({ ...current, story: current.story.filter((_, itemIndex) => itemIndex !== index) }));
  }

  function moveStory(index: number, direction: -1 | 1) {
    updateDraft((current) => ({ ...current, story: moveItem(current.story, index, direction) }));
  }

  function addTimeAtmosphere() {
    updateDraft((current) => ({
      ...current,
      timeAtmosphere: [{ season: "新的季节", weather: "天气", city: "地点", line: "写下最近生活里的气味。" }, ...current.timeAtmosphere]
    }));
  }

  function updateTimeAtmosphere(index: number, patch: Partial<SiteContent["timeAtmosphere"][number]>) {
    updateDraft((current) => {
      current.timeAtmosphere[index] = { ...current.timeAtmosphere[index], ...patch };
      return current;
    });
  }

  function removeTimeAtmosphere(index: number) {
    if (!window.confirm("确定删除吗？")) return;
    updateDraft((current) => ({ ...current, timeAtmosphere: current.timeAtmosphere.filter((_, itemIndex) => itemIndex !== index) }));
  }

  function moveTimeAtmosphere(index: number, direction: -1 | 1) {
    updateDraft((current) => ({ ...current, timeAtmosphere: moveItem(current.timeAtmosphere, index, direction) }));
  }

  function addDiary() {
    updateDraft((current) => ({
      ...current,
      diarySeeds: [{ by: current.couple.leftName, text: "写下一句今天发生的小事。", date: valueToDotDate(todayDate()) }, ...current.diarySeeds]
    }));
  }

  function updateDiary(index: number, patch: Partial<SiteContent["diarySeeds"][number]>) {
    updateDraft((current) => {
      current.diarySeeds[index] = { ...current.diarySeeds[index], ...patch };
      return current;
    });
  }

  function removeDiary(index: number) {
    if (!window.confirm("确定删除吗？")) return;
    updateDraft((current) => ({ ...current, diarySeeds: current.diarySeeds.filter((_, itemIndex) => itemIndex !== index) }));
  }

  function moveDiary(index: number, direction: -1 | 1) {
    updateDraft((current) => ({ ...current, diarySeeds: moveItem(current.diarySeeds, index, direction) }));
  }

  function addLifeFragment() {
    updateDraft((current) => ({
      ...current,
	      lifeFragments: [{ time: "新的时间", place: "还没写地点", text: "写下一段很小、但想留下来的生活片段。" }, ...current.lifeFragments]
    }));
  }

  function updateLifeFragment(index: number, patch: Partial<SiteContent["lifeFragments"][number]>) {
    updateDraft((current) => {
      current.lifeFragments[index] = { ...current.lifeFragments[index], ...patch };
      return current;
    });
  }

  function removeLifeFragment(index: number) {
    if (!window.confirm("确定删除吗？")) return;
    updateDraft((current) => ({ ...current, lifeFragments: current.lifeFragments.filter((_, itemIndex) => itemIndex !== index) }));
  }

  function moveLifeFragment(index: number, direction: -1 | 1) {
    updateDraft((current) => ({ ...current, lifeFragments: moveItem(current.lifeFragments, index, direction) }));
  }

  function addTrip() {
    updateDraft((current) => ({
      ...current,
      trips: [{ city: "新的城市", x: 50, y: 50, caption: "写下这座城市里的记忆。" }, ...current.trips]
    }));
  }

  function updateTrip(index: number, patch: Partial<SiteContent["trips"][number]>) {
    updateDraft((current) => {
      current.trips[index] = { ...current.trips[index], ...patch };
      return current;
    });
  }

  function removeTrip(index: number) {
    if (!window.confirm("确定删除吗？")) return;
    updateDraft((current) => ({ ...current, trips: current.trips.filter((_, itemIndex) => itemIndex !== index) }));
  }

  function moveTrip(index: number, direction: -1 | 1) {
    updateDraft((current) => ({ ...current, trips: moveItem(current.trips, index, direction) }));
  }

  function addAnniversary() {
    updateDraft((current) => ({
      ...current,
	      anniversaries: [{ title: "新的纪念日", date: todayDate(), note: "写下这一天为什么重要。" }, ...current.anniversaries]
    }));
  }

  function updateAnniversary(index: number, patch: Partial<SiteContent["anniversaries"][number]>) {
    updateDraft((current) => {
      current.anniversaries[index] = { ...current.anniversaries[index], ...patch };
      return current;
    });
  }

  function removeAnniversary(index: number) {
    if (!window.confirm("确定删除吗？")) return;
    updateDraft((current) => ({ ...current, anniversaries: current.anniversaries.filter((_, itemIndex) => itemIndex !== index) }));
  }

  function moveAnniversary(index: number, direction: -1 | 1) {
    updateDraft((current) => ({ ...current, anniversaries: moveItem(current.anniversaries, index, direction) }));
  }

  function completedWishes(current = draft) {
    const wishlist = current.siteText.wishlist as typeof current.siteText.wishlist & { completed?: string[] };
    return wishlist.completed || [];
  }

  function addWish() {
    updateDraft((current) => ({ ...current, wishes: ["新的愿望", ...current.wishes] }));
  }

  function updateWish(index: number, value: string) {
    updateDraft((current) => {
      const previous = current.wishes[index];
      const wishlist = current.siteText.wishlist as typeof current.siteText.wishlist & { completed?: string[] };
      current.wishes[index] = value;
      wishlist.completed = (wishlist.completed || []).map((item: string) => (item === previous ? value : item));
      return current;
    });
  }

  function setWishDone(index: number, checked: boolean) {
    updateDraft((current) => {
      const wish = current.wishes[index];
      const wishlist = current.siteText.wishlist as typeof current.siteText.wishlist & { completed?: string[] };
      const completed = wishlist.completed || [];
      const nextCompleted = checked ? Array.from(new Set([...completed, wish])) : completed.filter((item: string) => item !== wish);
      return {
        ...current,
        siteText: {
          ...current.siteText,
          wishlist: { ...current.siteText.wishlist, completed: nextCompleted } as typeof current.siteText.wishlist & { completed: string[] }
        }
      };
    });
  }

  function removeWish(index: number) {
    if (!window.confirm("确定删除吗？")) return;
    updateDraft((current) => {
      const removed = current.wishes[index];
      const wishlist = current.siteText.wishlist as typeof current.siteText.wishlist & { completed?: string[] };
      return {
        ...current,
        wishes: current.wishes.filter((_, itemIndex) => itemIndex !== index),
        siteText: {
          ...current.siteText,
          wishlist: {
            ...current.siteText.wishlist,
            completed: (wishlist.completed || []).filter((item: string) => item !== removed)
          }
        }
      };
    });
  }

  function moveWish(index: number, direction: -1 | 1) {
    updateDraft((current) => ({ ...current, wishes: moveItem(current.wishes, index, direction) }));
  }

  async function syncRemote() {
    if ((dirty || status === "saving") && !window.confirm("你有未保存的修改，是否重新读取云端内容？")) return;
    editingRef.current = false;
    await refreshContent();
    setDirty(false);
    setSaveNotice("");
  }

  async function restoreDefaults() {
    if (!window.confirm("确定恢复占位数据吗？当前修改会被覆盖。")) return;
    editingRef.current = false;
    const result = await resetContent();
    if (result.ok) {
      setDirty(false);
      setSaveNotice("✓ 已保存");
      return;
    }
    setDirty(true);
    setSaveNotice("保存失败");
  }

  const uploadStatusText =
    uploadPhase === "compressing"
      ? "正在压缩..."
      : uploadPhase === "uploading"
        ? `正在上传... ${uploadProgress}%`
        : uploadBusy
          ? "正在处理..."
          : "";

  return (
    <main className="min-h-screen bg-ink px-4 py-5 text-[#244d49] sm:px-8 lg:px-14">
      <div className="fixed left-1/2 top-4 z-[90] -translate-x-1/2">
        {(status === "saving" || status === "error" || uploadBusy || dirty || saveNotice) && (
          <div className="min-w-56 overflow-hidden rounded-[1rem] border border-[#8fb5a3]/24 bg-[#fffdf1]/92 px-4 py-3 text-sm text-[#315f5a] shadow-[0_12px_30px_rgba(37,73,67,.1)] backdrop-blur-md">
            <p>{uploadBusy ? uploadStatusText : status === "error" || saveError ? "保存失败" : status === "saving" || dirty ? "正在保存..." : saveNotice}</p>
            {uploadBusy && <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#dce8cc]"><div className="h-full rounded-full bg-[#6fb79f] transition-all duration-300" style={{ width: `${uploadProgress}%` }} /></div>}
            {uploadBusy && lastCompression && (
              <p className="mt-2 text-xs text-[#315f5a]/58">
                {humanFileSize(lastCompression.beforeSize)} → {humanFileSize(lastCompression.afterSize)}
              </p>
            )}
          </div>
        )}
      </div>
      <div className="mx-auto max-w-7xl">
        <header className="mb-5 rounded-[1.6rem] border border-[#9dbbab]/22 bg-[#fffdf1]/78 p-5 shadow-[0_16px_42px_rgba(37,73,67,.055)] sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-[#e8f2d8]/72 px-3 py-1 text-xs text-[#55786d]">
                <Cloud className="size-3.5" />
                {isRemote ? "云端保存，其他设备可见" : `本地预览：${storageKey}`}
              </p>
              <h1 className="cinema-title mt-4 text-4xl leading-tight sm:text-5xl">内容管理</h1>
              <p className="mt-3 max-w-2xl text-[15px] leading-7 text-[#315f5a]/66">
                像发朋友圈一样上传照片、写故事和改纪念日。这里不会显示 JSON，也不需要懂 GitHub 或部署。
                {status === "saving" && " 正在自动保存..."}
                {lastSavedAt && status === "ready" && ` 已保存 ${lastSavedAt}`}
              </p>
              {(saveError || uploadError) && <p className="mt-3 max-w-2xl text-sm leading-7 text-rose">{saveError || uploadError}</p>}
            </div>
            <div className="flex flex-wrap gap-2">
              <a href="/" className={ghostButtonClass}>
                <Home className="size-4" />
                看前台
              </a>
              <button onClick={() => void syncRemote()} className={ghostButtonClass}>
                <RefreshCw className="size-4" />
                同步
              </button>
              <button onClick={() => void restoreDefaults()} className={ghostButtonClass}>
                鎭㈠鍗犱綅
              </button>
            </div>
          </div>
        </header>

        <nav className="sticky top-2 z-20 mb-6 overflow-x-auto rounded-full border border-[#9dbbab]/20 bg-[#f8f5e8]/86 p-1 shadow-[0_10px_26px_rgba(37,73,67,.06)] backdrop-blur-md">
          <div className="flex min-w-max gap-1">
            {adminTabs.map((tab) => (
              <a key={tab.id} href={`#admin-${tab.id}`} onClick={confirmNavigation} className="rounded-full px-4 py-2.5 text-sm text-[#315f5a]/62 transition hover:bg-white/72 hover:text-[#244d49]">
                {tab.label}
              </a>
            ))}
          </div>
        </nav>

        <div className="grid gap-6">
          <section id="admin-photos" className={`${panelClass} ${isHighlighted("photos") ? highlightClass : ""}`}>
            <SectionHeader eyebrow="像发朋友圈一样" title="相册管理" count={`${draft.photos.length} 张照片`}>
              <label className={`${buttonClass} w-full cursor-pointer sm:w-auto`}>
                <ImagePlus className="size-4" />
                {uploadBusy ? "正在上传..." : "上传照片"}
                <input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={uploadBusy} onChange={(event) => void addPhotosFromUpload(event)} />
              </label>
            </SectionHeader>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {draft.photos.map((photo, index) => (
                <article
                  key={`${photo.src}-${index}`}
                  data-admin-target={`photos:${index}`}
                  draggable
                  onDragStart={() => setDraggedPhoto(index)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => dropPhoto(index)}
                  onDragEnd={() => setDraggedPhoto(null)}
                  className={`${cardClass} ${draggedPhoto === index ? "opacity-55 ring-2 ring-[#6fb79f]/24" : ""} ${isHighlighted("photos", index) ? highlightClass : ""}`}
                >
                  <div className="relative overflow-hidden rounded-[1rem] bg-[#e4f4f0]">
                    <Image src={photo.src} alt={photo.title} width={720} height={540} unoptimized className="aspect-[4/3] w-full object-cover" />
                    <div className="absolute left-3 top-3 rounded-full bg-white/76 px-3 py-1 text-xs text-[#315f5a]">{index + 1}</div>
                  </div>
                  <div className="mt-4 grid gap-3">
                    <label className={ghostButtonClass}>
                      <Camera className="size-4" />
                      {uploadBusy ? "正在处理..." : "鏇存崲鐓х墖"}
                      <input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" disabled={uploadBusy} onChange={(event) => void replacePhotoImage(event, index)} />
                    </label>
                    <Field label="标题"><input className={inputClass} value={photo.title} onChange={(event) => updatePhoto(index, { title: event.target.value })} /></Field>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="日期"><input className={inputClass} type="month" value={monthToValue(photo.date)} onChange={(event) => updatePhoto(index, { date: valueToMonth(event.target.value) })} /></Field>
                      <Field label="地点"><input className={inputClass} value={photo.place} onChange={(event) => updatePhoto(index, { place: event.target.value })} /></Field>
                    </div>
                    <Field label="备注"><textarea className={textareaClass} value={photo.note} onChange={(event) => updatePhoto(index, { note: event.target.value })} /></Field>
                    <div className="flex flex-wrap justify-between gap-2">
                      <SortButtons index={index} length={draft.photos.length} onMove={movePhoto} />
                      <button className={dangerButtonClass} onClick={() => void removePhoto(index)}><Trash2 className="size-4" />鍒犻櫎</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section id="admin-story" className={`${panelClass} ${isHighlighted("story") ? highlightClass : ""}`}>
	            <SectionHeader eyebrow="私人电影日志" title="故事管理" count={`${draft.story.length} 个故事`}>
              <button className={`${buttonClass} w-full sm:w-auto`} onClick={addStory}><Plus className="size-4" />新增故事</button>
            </SectionHeader>
            <div className="grid gap-4">
              {draft.story.map((item, index) => (
                <article key={`${item.slug}-${index}`} data-admin-target={`story:${item.slug}`} className={`${cardClass} grid gap-4 lg:grid-cols-[18rem_1fr] ${isHighlighted("story", item.slug) ? highlightClass : ""}`}>
                  <div>
                    <Image src={item.image} alt={item.title} width={720} height={540} unoptimized className="aspect-[4/3] w-full rounded-[1rem] bg-[#e4f4f0] object-cover" />
                    <label className={`${ghostButtonClass} mt-3 w-full cursor-pointer`}>
                      <Camera className="size-4" />
                      上传封面
                      <input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => void replaceStoryImage(event, index)} />
                    </label>
                  </div>
                  <div className="grid gap-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="标题"><input className={inputClass} value={item.title} onChange={(event) => updateStory(index, { title: event.target.value })} /></Field>
                      <Field label="日期"><input className={inputClass} type="month" value={monthToValue(item.date)} onChange={(event) => updateStory(index, { date: valueToMonth(event.target.value) })} /></Field>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <Field label="地点"><input className={inputClass} value={item.place} onChange={(event) => updateStory(index, { place: event.target.value })} /></Field>
                      <Field label="时间"><input className={inputClass} value={item.time} onChange={(event) => updateStory(index, { time: event.target.value })} /></Field>
                      <Field label="标签"><input className={inputClass} value={item.meta} onChange={(event) => updateStory(index, { meta: event.target.value })} /></Field>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <Field label="城市"><input className={inputClass} value={item.city} onChange={(event) => updateStory(index, { city: event.target.value })} /></Field>
                      <Field label="天气"><input className={inputClass} value={item.weather} onChange={(event) => updateStory(index, { weather: event.target.value })} /></Field>
                      <Field label="当时听的歌"><input className={inputClass} value={item.music} onChange={(event) => updateStory(index, { music: event.target.value })} /></Field>
                    </div>
                    <Field label="简短摘要"><textarea className={textareaClass} value={item.text} onChange={(event) => updateStory(index, { text: event.target.value })} /></Field>
                    <Field label="详细正文"><textarea className={`${textareaClass} min-h-40`} value={item.detailText} onChange={(event) => updateStory(index, { detailText: event.target.value })} /></Field>
                    <div className="flex flex-wrap justify-between gap-2">
                      <SortButtons index={index} length={draft.story.length} onMove={moveStory} />
                      <button className={dangerButtonClass} onClick={() => removeStory(index)}><Trash2 className="size-4" />删除故事</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section id="admin-timeAtmosphere" className={`${panelClass} ${isHighlighted("timeAtmosphere") ? highlightClass : ""}`}>
            <SectionHeader eyebrow="最近几天的光" title="生活气味" count={`${draft.timeAtmosphere.length} 条`}>
              <button className={`${buttonClass} w-full sm:w-auto`} onClick={addTimeAtmosphere}><Plus className="size-4" />新增生活气味</button>
            </SectionHeader>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {draft.timeAtmosphere.map((item, index) => (
                <article key={`${item.season}-${item.city}-${index}`} data-admin-target={`timeAtmosphere:${index}`} className={`${cardClass} ${isHighlighted("timeAtmosphere", index) ? highlightClass : ""}`}>
                  <div className="grid gap-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="季节 / 日期"><input className={inputClass} value={item.season} onChange={(event) => updateTimeAtmosphere(index, { season: event.target.value })} /></Field>
                      <Field label="天气"><input className={inputClass} value={item.weather} onChange={(event) => updateTimeAtmosphere(index, { weather: event.target.value })} /></Field>
                    </div>
                    <Field label="地点"><input className={inputClass} value={item.city} onChange={(event) => updateTimeAtmosphere(index, { city: event.target.value })} /></Field>
                    <Field label="描述"><textarea className={textareaClass} value={item.line} onChange={(event) => updateTimeAtmosphere(index, { line: event.target.value })} /></Field>
                    <div className="flex flex-wrap justify-between gap-2">
                      <SortButtons index={index} length={draft.timeAtmosphere.length} onMove={moveTimeAtmosphere} />
                      <button className={dangerButtonClass} onClick={() => removeTimeAtmosphere(index)}><Trash2 className="size-4" />鍒犻櫎</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section id="admin-lifeFragments" className={`${panelClass} ${isHighlighted("lifeFragments") ? highlightClass : ""}`}>
            <SectionHeader eyebrow="不一定有大事" title="生活片段" count={`${draft.lifeFragments.length} 寮犲皬鍗＄墖`}>
              <button className={`${buttonClass} w-full sm:w-auto`} onClick={addLifeFragment}><ListPlus className="size-4" />新增卡片</button>
            </SectionHeader>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {draft.lifeFragments.map((item, index) => (
                <article key={`${item.time}-${item.place}-${index}`} data-admin-target={`lifeFragments:${index}`} className={`${cardClass} ${isHighlighted("lifeFragments", index) ? highlightClass : ""}`}>
                  <div className="grid gap-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="时间"><input className={inputClass} value={item.time} onChange={(event) => updateLifeFragment(index, { time: event.target.value })} /></Field>
                      <Field label="地点"><input className={inputClass} value={item.place} onChange={(event) => updateLifeFragment(index, { place: event.target.value })} /></Field>
                    </div>
                    <Field label="内容"><textarea className={textareaClass} value={item.text} onChange={(event) => updateLifeFragment(index, { text: event.target.value })} /></Field>
                    <div className="flex flex-wrap justify-between gap-2">
                      <SortButtons index={index} length={draft.lifeFragments.length} onMove={moveLifeFragment} />
                      <button className={dangerButtonClass} onClick={() => removeLifeFragment(index)}><Trash2 className="size-4" />鍒犻櫎鐗囨</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section id="admin-anniversaries" className={`${panelClass} ${isHighlighted("anniversaries") ? highlightClass : ""}`}>
            <SectionHeader eyebrow="重要日子" title="纪念日" count={`${draft.anniversaries.length} 个日期`}>
              <button className={`${buttonClass} w-full sm:w-auto`} onClick={addAnniversary}><Plus className="size-4" />新增纪念日</button>
            </SectionHeader>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {draft.anniversaries.map((item, index) => (
                <article key={`${item.title}-${index}`} data-admin-target={`anniversaries:${index}`} className={`${cardClass} ${isHighlighted("anniversaries", index) ? highlightClass : ""}`}>
                  <div className="grid gap-3">
                    <Field label="名称"><input className={inputClass} value={item.title} onChange={(event) => updateAnniversary(index, { title: event.target.value })} /></Field>
                    <Field label="日期"><input className={inputClass} type="date" value={item.date} onChange={(event) => updateAnniversary(index, { date: event.target.value })} /></Field>
                    <Field label="备注"><textarea className={textareaClass} value={item.note} onChange={(event) => updateAnniversary(index, { note: event.target.value })} /></Field>
                    <div className="flex flex-wrap justify-between gap-2">
                      <SortButtons index={index} length={draft.anniversaries.length} onMove={moveAnniversary} />
                      <button className={dangerButtonClass} onClick={() => removeAnniversary(index)}><Trash2 className="size-4" />鍒犻櫎</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section id="admin-wishes" className={`${panelClass} ${isHighlighted("wishes") ? highlightClass : ""}`}>
	            <SectionHeader eyebrow="以后一起做" title="愿望清单" count={`${draft.wishes.length} 个愿望`}>
              <button className={`${buttonClass} w-full sm:w-auto`} onClick={addWish}><Plus className="size-4" />新增愿望</button>
            </SectionHeader>
            <div className="grid gap-3 md:grid-cols-2">
              {draft.wishes.map((wish, index) => {
                const checked = completedWishes().includes(wish);
                return (
                  <article key={`${wish}-${index}`} data-admin-target={`wishes:${index}`} className={`${cardClass} ${isHighlighted("wishes", index) ? highlightClass : ""}`}>
                    <div className="grid gap-3">
                      <label className="flex items-center gap-3 rounded-2xl bg-[#eef5dc]/58 px-3 py-2 text-sm text-[#315f5a]">
                        <input className="size-5 accent-[#6fb79f]" type="checkbox" checked={checked} onChange={(event) => setWishDone(index, event.target.checked)} />
                        <CheckCircle2 className="size-4" />
                        已完成
                      </label>
                      <Field label="愿望内容"><input className={inputClass} value={wish} onChange={(event) => updateWish(index, event.target.value)} /></Field>
                      <div className="flex flex-wrap justify-between gap-2">
                        <SortButtons index={index} length={draft.wishes.length} onMove={moveWish} />
                        <button className={dangerButtonClass} onClick={() => removeWish(index)}><Trash2 className="size-4" />鍒犻櫎</button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section id="admin-diarySeeds" className={`${panelClass} ${isHighlighted("diarySeeds") ? highlightClass : ""}`}>
            <SectionHeader eyebrow="一句话也可以" title="双人日记" count={`${draft.diarySeeds.length} 条`}>
              <button className={`${buttonClass} w-full sm:w-auto`} onClick={addDiary}><Plus className="size-4" />新增日记</button>
            </SectionHeader>
            <div className="grid gap-4 md:grid-cols-2">
              {draft.diarySeeds.map((entry, index) => (
                <article key={`${entry.date}-${entry.text}-${index}`} data-admin-target={`diarySeeds:${index}`} className={`${cardClass} ${isHighlighted("diarySeeds", index) ? highlightClass : ""}`}>
                  <div className="grid gap-3">
                    <div className="grid gap-3 sm:grid-cols-2">
	                      <Field label="作者">
	                        <select className={inputClass} value={entry.by} onChange={(event) => updateDiary(index, { by: event.target.value })}>
	                          {[draft.couple.leftName, draft.couple.rightName].map((name) => (
	                            <option key={name} value={name}>{name}</option>
	                          ))}
	                        </select>
	                      </Field>
                      <Field label="日期"><input className={inputClass} type="date" value={dotDateToValue(entry.date)} onChange={(event) => updateDiary(index, { date: valueToDotDate(event.target.value) })} /></Field>
                    </div>
                    <Field label="内容"><textarea className={textareaClass} value={entry.text} onChange={(event) => updateDiary(index, { text: event.target.value })} /></Field>
                    <div className="flex flex-wrap justify-between gap-2">
                      <SortButtons index={index} length={draft.diarySeeds.length} onMove={moveDiary} />
                      <button className={dangerButtonClass} onClick={() => removeDiary(index)}><Trash2 className="size-4" />删除日记</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section id="admin-trips" className={`${panelClass} ${isHighlighted("trips") ? highlightClass : ""}`}>
            <SectionHeader eyebrow="城市与回忆" title="城市记录" count={`${draft.trips.length} 座城市`}>
              <button className={`${buttonClass} w-full sm:w-auto`} onClick={addTrip}><Plus className="size-4" />新增城市</button>
            </SectionHeader>
            <div className="grid gap-4 md:grid-cols-2">
              {draft.trips.map((trip, index) => (
                <article key={`${trip.city}-${index}`} data-admin-target={`trips:${index}`} className={`${cardClass} ${isHighlighted("trips", index) ? highlightClass : ""}`}>
                  <div className="grid gap-3">
                    <Field label="城市名字"><input className={inputClass} value={trip.city} onChange={(event) => updateTrip(index, { city: event.target.value })} /></Field>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="地图横向位置"><input className={inputClass} type="number" min={0} max={100} value={trip.x} onChange={(event) => updateTrip(index, { x: Number(event.target.value) })} /></Field>
                      <Field label="地图纵向位置"><input className={inputClass} type="number" min={0} max={100} value={trip.y} onChange={(event) => updateTrip(index, { y: Number(event.target.value) })} /></Field>
                    </div>
                    <Field label="这座城市的记忆"><textarea className={textareaClass} value={trip.caption} onChange={(event) => updateTrip(index, { caption: event.target.value })} /></Field>
                    <div className="flex flex-wrap justify-between gap-2">
                      <SortButtons index={index} length={draft.trips.length} onMove={moveTrip} />
                      <button className={dangerButtonClass} onClick={() => removeTrip(index)}><Trash2 className="size-4" />删除城市</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section id="admin-basic" className={panelClass}>
            <SectionHeader eyebrow="偶尔才需要改" title="基础设置" count="首页、音乐、导航" />
            <div className="grid gap-5 lg:grid-cols-2">
              <div className={cardClass}>
                <h3 className="mb-4 flex items-center gap-2 text-lg text-[#244d49]"><Home className="size-5" />首页与私密页</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="左侧姓名"><input className={inputClass} value={draft.couple.leftName} onChange={(event) => updateCouple("leftName", event.target.value)} /></Field>
                  <Field label="右侧姓名"><input className={inputClass} value={draft.couple.rightName} onChange={(event) => updateCouple("rightName", event.target.value)} /></Field>
                  <Field label="恋爱开始日期"><input className={inputClass} type="date" value={draft.couple.startDate} onChange={(event) => updateCouple("startDate", event.target.value)} /></Field>
                  <Field label="设置新访问密码">
                    <div className="grid gap-2">
                      <input
                        className={inputClass}
                        type="password"
                        autoComplete="new-password"
                        value={passwordInput}
                        placeholder="留空则不修改"
                        onChange={(event) => {
                          setPasswordInput(event.target.value);
                          setPasswordNotice("");
                        }}
                      />
                      <button className={`${ghostButtonClass} w-fit`} disabled={passwordBusy || !passwordInput.trim()} onClick={() => void updateAccessPassword()}>
                        {passwordBusy ? "正在更新..." : "更新访问密码"}
                      </button>
                      {passwordNotice && <p className="text-sm leading-6 text-[#315f5a]/70">{passwordNotice}</p>}
                    </div>
                  </Field>
                  <Field label="首页标题"><input className={inputClass} value={draft.couple.heroLine} onChange={(event) => updateCouple("heroLine", event.target.value)} /></Field>
                  <Field label="首页副标题"><textarea className={textareaClass} value={draft.couple.subLine} onChange={(event) => updateCouple("subLine", event.target.value)} /></Field>
                  <label className={`${ghostButtonClass} w-full cursor-pointer sm:col-span-2`}>
                    <Camera className="size-4" />
                    上传首页背景图
                    <input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => void uploadHero(event)} />
                  </label>
                </div>
                <div className="mt-5 grid gap-3" data-admin-target="basic:section">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm text-[#315f5a]/70">首页三条摘要</p>
	                    <button className={ghostButtonClass} onClick={addHeroNote}><Plus className="size-4" />新增一句</button>
                  </div>
                  {draft.couple.heroNotes.map((note, index) => (
                    <div key={`${note}-${index}`} className="rounded-2xl border border-[#9dbbab]/16 bg-white/46 p-3" data-admin-target={`basic:heroNote-${index}`}>
                      <Field label={`鎽樿 ${index + 1}`}>
                        <textarea className={`${textareaClass} min-h-20`} value={note} onChange={(event) => updateHeroNote(index, event.target.value)} />
                      </Field>
                      <div className="mt-3 flex flex-wrap justify-between gap-2">
                        <SortButtons index={index} length={draft.couple.heroNotes.length} onMove={moveHeroNote} />
                        <button className={dangerButtonClass} onClick={() => removeHeroNote(index)}><Trash2 className="size-4" />鍒犻櫎</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={cardClass}>
	                <h3 className="mb-4 flex items-center gap-2 text-lg text-[#244d49]"><Music2 className="size-5" />音乐与导航</h3>
                <div className="grid gap-3">
                  <Field label="音乐名字"><input className={inputClass} value={draft.siteText.player.title} onChange={(event) => updatePlayer("title", event.target.value)} /></Field>
                  <label className={`${ghostButtonClass} w-full cursor-pointer`}>
                    <Music2 className="size-4" />
                    上传音乐
                    <input className="sr-only" type="file" accept="audio/*" onChange={(event) => void uploadMusic(event)} />
                  </label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {draft.siteText.navigation.map((item, index) => (
                      <Field key={item.href} label={item.href}>
                        <input className={inputClass} value={item.label} onChange={(event) => updateNavigation(index, event.target.value)} />
                      </Field>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function SectionHeader({
  eyebrow,
  title,
  count,
  children
}: {
  eyebrow: string;
  title: string;
  count?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-sm text-[#6f9284]">{eyebrow}</p>
        <div className="mt-1 flex flex-wrap items-end gap-3">
          <h2 className="cinema-title text-3xl leading-tight text-[#244d49] sm:text-4xl">{title}</h2>
          {count && <p className="pb-1 text-sm text-[#315f5a]/46">{count}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      {children}
    </label>
  );
}

function SortButtons({
  index,
  length,
  onMove
}: {
  index: number;
  length: number;
  onMove: (index: number, direction: -1 | 1) => void;
}) {
  return (
    <div className="flex gap-2">
      <button className={ghostButtonClass} disabled={index === 0} onClick={() => onMove(index, -1)}>
        <ArrowUp className="size-4" />
        上移
      </button>
      <button className={ghostButtonClass} disabled={index === length - 1} onClick={() => onMove(index, 1)}>
        <ArrowDown className="size-4" />
        下移
      </button>
    </div>
  );
}


