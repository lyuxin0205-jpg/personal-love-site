"use client";

import { siteContent } from "@/data/site";
import type { SiteContent } from "@/lib/content-store";

type SettingRow = { key: string; value: unknown };
type StoryRow = {
  slug: string;
  date: string;
  city: string | null;
  time: string | null;
  place: string;
  weather: string | null;
  music: string | null;
  meta: string;
  title: string;
  image: string;
  text: string;
  detail_text: string | null;
  sort_order: number | null;
};
type AlbumRow = {
  id: string;
  src: string;
  title: string;
  date: string;
  place: string;
  note: string;
  ratio: string;
  live: boolean;
  sort_order: number | null;
};
type DiaryRow = { id: string; by: string; text: string; date: string; sort_order: number | null };
type CityRow = { id: string; city: string; x: number; y: number; caption: string; sort_order: number | null };
type AnniversaryRow = { id: string; title: string; date: string; note: string; sort_order: number | null };

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || "site-media";

export function isSupabaseConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

function headers(extra?: HeadersInit): HeadersInit {
  return {
    apikey: SUPABASE_ANON_KEY || "",
    Authorization: `Bearer ${SUPABASE_ANON_KEY || ""}`,
    ...extra
  };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Supabase 环境变量未配置。");
  }

  const response = await fetch(`${SUPABASE_URL}${path}`, {
    ...init,
    headers: headers(init?.headers)
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Supabase 请求失败：${response.status} ${detail}`);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

async function selectRows<T>(table: string, order = "sort_order.asc") {
  return request<T[]>(`/rest/v1/${table}?select=*&order=${order}`, {
    headers: { Accept: "application/json" },
    cache: "no-store"
  });
}

async function replaceRows(table: string, keyColumn: "id" | "key", rows: object[]) {
  await request(`/rest/v1/${table}?${keyColumn}=neq.__never__`, {
    method: "DELETE",
    headers: { Prefer: "return=minimal" }
  });

  if (!rows.length) return;

  await request(`/rest/v1/${table}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Prefer: "return=minimal"
    },
    body: JSON.stringify(rows)
  });
}

function settingsToObject(rows: SettingRow[]) {
  return rows.reduce<Record<string, unknown>>((result, row) => {
    result[row.key] = row.value;
    return result;
  }, {});
}

function withFallback<T>(value: unknown, fallback: T): T {
  return value && typeof value === "object" ? (value as T) : fallback;
}

function normalizeStory(row: StoryRow): SiteContent["story"][number] {
  return {
    slug: row.slug,
    date: row.date,
    city: row.city || row.place.split("/")[0]?.trim() || row.place,
    time: row.time || "",
    place: row.place,
    weather: row.weather || "",
    music: row.music || "",
    meta: row.meta,
    title: row.title,
    image: row.image,
    text: row.text,
    detailText: row.detail_text || row.text
  };
}

function normalizeAlbum(row: AlbumRow): SiteContent["photos"][number] {
  return {
    src: row.src,
    title: row.title,
    date: row.date,
    place: row.place,
    note: row.note,
    ratio: row.ratio,
    live: row.live
  };
}

export async function loadSiteContentFromSupabase(): Promise<{ content: SiteContent; empty: boolean }> {
  const [settingsRows, stories, albums, diary, cities, anniversaries] = await Promise.all([
    selectRows<SettingRow>("site_settings", "key.asc"),
    selectRows<StoryRow>("stories"),
    selectRows<AlbumRow>("albums"),
    selectRows<DiaryRow>("diary"),
    selectRows<CityRow>("cities"),
    selectRows<AnniversaryRow>("anniversaries")
  ]);

  const settings = settingsToObject(settingsRows);
  const empty = !settingsRows.length && !stories.length && !albums.length && !diary.length && !cities.length && !anniversaries.length;

  return {
    empty,
    content: {
      ...siteContent,
      contentSource: {
        mode: "supabase",
        cmsReady: true,
        note: "内容从 Supabase 读取，后台保存后会同步给所有设备。"
      },
      couple: withFallback(settings.couple, siteContent.couple),
      siteText: withFallback(settings.siteText, siteContent.siteText),
      photoPlaceholders: withFallback(settings.photoPlaceholders, siteContent.photoPlaceholders),
      lifeFragments: withFallback(settings.lifeFragments, siteContent.lifeFragments),
      timeAtmosphere: withFallback(settings.timeAtmosphere, siteContent.timeAtmosphere),
      wishes: withFallback(settings.wishes, siteContent.wishes),
      story: stories.length ? stories.map(normalizeStory) : siteContent.story,
      photos: albums.length ? albums.map(normalizeAlbum) : siteContent.photos,
      diarySeeds: diary.length ? diary.map(({ by, text, date }) => ({ by, text, date })) : siteContent.diarySeeds,
      trips: cities.length ? cities.map(({ city, x, y, caption }) => ({ city, x, y, caption })) : siteContent.trips,
      anniversaries: anniversaries.length ? anniversaries.map(({ title, date, note }) => ({ title, date, note })) : siteContent.anniversaries
    }
  };
}

export async function saveSiteContentToSupabase(content: SiteContent) {
  const settings: SettingRow[] = [
    { key: "couple", value: content.couple },
    { key: "siteText", value: content.siteText },
    { key: "photoPlaceholders", value: content.photoPlaceholders },
    { key: "lifeFragments", value: content.lifeFragments },
    { key: "timeAtmosphere", value: content.timeAtmosphere },
    { key: "wishes", value: content.wishes }
  ];

  await Promise.all([
    replaceRows("site_settings", "key", settings),
    replaceRows(
      "stories",
      "id",
      content.story.map((item, index) => ({
        id: item.slug,
        slug: item.slug,
        date: item.date,
        city: item.city || item.place.split("/")[0]?.trim() || item.place,
        time: item.time,
        place: item.place,
        weather: item.weather,
        music: item.music,
        meta: item.meta,
        title: item.title,
        image: item.image,
        text: item.text,
        detail_text: item.detailText,
        sort_order: index
      }))
    ),
    replaceRows(
      "albums",
      "id",
      content.photos.map((item, index) => ({
        id: `photo-${index}`,
        src: item.src,
        title: item.title,
        date: item.date,
        place: item.place,
        note: item.note,
        ratio: item.ratio,
        live: item.live,
        sort_order: index
      }))
    ),
    replaceRows(
      "diary",
      "id",
      content.diarySeeds.map((item, index) => ({
        id: `diary-${index}`,
        by: item.by,
        text: item.text,
        date: item.date,
        sort_order: index
      }))
    ),
    replaceRows(
      "cities",
      "id",
      content.trips.map((item, index) => ({
        id: `city-${index}`,
        city: item.city,
        x: item.x,
        y: item.y,
        caption: item.caption,
        sort_order: index
      }))
    ),
    replaceRows(
      "anniversaries",
      "id",
      content.anniversaries.map((item, index) => ({
        id: `anniversary-${index}`,
        title: item.title,
        date: item.date,
        note: item.note,
        sort_order: index
      }))
    )
  ]);
}

export async function uploadMediaToSupabase(file: File, folder: "images" | "audio") {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Supabase 环境变量未配置，无法上传文件。");
  }

  const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").toLowerCase();
  const objectPath = `${folder}/${Date.now()}-${cleanName}`;
  const response = await fetch(`${SUPABASE_URL}/storage/v1/object/${SUPABASE_BUCKET}/${objectPath}`, {
    method: "PUT",
    headers: headers({
      "Content-Type": file.type || "application/octet-stream",
      "x-upsert": "true"
    }),
    body: file
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`上传失败：${response.status} ${detail}`);
  }

  return `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_BUCKET}/${objectPath}`;
}
