"use client";

import Image from "next/image";
import { ChangeEvent } from "react";
import { SiteContent, useContent } from "@/lib/content-store";

type StoryItem = SiteContent["story"][number];
type PhotoItem = SiteContent["photos"][number];
type AnniversaryItem = SiteContent["anniversaries"][number];
type TripItem = SiteContent["trips"][number];
type DiaryItem = SiteContent["diarySeeds"][number];
type SectionKey = keyof SiteContent["siteText"]["sections"];

const inputClass = "w-full border border-[#9dbbab]/28 bg-white/68 px-3 py-2 text-sm text-[#244d49] outline-none focus:border-[#6fb79f]/70";
const labelClass = "mb-1 block text-xs text-[#6f9284]";
const panelClass = "border border-[#9dbbab]/22 bg-[#fffdf1]/68 p-5 shadow-[0_16px_42px_rgba(37,73,67,.06)]";
const buttonClass = "rounded-full bg-[#6fb79f] px-4 py-2 text-sm text-white transition hover:bg-[#5da98f]";
const ghostButtonClass = "rounded-full border border-[#8fb5a3]/28 px-4 py-2 text-sm text-[#315f5a] transition hover:bg-white/70";

function cloneContent(content: SiteContent): SiteContent {
  return JSON.parse(JSON.stringify(content));
}

function readFile(event: ChangeEvent<HTMLInputElement>, onLoad: (value: string) => void) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => onLoad(String(reader.result));
  reader.readAsDataURL(file);
}

function makeSlug() {
  return `story-${Date.now()}`;
}

export default function AdminPage() {
  const { content, updateContent, resetContent, storageKey } = useContent();

  function updateCouple(field: keyof SiteContent["couple"], value: string) {
    updateContent((current) => ({ ...current, couple: { ...current.couple, [field]: value } }));
  }

  function updatePlayer(field: keyof SiteContent["siteText"]["player"], value: string) {
    updateContent((current) => ({
      ...current,
      siteText: { ...current.siteText, player: { ...current.siteText.player, [field]: value } }
    }));
  }

  function updateStory(index: number, patch: Partial<StoryItem>) {
    updateContent((current) => {
      const next = cloneContent(current);
      next.story[index] = { ...next.story[index], ...patch };
      return next;
    });
  }

  function updatePhoto(index: number, patch: Partial<PhotoItem>) {
    updateContent((current) => {
      const next = cloneContent(current);
      next.photos[index] = { ...next.photos[index], ...patch };
      return next;
    });
  }

  function updateAnniversary(index: number, patch: Partial<AnniversaryItem>) {
    updateContent((current) => {
      const next = cloneContent(current);
      next.anniversaries[index] = { ...next.anniversaries[index], ...patch };
      return next;
    });
  }

  function updateTrip(index: number, patch: Partial<TripItem>) {
    updateContent((current) => {
      const next = cloneContent(current);
      next.trips[index] = { ...next.trips[index], ...patch };
      return next;
    });
  }

  function updateHeroNote(index: number, value: string) {
    updateContent((current) => {
      const next = cloneContent(current);
      next.couple.heroNotes[index] = value;
      return next;
    });
  }

  function updateNavigation(index: number, label: string) {
    updateContent((current) => {
      const next = cloneContent(current);
      next.siteText.navigation[index] = { ...next.siteText.navigation[index], label };
      return next;
    });
  }

  function updateSectionText(section: SectionKey, field: "eyebrow" | "title", value: string) {
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

  function updateDiaryAuthor(index: number, value: string) {
    updateContent((current) => {
      const next = cloneContent(current);
      next.siteText.diary.authors[index] = value;
      return next;
    });
  }

  function updateDiarySeed(index: number, patch: Partial<DiaryItem>) {
    updateContent((current) => {
      const next = cloneContent(current);
      next.diarySeeds[index] = { ...next.diarySeeds[index], ...patch };
      return next;
    });
  }

  return (
    <main className="min-h-screen bg-ink px-5 py-8 text-[#244d49] sm:px-8 lg:px-14">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-4 border-b border-[#9dbbab]/24 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-[#6f9284]">{storageKey}</p>
            <h1 className="cinema-title mt-2 text-4xl leading-tight sm:text-5xl">内容管理</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#315f5a]/64">当前是本地版本，修改会保存在这个浏览器里。后续接数据库时，前台结构不用大改。</p>
          </div>
          <div className="flex gap-3">
            <a href="/" className={ghostButtonClass}>回到前台</a>
            <button onClick={resetContent} className={ghostButtonClass}>恢复占位数据</button>
          </div>
        </header>

        <div className="grid gap-6">
          <section className={panelClass}>
            <h2 className="cinema-title mb-5 text-3xl">首页文案</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <label><span className={labelClass}>左侧姓名</span><input className={inputClass} value={content.couple.leftName} onChange={(event) => updateCouple("leftName", event.target.value)} /></label>
              <label><span className={labelClass}>右侧姓名</span><input className={inputClass} value={content.couple.rightName} onChange={(event) => updateCouple("rightName", event.target.value)} /></label>
              <label><span className={labelClass}>恋爱开始日期</span><input className={inputClass} value={content.couple.startDate} onChange={(event) => updateCouple("startDate", event.target.value)} /></label>
              <label><span className={labelClass}>首页标题</span><input className={inputClass} value={content.couple.heroLine} onChange={(event) => updateCouple("heroLine", event.target.value)} /></label>
              <label className="sm:col-span-2"><span className={labelClass}>首页文案</span><textarea className={`${inputClass} min-h-24 resize-y`} value={content.couple.subLine} onChange={(event) => updateCouple("subLine", event.target.value)} /></label>
              <label className="sm:col-span-2">
                <span className={labelClass}>首页背景图</span>
                <input className={inputClass} type="file" accept="image/*" onChange={(event) => readFile(event, (value) => updateCouple("backgroundImage", value))} />
              </label>
              <div className="sm:col-span-2">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className={labelClass}>首页生活小纸条</span>
                  <button className={ghostButtonClass} onClick={() => updateContent((current) => ({ ...current, couple: { ...current.couple, heroNotes: [...current.couple.heroNotes, "写一条新的生活小纸条。"] } }))}>新增小纸条</button>
                </div>
                <div className="grid gap-3">
                  {content.couple.heroNotes.map((note, index) => (
                    <div key={`${note}-${index}`} className="grid gap-2 sm:grid-cols-[1fr_auto]">
                      <input className={inputClass} value={note} onChange={(event) => updateHeroNote(index, event.target.value)} />
                      <button className={ghostButtonClass} onClick={() => updateContent((current) => ({ ...current, couple: { ...current.couple, heroNotes: current.couple.heroNotes.filter((_, itemIndex) => itemIndex !== index) } }))}>删除</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className={panelClass}>
            <h2 className="cinema-title mb-5 text-3xl">导航与板块文案</h2>
            <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {content.siteText.navigation.map((item, index) => (
                <label key={item.href}>
                  <span className={labelClass}>{item.href}</span>
                  <input className={inputClass} value={item.label} onChange={(event) => updateNavigation(index, event.target.value)} />
                </label>
              ))}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {(Object.keys(content.siteText.sections) as SectionKey[]).map((section) => (
                <article key={section} className="border-t border-[#9dbbab]/20 pt-4">
                  <p className="mb-3 text-xs text-[#6f9284]">{section}</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label><span className={labelClass}>小标题</span><input className={inputClass} value={content.siteText.sections[section].eyebrow} onChange={(event) => updateSectionText(section, "eyebrow", event.target.value)} /></label>
                    <label><span className={labelClass}>标题</span><input className={inputClass} value={content.siteText.sections[section].title} onChange={(event) => updateSectionText(section, "title", event.target.value)} /></label>
                  </div>
                </article>
              ))}
            </div>
            <div className="mt-6 grid gap-4 border-t border-[#9dbbab]/20 pt-5 sm:grid-cols-2">
              <label><span className={labelClass}>返回首页文字</span><input className={inputClass} value={content.siteText.contentPages.homeLabel} onChange={(event) => updateContent((current) => ({ ...current, siteText: { ...current.siteText, contentPages: { ...current.siteText.contentPages, homeLabel: event.target.value } } }))} /></label>
              <label><span className={labelClass}>故事页简介</span><input className={inputClass} value={content.siteText.contentPages.storiesIntro} onChange={(event) => updateContent((current) => ({ ...current, siteText: { ...current.siteText, contentPages: { ...current.siteText.contentPages, storiesIntro: event.target.value } } }))} /></label>
              <label><span className={labelClass}>相册页简介</span><input className={inputClass} value={content.siteText.contentPages.albumIntro} onChange={(event) => updateContent((current) => ({ ...current, siteText: { ...current.siteText, contentPages: { ...current.siteText.contentPages, albumIntro: event.target.value } } }))} /></label>
              <label><span className={labelClass}>日记页简介</span><input className={inputClass} value={content.siteText.contentPages.diaryIntro} onChange={(event) => updateContent((current) => ({ ...current, siteText: { ...current.siteText, contentPages: { ...current.siteText.contentPages, diaryIntro: event.target.value } } }))} /></label>
              <label className="sm:col-span-2"><span className={labelClass}>城市页简介</span><input className={inputClass} value={content.siteText.contentPages.citiesIntro} onChange={(event) => updateContent((current) => ({ ...current, siteText: { ...current.siteText, contentPages: { ...current.siteText.contentPages, citiesIntro: event.target.value } } }))} /></label>
            </div>
          </section>

          <section className={panelClass}>
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 className="cinema-title text-3xl">故事</h2>
              <button
                className={buttonClass}
                onClick={() =>
                  updateContent((current) => ({
                    ...current,
                    story: [
                      ...current.story,
                      {
                        slug: makeSlug(),
                        date: "2026.06",
                        city: "新的城市",
                        time: "傍晚",
                        place: "新的地方",
                        weather: "有风",
                        music: current.siteText.player.title,
                        meta: "城市 / 时间 / 天气",
                        title: "新的故事",
                        image: current.story[0]?.image || current.couple.backgroundImage,
                        text: "写一小段摘要。",
                        detailText: "写下更完整的故事。"
                      }
                    ]
                  }))
                }
              >
                新增故事
              </button>
            </div>
            <div className="grid gap-5">
              {content.story.map((item, index) => (
                <article key={item.slug} className="grid gap-4 border-t border-[#9dbbab]/20 pt-5 lg:grid-cols-[220px_1fr]">
                  <div>
                    <Image src={item.image} alt={item.title} width={440} height={320} unoptimized={item.image.startsWith("data:")} className="aspect-[4/3] w-full object-cover" />
                    <input className="mt-3 w-full text-xs" type="file" accept="image/*" onChange={(event) => readFile(event, (value) => updateStory(index, { image: value }))} />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label><span className={labelClass}>标题</span><input className={inputClass} value={item.title} onChange={(event) => updateStory(index, { title: event.target.value })} /></label>
                    <label><span className={labelClass}>路径 slug</span><input className={inputClass} value={item.slug} onChange={(event) => updateStory(index, { slug: event.target.value })} /></label>
                    <label><span className={labelClass}>日期</span><input className={inputClass} value={item.date} onChange={(event) => updateStory(index, { date: event.target.value })} /></label>
                    <label><span className={labelClass}>城市</span><input className={inputClass} value={item.city} onChange={(event) => updateStory(index, { city: event.target.value })} /></label>
                    <label><span className={labelClass}>时间</span><input className={inputClass} value={item.time} onChange={(event) => updateStory(index, { time: event.target.value })} /></label>
                    <label><span className={labelClass}>地点</span><input className={inputClass} value={item.place} onChange={(event) => updateStory(index, { place: event.target.value })} /></label>
                    <label><span className={labelClass}>天气</span><input className={inputClass} value={item.weather} onChange={(event) => updateStory(index, { weather: event.target.value })} /></label>
                    <label><span className={labelClass}>音乐</span><input className={inputClass} value={item.music} onChange={(event) => updateStory(index, { music: event.target.value })} /></label>
                    <label><span className={labelClass}>摘要标签</span><input className={inputClass} value={item.meta} onChange={(event) => updateStory(index, { meta: event.target.value })} /></label>
                    <label className="sm:col-span-2"><span className={labelClass}>摘要</span><textarea className={`${inputClass} min-h-20 resize-y`} value={item.text} onChange={(event) => updateStory(index, { text: event.target.value })} /></label>
                    <label className="sm:col-span-2"><span className={labelClass}>详情文字</span><textarea className={`${inputClass} min-h-32 resize-y`} value={item.detailText} onChange={(event) => updateStory(index, { detailText: event.target.value })} /></label>
                    <button className={`${ghostButtonClass} w-fit`} onClick={() => updateContent((current) => ({ ...current, story: current.story.filter((_, itemIndex) => itemIndex !== index) }))}>删除故事</button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className={panelClass}>
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 className="cinema-title text-3xl">相册</h2>
              <button className={buttonClass} onClick={() => updateContent((current) => ({ ...current, photos: [...current.photos, { src: current.photos[0]?.src || current.couple.backgroundImage, title: "新的照片", date: "2026.06", place: "新的地方", note: "写下照片背后的瞬间。", ratio: "3/4", live: false }] }))}>新增照片</button>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              {content.photos.map((photo, index) => (
                <article key={`${photo.src}-${index}`} className="border-t border-[#9dbbab]/20 pt-5">
                  <Image src={photo.src} alt={photo.title} width={500} height={620} unoptimized={photo.src.startsWith("data:")} className="mb-3 aspect-[4/3] w-full object-cover" />
                  <input className="mb-3 w-full text-xs" type="file" accept="image/*" onChange={(event) => readFile(event, (value) => updatePhoto(index, { src: value }))} />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label><span className={labelClass}>标题</span><input className={inputClass} value={photo.title} onChange={(event) => updatePhoto(index, { title: event.target.value })} /></label>
                    <label><span className={labelClass}>日期</span><input className={inputClass} value={photo.date} onChange={(event) => updatePhoto(index, { date: event.target.value })} /></label>
                    <label><span className={labelClass}>地点</span><input className={inputClass} value={photo.place} onChange={(event) => updatePhoto(index, { place: event.target.value })} /></label>
                    <label><span className={labelClass}>比例</span><input className={inputClass} value={photo.ratio} onChange={(event) => updatePhoto(index, { ratio: event.target.value })} /></label>
                    <label className="sm:col-span-2"><span className={labelClass}>说明</span><textarea className={`${inputClass} min-h-20 resize-y`} value={photo.note} onChange={(event) => updatePhoto(index, { note: event.target.value })} /></label>
                    <label className="flex items-center gap-2 text-sm text-[#315f5a]/70"><input type="checkbox" checked={photo.live} onChange={(event) => updatePhoto(index, { live: event.target.checked })} />轻微动态</label>
                    <button className={`${ghostButtonClass} w-fit`} onClick={() => updateContent((current) => ({ ...current, photos: current.photos.filter((_, itemIndex) => itemIndex !== index) }))}>删除照片</button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className={panelClass}>
            <h2 className="cinema-title mb-5 text-3xl">音乐</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <label><span className={labelClass}>曲名</span><input className={inputClass} value={content.siteText.player.title} onChange={(event) => updatePlayer("title", event.target.value)} /></label>
              <label><span className={labelClass}>音乐文件</span><input className={inputClass} type="file" accept="audio/*" onChange={(event) => readFile(event, (value) => updatePlayer("src", value))} /></label>
            </div>
          </section>

          <section className={panelClass}>
            <h2 className="cinema-title mb-5 text-3xl">日记与页脚</h2>
            <div className="mb-6 grid gap-4 sm:grid-cols-2">
              {content.siteText.diary.authors.map((author, index) => (
                <label key={`${author}-${index}`}>
                  <span className={labelClass}>日记署名 {index + 1}</span>
                  <input className={inputClass} value={author} onChange={(event) => updateDiaryAuthor(index, event.target.value)} />
                </label>
              ))}
              <label className="sm:col-span-2"><span className={labelClass}>日记输入提示</span><input className={inputClass} value={content.siteText.diary.placeholder} onChange={(event) => updateContent((current) => ({ ...current, siteText: { ...current.siteText, diary: { ...current.siteText.diary, placeholder: event.target.value } } }))} /></label>
              <label><span className={labelClass}>日记按钮</span><input className={inputClass} value={content.siteText.diary.button} onChange={(event) => updateContent((current) => ({ ...current, siteText: { ...current.siteText, diary: { ...current.siteText.diary, button: event.target.value } } }))} /></label>
              <label><span className={labelClass}>页脚文字</span><input className={inputClass} value={content.siteText.footer.text} onChange={(event) => updateContent((current) => ({ ...current, siteText: { ...current.siteText, footer: { ...current.siteText.footer, text: event.target.value } } }))} /></label>
              <label className="sm:col-span-2"><span className={labelClass}>联系方式/备注</span><input className={inputClass} value={content.siteText.footer.contact} onChange={(event) => updateContent((current) => ({ ...current, siteText: { ...current.siteText, footer: { ...current.siteText.footer, contact: event.target.value } } }))} /></label>
            </div>
            <div className="mb-5 flex items-center justify-between gap-4">
              <p className="text-sm text-[#6f9284]">默认日记内容</p>
              <button className={buttonClass} onClick={() => updateContent((current) => ({ ...current, diarySeeds: [{ by: current.siteText.diary.authors[0] || "我", text: "写下一句想留住的生活细节。", date: "2026.06.01" }, ...current.diarySeeds] }))}>新增日记</button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {content.diarySeeds.map((entry, index) => (
                <article key={`${entry.date}-${index}`} className="grid gap-3 border-t border-[#9dbbab]/20 pt-4">
                  <label><span className={labelClass}>署名</span><input className={inputClass} value={entry.by} onChange={(event) => updateDiarySeed(index, { by: event.target.value })} /></label>
                  <label><span className={labelClass}>日期</span><input className={inputClass} value={entry.date} onChange={(event) => updateDiarySeed(index, { date: event.target.value })} /></label>
                  <label><span className={labelClass}>内容</span><textarea className={`${inputClass} min-h-24 resize-y`} value={entry.text} onChange={(event) => updateDiarySeed(index, { text: event.target.value })} /></label>
                  <button className={`${ghostButtonClass} w-fit`} onClick={() => updateContent((current) => ({ ...current, diarySeeds: current.diarySeeds.filter((_, itemIndex) => itemIndex !== index) }))}>删除日记</button>
                </article>
              ))}
            </div>
          </section>

          <section className={panelClass}>
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 className="cinema-title text-3xl">纪念日</h2>
              <button className={buttonClass} onClick={() => updateContent((current) => ({ ...current, anniversaries: [...current.anniversaries, { title: "新的纪念日", date: "2026-06-01", note: "写下这一天为什么重要。" }] }))}>新增纪念日</button>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {content.anniversaries.map((item, index) => (
                <article key={`${item.title}-${index}`} className="border-t border-[#9dbbab]/20 pt-4">
                  <label><span className={labelClass}>名称</span><input className={inputClass} value={item.title} onChange={(event) => updateAnniversary(index, { title: event.target.value })} /></label>
                  <label><span className={labelClass}>日期</span><input className={inputClass} value={item.date} onChange={(event) => updateAnniversary(index, { date: event.target.value })} /></label>
                  <label><span className={labelClass}>备注</span><textarea className={`${inputClass} min-h-20 resize-y`} value={item.note} onChange={(event) => updateAnniversary(index, { note: event.target.value })} /></label>
                  <button className={`${ghostButtonClass} mt-3`} onClick={() => updateContent((current) => ({ ...current, anniversaries: current.anniversaries.filter((_, itemIndex) => itemIndex !== index) }))}>删除</button>
                </article>
              ))}
            </div>
          </section>

          <section className={panelClass}>
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 className="cinema-title text-3xl">城市记录</h2>
              <button className={buttonClass} onClick={() => updateContent((current) => ({ ...current, trips: [...current.trips, { city: "新的城市", x: 50, y: 50, caption: "写下这座城市的记忆。" }] }))}>新增城市</button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {content.trips.map((trip, index) => (
                <article key={`${trip.city}-${index}`} className="grid gap-3 border-t border-[#9dbbab]/20 pt-4 sm:grid-cols-2">
                  <label><span className={labelClass}>城市</span><input className={inputClass} value={trip.city} onChange={(event) => updateTrip(index, { city: event.target.value })} /></label>
                  <label><span className={labelClass}>位置 X</span><input className={inputClass} type="number" value={trip.x} onChange={(event) => updateTrip(index, { x: Number(event.target.value) })} /></label>
                  <label><span className={labelClass}>位置 Y</span><input className={inputClass} type="number" value={trip.y} onChange={(event) => updateTrip(index, { y: Number(event.target.value) })} /></label>
                  <label className="sm:col-span-2"><span className={labelClass}>说明</span><textarea className={`${inputClass} min-h-20 resize-y`} value={trip.caption} onChange={(event) => updateTrip(index, { caption: event.target.value })} /></label>
                  <button className={`${ghostButtonClass} w-fit`} onClick={() => updateContent((current) => ({ ...current, trips: current.trips.filter((_, itemIndex) => itemIndex !== index) }))}>删除城市</button>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
