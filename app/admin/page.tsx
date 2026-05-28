"use client";

import { ChangeEvent, useState } from "react";
import { SiteContent, useContent } from "@/lib/content-store";

const inputClass = "w-full border border-[#9dbbab]/28 bg-white/68 px-3 py-2 text-sm text-[#244d49] outline-none focus:border-[#6fb79f]/70";
const labelClass = "mb-1 block text-xs text-[#6f9284]";
const panelClass = "border border-[#9dbbab]/22 bg-[#fffdf1]/68 p-5 shadow-[0_16px_42px_rgba(37,73,67,.06)]";
const buttonClass = "rounded-full bg-[#6fb79f] px-4 py-2 text-sm text-white transition hover:bg-[#5da98f]";
const ghostButtonClass = "rounded-full border border-[#8fb5a3]/28 px-4 py-2 text-sm text-[#315f5a] transition hover:bg-white/70";

type JsonKey = "story" | "photos" | "diarySeeds" | "trips" | "anniversaries" | "wishes";

function cloneContent(content: SiteContent): SiteContent {
  return JSON.parse(JSON.stringify(content));
}

function safeJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

export default function AdminPage() {
  const { content, updateContent, resetContent, storageKey, status, saveError, lastSavedAt, isRemote, uploadFile, refreshContent } = useContent();
  const [jsonDrafts, setJsonDrafts] = useState<Record<string, string>>({});
  const [jsonError, setJsonError] = useState("");

  function updateCouple(field: keyof SiteContent["couple"], value: string) {
    updateContent((current) => ({ ...current, couple: { ...current.couple, [field]: value } }));
  }

  function updatePlayer(field: keyof SiteContent["siteText"]["player"], value: string) {
    updateContent((current) => ({
      ...current,
      siteText: { ...current.siteText, player: { ...current.siteText.player, [field]: value } }
    }));
  }

  function updateNavigation(index: number, label: string) {
    updateContent((current) => {
      const next = cloneContent(current);
      next.siteText.navigation[index] = { ...next.siteText.navigation[index], label };
      return next;
    });
  }

  function updateSection(section: keyof SiteContent["siteText"]["sections"], field: "eyebrow" | "title", value: string) {
    updateContent((current) => ({
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

  async function handleUpload(event: ChangeEvent<HTMLInputElement>, folder: "images" | "audio", onDone: (url: string) => void) {
    const file = event.target.files?.[0];
    if (!file) return;
    const url = await uploadFile(file, folder);
    onDone(url);
  }

  function jsonValue(key: JsonKey) {
    return jsonDrafts[key] ?? safeJson(content[key]);
  }

  function updateJson(key: JsonKey, value: string) {
    setJsonDrafts((current) => ({ ...current, [key]: value }));
  }

  function applyJson(key: JsonKey) {
    try {
      const parsed = JSON.parse(jsonValue(key));
      updateContent((current) => ({ ...current, [key]: parsed }));
      setJsonError("");
    } catch {
      setJsonError("JSON 格式不对，先检查逗号、引号和括号。");
    }
  }

  return (
    <main className="min-h-screen bg-ink px-5 py-8 text-[#244d49] sm:px-8 lg:px-14">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-4 border-b border-[#9dbbab]/24 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-[#6f9284]">{isRemote ? "Supabase 云端内容" : storageKey}</p>
            <h1 className="cinema-title mt-2 text-4xl leading-tight sm:text-5xl">内容管理</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#315f5a]/64">
              {isRemote ? "保存后会同步到 Supabase，其他设备刷新后能看到最新内容。" : "当前未配置 Supabase 环境变量，会显示默认占位内容。"}
              {status === "saving" && " 正在保存..."}
              {lastSavedAt && status === "ready" && ` 已保存 ${lastSavedAt}`}
            </p>
            {(saveError || jsonError) && <p className="mt-3 max-w-2xl text-sm leading-7 text-rose">{saveError || jsonError}</p>}
          </div>
          <div className="flex flex-wrap gap-3">
            <a href="/" className={ghostButtonClass}>回到前台</a>
            <button onClick={() => void refreshContent()} className={ghostButtonClass}>同步云端</button>
            <button onClick={resetContent} className={ghostButtonClass}>恢复占位数据</button>
          </div>
        </header>

        <div className="grid gap-6">
          <section className={panelClass}>
            <h2 className="cinema-title mb-5 text-3xl">首页与私密页</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <label><span className={labelClass}>左侧姓名</span><input className={inputClass} value={content.couple.leftName} onChange={(event) => updateCouple("leftName", event.target.value)} /></label>
              <label><span className={labelClass}>右侧姓名</span><input className={inputClass} value={content.couple.rightName} onChange={(event) => updateCouple("rightName", event.target.value)} /></label>
              <label><span className={labelClass}>恋爱开始日期</span><input className={inputClass} value={content.couple.startDate} onChange={(event) => updateCouple("startDate", event.target.value)} /></label>
              <label><span className={labelClass}>私密页密码</span><input className={inputClass} value={content.couple.password} onChange={(event) => updateCouple("password", event.target.value)} /></label>
              <label><span className={labelClass}>首页标题</span><input className={inputClass} value={content.couple.heroLine} onChange={(event) => updateCouple("heroLine", event.target.value)} /></label>
              <label className="sm:col-span-2"><span className={labelClass}>首页副标题</span><textarea className={`${inputClass} min-h-24 resize-y`} value={content.couple.subLine} onChange={(event) => updateCouple("subLine", event.target.value)} /></label>
              <label><span className={labelClass}>首页背景图 URL</span><input className={inputClass} value={content.couple.backgroundImage} onChange={(event) => updateCouple("backgroundImage", event.target.value)} /></label>
              <label><span className={labelClass}>上传首页背景图</span><input className={inputClass} type="file" accept="image/*" onChange={(event) => void handleUpload(event, "images", (url) => updateCouple("backgroundImage", url))} /></label>
            </div>
          </section>

          <section className={panelClass}>
            <h2 className="cinema-title mb-5 text-3xl">音乐</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <label><span className={labelClass}>曲名</span><input className={inputClass} value={content.siteText.player.title} onChange={(event) => updatePlayer("title", event.target.value)} /></label>
              <label><span className={labelClass}>音乐 URL</span><input className={inputClass} value={content.siteText.player.src} onChange={(event) => updatePlayer("src", event.target.value)} /></label>
              <label className="sm:col-span-2"><span className={labelClass}>上传音乐</span><input className={inputClass} type="file" accept="audio/*" onChange={(event) => void handleUpload(event, "audio", (url) => updatePlayer("src", url))} /></label>
            </div>
          </section>

          <section className={panelClass}>
            <h2 className="cinema-title mb-5 text-3xl">导航</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {content.siteText.navigation.map((item, index) => (
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
              {(Object.keys(content.siteText.sections) as Array<keyof SiteContent["siteText"]["sections"]>).map((section) => (
                <article key={section} className="border-t border-[#9dbbab]/20 pt-4">
                  <p className="mb-3 text-xs text-[#6f9284]">{section}</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label><span className={labelClass}>小标题</span><input className={inputClass} value={content.siteText.sections[section].eyebrow} onChange={(event) => updateSection(section, "eyebrow", event.target.value)} /></label>
                    <label><span className={labelClass}>标题</span><input className={inputClass} value={content.siteText.sections[section].title} onChange={(event) => updateSection(section, "title", event.target.value)} /></label>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {([
            ["story", "故事"],
            ["photos", "相册"],
            ["diarySeeds", "日记"],
            ["trips", "城市记录"],
            ["anniversaries", "纪念日"],
            ["wishes", "愿望清单"]
          ] as Array<[JsonKey, string]>).map(([key, title]) => (
            <section key={key} className={panelClass}>
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="cinema-title text-3xl">{title}</h2>
                <button className={buttonClass} onClick={() => applyJson(key)}>保存这组内容</button>
              </div>
              <p className="mb-3 text-sm leading-7 text-[#315f5a]/58">这里支持新增、删除和排序。保持 JSON 数组格式即可，修改后点击保存这组内容。</p>
              <textarea className={`${inputClass} min-h-[260px] resize-y font-mono text-xs leading-6`} value={jsonValue(key)} onChange={(event) => updateJson(key, event.target.value)} spellCheck={false} />
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
