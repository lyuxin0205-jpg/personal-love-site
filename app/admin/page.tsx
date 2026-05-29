"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { SiteContent, useContent } from "@/lib/content-store";

const inputClass = "w-full border border-[#9dbbab]/28 bg-white/68 px-3 py-2 text-[16px] text-[#244d49] outline-none transition focus:border-[#6fb79f]/70";
const textareaClass = `${inputClass} min-h-24 resize-y leading-7`;
const labelClass = "mb-1 block text-xs text-[#6f9284]";
const panelClass = "border border-[#9dbbab]/22 bg-[#fffdf1]/72 p-5 shadow-[0_16px_42px_rgba(37,73,67,.06)] sm:p-6";
const buttonClass = "rounded-full bg-[#6fb79f] px-4 py-2 text-sm text-white transition hover:bg-[#5da98f]";
const ghostButtonClass = "rounded-full border border-[#8fb5a3]/28 px-4 py-2 text-sm text-[#315f5a] transition hover:bg-white/70";
const dangerButtonClass = "rounded-full border border-rose/24 px-4 py-2 text-sm text-rose transition hover:bg-rose/8";
const highlightClass = "ring-2 ring-[#6fb79f]/48 shadow-[0_18px_48px_rgba(37,73,67,.11)]";

function cloneContent(content: SiteContent): SiteContent {
  return JSON.parse(JSON.stringify(content));
}

function monthToValue(value: string) {
  return value.replace(".", "-");
}

function valueToMonth(value: string) {
  return value.replace("-", ".");
}

function newSlug(title = "新的故事") {
  const base = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/gi, "-")
    .replace(/^-|-$/g, "");
  return `${base || "story"}-${Date.now()}`;
}

export default function AdminPage() {
  const { content, updateContent, resetContent, storageKey, status, saveError, lastSavedAt, isRemote, uploadFile, refreshContent } = useContent();
  const [draft, setDraft] = useState<SiteContent>(() => cloneContent(content));
  const [uploadError, setUploadError] = useState("");
  const [highlightTarget, setHighlightTarget] = useState("");
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
    const params = new URLSearchParams(window.location.search);
    const section = params.get("section");
    if (!section) return;

    const item = params.get("item");
    const target = item ? `${section}:${item}` : `${section}:section`;
    setHighlightTarget(target);

    window.setTimeout(() => {
      const element = item
        ? document.querySelector(`[data-admin-target="${target}"]`)
        : document.getElementById(`admin-${section}`);
      element?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 320);

    const timer = window.setTimeout(() => setHighlightTarget(""), 5200);
    return () => window.clearTimeout(timer);
  }, []);

  function isHighlighted(section: string, item?: string | number) {
    return highlightTarget === `${section}:${item ?? "section"}`;
  }

  function scheduleSave(next: SiteContent) {
    editingRef.current = true;
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      updateContent(() => next);
      editingRef.current = false;
    }, 700);
  }

  function updateDraft(updater: (current: SiteContent) => SiteContent) {
    setDraft((current) => {
      const next = updater(cloneContent(current));
      scheduleSave(next);
      return next;
    });
  }

  function updateCouple(field: keyof SiteContent["couple"], value: string) {
    updateDraft((current) => ({ ...current, couple: { ...current.couple, [field]: value } }));
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

  function updateSection(section: keyof SiteContent["siteText"]["sections"], field: "eyebrow" | "title", value: string) {
    updateDraft((current) => ({
      ...current,
      siteText: {
        ...current.siteText,
        sections: {
          ...current.siteText.sections,
          [section]: { ...current.siteText.sections[section], [field]: value }
        }
      }
    }));
  }

  async function uploadFromInput(event: ChangeEvent<HTMLInputElement>, folder: "images" | "audio") {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return "";

    try {
      setUploadError("");
      return await uploadFile(file, folder);
    } catch (error) {
      const message = error instanceof Error ? error.message : "上传失败";
      setUploadError(message);
      return "";
    }
  }

  async function uploadHero(event: ChangeEvent<HTMLInputElement>) {
    const url = await uploadFromInput(event, "images");
    if (url) updateCouple("backgroundImage", url);
  }

  async function uploadMusic(event: ChangeEvent<HTMLInputElement>) {
    const url = await uploadFromInput(event, "audio");
    if (url) updatePlayer("src", url);
  }

  async function addPhotoFromUpload(event: ChangeEvent<HTMLInputElement>) {
    const url = await uploadFromInput(event, "images");
    if (!url) return;
    updateDraft((current) => ({
      ...current,
      photos: [
        {
          src: url,
          title: "新照片",
          date: new Date().toISOString().slice(0, 7).replace("-", "."),
          place: "还没写地点",
          note: "写下这张照片背后的瞬间。",
          ratio: "3/4",
          live: false
        },
        ...current.photos
      ]
    }));
  }

  async function replacePhotoImage(event: ChangeEvent<HTMLInputElement>, index: number) {
    const url = await uploadFromInput(event, "images");
    if (!url) return;
    updateDraft((current) => {
      current.photos[index] = { ...current.photos[index], src: url };
      return current;
    });
  }

  function updatePhoto(index: number, patch: Partial<SiteContent["photos"][number]>) {
    updateDraft((current) => {
      current.photos[index] = { ...current.photos[index], ...patch };
      return current;
    });
  }

  function removePhoto(index: number) {
    updateDraft((current) => ({ ...current, photos: current.photos.filter((_, itemIndex) => itemIndex !== index) }));
  }

  function addStory() {
    updateDraft((current) => ({
      ...current,
      story: [
        {
          slug: newSlug(),
          date: new Date().toISOString().slice(0, 7).replace("-", "."),
          city: "新的城市",
          time: "傍晚",
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

  async function replaceStoryImage(event: ChangeEvent<HTMLInputElement>, index: number) {
    const url = await uploadFromInput(event, "images");
    if (!url) return;
    updateStory(index, { image: url });
  }

  function removeStory(index: number) {
    updateDraft((current) => ({ ...current, story: current.story.filter((_, itemIndex) => itemIndex !== index) }));
  }

  function addDiary() {
    updateDraft((current) => ({
      ...current,
      diarySeeds: [
        {
          by: current.siteText.diary.authors[0],
          text: "写下一句今天发生的小事。",
          date: new Date().toLocaleDateString("zh-CN")
        },
        ...current.diarySeeds
      ]
    }));
  }

  function updateDiary(index: number, patch: Partial<SiteContent["diarySeeds"][number]>) {
    updateDraft((current) => {
      current.diarySeeds[index] = { ...current.diarySeeds[index], ...patch };
      return current;
    });
  }

  function removeDiary(index: number) {
    updateDraft((current) => ({ ...current, diarySeeds: current.diarySeeds.filter((_, itemIndex) => itemIndex !== index) }));
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
    updateDraft((current) => ({ ...current, trips: current.trips.filter((_, itemIndex) => itemIndex !== index) }));
  }

  function addAnniversary() {
    updateDraft((current) => ({
      ...current,
      anniversaries: [{ title: "新的纪念日", date: new Date().toISOString().slice(0, 10), note: "写下这一天为什么重要。" }, ...current.anniversaries]
    }));
  }

  function updateAnniversary(index: number, patch: Partial<SiteContent["anniversaries"][number]>) {
    updateDraft((current) => {
      current.anniversaries[index] = { ...current.anniversaries[index], ...patch };
      return current;
    });
  }

  function removeAnniversary(index: number) {
    updateDraft((current) => ({ ...current, anniversaries: current.anniversaries.filter((_, itemIndex) => itemIndex !== index) }));
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

  function removeWish(index: number) {
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

  async function syncRemote() {
    editingRef.current = false;
    await refreshContent();
  }

  function restoreDefaults() {
    editingRef.current = false;
    resetContent();
  }

  return (
    <main className="min-h-screen bg-ink px-4 py-7 text-[#244d49] sm:px-8 lg:px-14">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-4 border-b border-[#9dbbab]/24 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-[#6f9284]">{isRemote ? "Supabase 云端内容" : storageKey}</p>
            <h1 className="cinema-title mt-2 text-4xl leading-tight sm:text-5xl">内容管理</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#315f5a]/64">
              这里不需要写代码，修改文字、选择照片后会自动保存。
              {status === "saving" && " 正在保存..."}
              {lastSavedAt && status === "ready" && ` 已保存 ${lastSavedAt}`}
            </p>
            {(saveError || uploadError) && <p className="mt-3 max-w-2xl text-sm leading-7 text-rose">{saveError || uploadError}</p>}
          </div>
          <div className="flex flex-wrap gap-3">
            <a href="/" className={ghostButtonClass}>回到前台</a>
            <button onClick={() => void syncRemote()} className={ghostButtonClass}>同步云端</button>
            <button onClick={restoreDefaults} className={ghostButtonClass}>恢复占位数据</button>
          </div>
        </header>

        <div className="grid gap-6">
          <section className={panelClass}>
            <h2 className="cinema-title mb-5 text-3xl">首页与私密页</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <label><span className={labelClass}>左侧姓名</span><input className={inputClass} value={draft.couple.leftName} onChange={(event) => updateCouple("leftName", event.target.value)} /></label>
              <label><span className={labelClass}>右侧姓名</span><input className={inputClass} value={draft.couple.rightName} onChange={(event) => updateCouple("rightName", event.target.value)} /></label>
              <label><span className={labelClass}>恋爱开始日期</span><input className={inputClass} type="date" value={draft.couple.startDate} onChange={(event) => updateCouple("startDate", event.target.value)} /></label>
              <label><span className={labelClass}>私密页密码</span><input className={inputClass} value={draft.couple.password} onChange={(event) => updateCouple("password", event.target.value)} /></label>
              <label><span className={labelClass}>首页标题</span><input className={inputClass} value={draft.couple.heroLine} onChange={(event) => updateCouple("heroLine", event.target.value)} /></label>
              <label className="sm:col-span-2"><span className={labelClass}>首页副标题</span><textarea className={textareaClass} value={draft.couple.subLine} onChange={(event) => updateCouple("subLine", event.target.value)} /></label>
              <label><span className={labelClass}>首页背景图 URL</span><input className={inputClass} value={draft.couple.backgroundImage} onChange={(event) => updateCouple("backgroundImage", event.target.value)} /></label>
              <label><span className={labelClass}>上传首页背景图</span><input className={inputClass} type="file" accept="image/*" onChange={(event) => void uploadHero(event)} /></label>
            </div>
          </section>

          <section className={panelClass}>
            <h2 className="cinema-title mb-5 text-3xl">音乐</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <label><span className={labelClass}>曲名</span><input className={inputClass} value={draft.siteText.player.title} onChange={(event) => updatePlayer("title", event.target.value)} /></label>
              <label><span className={labelClass}>音乐 URL</span><input className={inputClass} value={draft.siteText.player.src} onChange={(event) => updatePlayer("src", event.target.value)} /></label>
              <label className="sm:col-span-2"><span className={labelClass}>上传音乐</span><input className={inputClass} type="file" accept="audio/*" onChange={(event) => void uploadMusic(event)} /></label>
            </div>
          </section>

          <section className={panelClass}>
            <h2 className="cinema-title mb-5 text-3xl">导航</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {draft.siteText.navigation.map((item, index) => (
                <label key={item.href}>
                  <span className={labelClass}>{item.href}</span>
                  <input className={inputClass} value={item.label} onChange={(event) => updateNavigation(index, event.target.value)} />
                </label>
              ))}
            </div>
          </section>

          <section className={panelClass}>
            <h2 className="cinema-title mb-5 text-3xl">页面标题</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {(Object.keys(draft.siteText.sections) as Array<keyof SiteContent["siteText"]["sections"]>).map((section) => (
                <article key={section} className="border-t border-[#9dbbab]/20 pt-4">
                  <p className="mb-3 text-xs text-[#6f9284]">{section}</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label><span className={labelClass}>小标题</span><input className={inputClass} value={draft.siteText.sections[section].eyebrow} onChange={(event) => updateSection(section, "eyebrow", event.target.value)} /></label>
                    <label><span className={labelClass}>标题</span><input className={inputClass} value={draft.siteText.sections[section].title} onChange={(event) => updateSection(section, "title", event.target.value)} /></label>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section id="admin-photos" className={`${panelClass} ${isHighlighted("photos") ? highlightClass : ""}`}>
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="cinema-title text-3xl">相册</h2>
              <label className={`${buttonClass} inline-flex w-fit cursor-pointer items-center justify-center`}>
                上传照片
                <input className="sr-only" type="file" accept="image/*" onChange={(event) => void addPhotoFromUpload(event)} />
              </label>
            </div>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {draft.photos.map((photo, index) => (
                <article
                  key={`${photo.src}-${index}`}
                  data-admin-target={`photos:${index}`}
                  className={`border border-[#9dbbab]/18 bg-white/50 p-3 transition duration-700 ${isHighlighted("photos", index) ? highlightClass : ""}`}
                >
                  <Image src={photo.src} alt={photo.title} width={720} height={540} unoptimized className="mb-4 aspect-[4/3] w-full bg-[#e4f4f0] object-cover" />
                  <div className="grid gap-3">
                    <label><span className={labelClass}>更换照片</span><input className={inputClass} type="file" accept="image/*" onChange={(event) => void replacePhotoImage(event, index)} /></label>
                    <label><span className={labelClass}>标题</span><input className={inputClass} value={photo.title} onChange={(event) => updatePhoto(index, { title: event.target.value })} /></label>
                    <label><span className={labelClass}>日期</span><input className={inputClass} type="month" value={monthToValue(photo.date)} onChange={(event) => updatePhoto(index, { date: valueToMonth(event.target.value) })} /></label>
                    <label><span className={labelClass}>地点</span><input className={inputClass} value={photo.place} onChange={(event) => updatePhoto(index, { place: event.target.value })} /></label>
                    <label><span className={labelClass}>备注</span><textarea className={textareaClass} value={photo.note} onChange={(event) => updatePhoto(index, { note: event.target.value })} /></label>
                    <button className={dangerButtonClass} onClick={() => removePhoto(index)}>删除照片</button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section id="admin-story" className={`${panelClass} ${isHighlighted("story") ? highlightClass : ""}`}>
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="cinema-title text-3xl">故事</h2>
              <button className={buttonClass} onClick={addStory}>新增故事</button>
            </div>
            <div className="grid gap-5">
              {draft.story.map((item, index) => (
                <article
                  key={`${item.slug}-${index}`}
                  data-admin-target={`story:${item.slug}`}
                  className={`grid gap-4 border border-[#9dbbab]/18 bg-white/48 p-3 transition duration-700 lg:grid-cols-[260px_1fr] ${isHighlighted("story", item.slug) ? highlightClass : ""}`}
                >
                  <div>
                    <Image src={item.image} alt={item.title} width={720} height={540} unoptimized className="aspect-[4/3] w-full bg-[#e4f4f0] object-cover" />
                    <label className="mt-3 block"><span className={labelClass}>上传封面图片</span><input className={inputClass} type="file" accept="image/*" onChange={(event) => void replaceStoryImage(event, index)} /></label>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label><span className={labelClass}>标题</span><input className={inputClass} value={item.title} onChange={(event) => updateStory(index, { title: event.target.value, slug: item.slug || newSlug(event.target.value) })} /></label>
                    <label><span className={labelClass}>日期</span><input className={inputClass} type="month" value={monthToValue(item.date)} onChange={(event) => updateStory(index, { date: valueToMonth(event.target.value) })} /></label>
                    <label><span className={labelClass}>城市</span><input className={inputClass} value={item.city} onChange={(event) => updateStory(index, { city: event.target.value })} /></label>
                    <label><span className={labelClass}>时间</span><input className={inputClass} value={item.time} onChange={(event) => updateStory(index, { time: event.target.value })} /></label>
                    <label className="sm:col-span-2"><span className={labelClass}>地点</span><input className={inputClass} value={item.place} onChange={(event) => updateStory(index, { place: event.target.value })} /></label>
                    <label><span className={labelClass}>天气</span><input className={inputClass} value={item.weather} onChange={(event) => updateStory(index, { weather: event.target.value })} /></label>
                    <label><span className={labelClass}>当时听的歌</span><input className={inputClass} value={item.music} onChange={(event) => updateStory(index, { music: event.target.value })} /></label>
                    <label className="sm:col-span-2"><span className={labelClass}>一句话摘要</span><textarea className={textareaClass} value={item.text} onChange={(event) => updateStory(index, { text: event.target.value })} /></label>
                    <label className="sm:col-span-2"><span className={labelClass}>正文</span><textarea className={`${textareaClass} min-h-36`} value={item.detailText} onChange={(event) => updateStory(index, { detailText: event.target.value })} /></label>
                    <button className={dangerButtonClass} onClick={() => removeStory(index)}>删除故事</button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section id="admin-diarySeeds" className={`${panelClass} ${isHighlighted("diarySeeds") ? highlightClass : ""}`}>
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="cinema-title text-3xl">日记</h2>
              <button className={buttonClass} onClick={addDiary}>新增日记</button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {draft.diarySeeds.map((entry, index) => (
                <article
                  key={`${entry.date}-${entry.text}-${index}`}
                  data-admin-target={`diarySeeds:${index}`}
                  className={`grid gap-3 border border-[#9dbbab]/18 bg-white/48 p-4 transition duration-700 ${isHighlighted("diarySeeds", index) ? highlightClass : ""}`}
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label><span className={labelClass}>作者</span><input className={inputClass} value={entry.by} onChange={(event) => updateDiary(index, { by: event.target.value })} /></label>
                    <label><span className={labelClass}>日期</span><input className={inputClass} value={entry.date} onChange={(event) => updateDiary(index, { date: event.target.value })} /></label>
                  </div>
                  <label><span className={labelClass}>内容</span><textarea className={textareaClass} value={entry.text} onChange={(event) => updateDiary(index, { text: event.target.value })} /></label>
                  <button className={dangerButtonClass} onClick={() => removeDiary(index)}>删除日记</button>
                </article>
              ))}
            </div>
          </section>

          <section id="admin-trips" className={`${panelClass} ${isHighlighted("trips") ? highlightClass : ""}`}>
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="cinema-title text-3xl">城市记录</h2>
              <button className={buttonClass} onClick={addTrip}>新增城市</button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {draft.trips.map((trip, index) => (
                <article
                  key={`${trip.city}-${index}`}
                  data-admin-target={`trips:${index}`}
                  className={`grid gap-3 border border-[#9dbbab]/18 bg-white/48 p-4 transition duration-700 sm:grid-cols-2 ${isHighlighted("trips", index) ? highlightClass : ""}`}
                >
                  <label><span className={labelClass}>城市名字</span><input className={inputClass} value={trip.city} onChange={(event) => updateTrip(index, { city: event.target.value })} /></label>
                  <label><span className={labelClass}>地图横向位置</span><input className={inputClass} type="number" min={0} max={100} value={trip.x} onChange={(event) => updateTrip(index, { x: Number(event.target.value) })} /></label>
                  <label><span className={labelClass}>地图纵向位置</span><input className={inputClass} type="number" min={0} max={100} value={trip.y} onChange={(event) => updateTrip(index, { y: Number(event.target.value) })} /></label>
                  <label className="sm:col-span-2"><span className={labelClass}>这座城市的记忆</span><textarea className={textareaClass} value={trip.caption} onChange={(event) => updateTrip(index, { caption: event.target.value })} /></label>
                  <button className={dangerButtonClass} onClick={() => removeTrip(index)}>删除城市</button>
                </article>
              ))}
            </div>
          </section>

          <section id="admin-anniversaries" className={`${panelClass} ${isHighlighted("anniversaries") ? highlightClass : ""}`}>
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="cinema-title text-3xl">纪念日</h2>
              <button className={buttonClass} onClick={addAnniversary}>新增纪念日</button>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {draft.anniversaries.map((item, index) => (
                <article
                  key={`${item.title}-${index}`}
                  data-admin-target={`anniversaries:${index}`}
                  className={`grid gap-3 border border-[#9dbbab]/18 bg-white/48 p-4 transition duration-700 ${isHighlighted("anniversaries", index) ? highlightClass : ""}`}
                >
                  <label><span className={labelClass}>纪念日名称</span><input className={inputClass} value={item.title} onChange={(event) => updateAnniversary(index, { title: event.target.value })} /></label>
                  <label><span className={labelClass}>日期</span><input className={inputClass} type="date" value={item.date} onChange={(event) => updateAnniversary(index, { date: event.target.value })} /></label>
                  <label><span className={labelClass}>备注</span><textarea className={textareaClass} value={item.note} onChange={(event) => updateAnniversary(index, { note: event.target.value })} /></label>
                  <button className={dangerButtonClass} onClick={() => removeAnniversary(index)}>删除纪念日</button>
                </article>
              ))}
            </div>
          </section>

          <section id="admin-wishes" className={`${panelClass} ${isHighlighted("wishes") ? highlightClass : ""}`}>
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="cinema-title text-3xl">愿望清单</h2>
              <button className={buttonClass} onClick={addWish}>新增愿望</button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {draft.wishes.map((wish, index) => (
                <article
                  key={`${wish}-${index}`}
                  data-admin-target={`wishes:${index}`}
                  className={`grid gap-3 border border-[#9dbbab]/18 bg-white/48 p-4 transition duration-700 ${isHighlighted("wishes", index) ? highlightClass : ""}`}
                >
                  <label><span className={labelClass}>愿望内容</span><input className={inputClass} value={wish} onChange={(event) => updateWish(index, event.target.value)} /></label>
                  <button className={dangerButtonClass} onClick={() => removeWish(index)}>删除愿望</button>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
