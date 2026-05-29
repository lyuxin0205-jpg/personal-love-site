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
type LifeFragmentRow = { id: string; time: string; place: string; text: string; sort_order: number | null };
type WishRow = { id: string; text: string; completed: boolean; sort_order: number | null };

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

  const text = await response.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
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
  const [settingsRows, stories, albums, diary, cities, anniversaries, lifeFragments, wishes] = await Promise.all([
    selectRows<SettingRow>("site_settings", "key.asc"),
    selectRows<StoryRow>("stories"),
    selectRows<AlbumRow>("albums"),
    selectRows<DiaryRow>("diary"),
    selectRows<CityRow>("cities"),
    selectRows<AnniversaryRow>("anniversaries"),
    selectRows<LifeFragmentRow>("life_fragments"),
    selectRows<WishRow>("wishes")
  ]);

  const settings = settingsToObject(settingsRows);
  const empty =
    !settingsRows.length &&
    !stories.length &&
    !albums.length &&
    !diary.length &&
    !cities.length &&
    !anniversaries.length &&
    !lifeFragments.length &&
    !wishes.length;
  const siteText = withFallback(settings.siteText, siteContent.siteText);
  const completedWishes = wishes.filter((item) => item.completed).map((item) => item.text);
  const hasRemoteContent = !empty;

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
      siteText: hasRemoteContent
        ? {
            ...siteText,
            wishlist: {
              ...siteText.wishlist,
              completed: completedWishes
            } as typeof siteText.wishlist & { completed: string[] }
          }
        : siteText,
      photoPlaceholders: withFallback(settings.photoPlaceholders, siteContent.photoPlaceholders),
      timeAtmosphere: withFallback(settings.timeAtmosphere, siteContent.timeAtmosphere),
      story: hasRemoteContent ? stories.map(normalizeStory) : siteContent.story,
      photos: hasRemoteContent ? albums.map(normalizeAlbum) : siteContent.photos,
      diarySeeds: hasRemoteContent ? diary.map(({ by, text, date }) => ({ by, text, date })) : siteContent.diarySeeds,
      trips: hasRemoteContent ? cities.map(({ city, x, y, caption }) => ({ city, x, y, caption })) : siteContent.trips,
      anniversaries: hasRemoteContent ? anniversaries.map(({ title, date, note }) => ({ title, date, note })) : siteContent.anniversaries,
      lifeFragments: hasRemoteContent ? lifeFragments.map(({ time, place, text }) => ({ time, place, text })) : siteContent.lifeFragments,
      wishes: hasRemoteContent ? wishes.map(({ text }) => text) : siteContent.wishes
    }
  };
}

export async function saveSiteContentToSupabase(content: SiteContent) {
  const wishlist = content.siteText.wishlist as typeof content.siteText.wishlist & { completed?: string[] };
  const completed = wishlist.completed || [];
  const settings: SettingRow[] = [
    { key: "couple", value: content.couple },
    { key: "siteText", value: content.siteText },
    { key: "photoPlaceholders", value: content.photoPlaceholders },
    { key: "timeAtmosphere", value: content.timeAtmosphere }
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
    ),
    replaceRows(
      "life_fragments",
      "id",
      content.lifeFragments.map((item, index) => ({
        id: `life-fragment-${index}`,
        time: item.time,
        place: item.place,
        text: item.text,
        sort_order: index
      }))
    ),
    replaceRows(
      "wishes",
      "id",
      content.wishes.map((item, index) => ({
        id: `wish-${index}`,
        text: item,
        completed: completed.includes(item),
        sort_order: index
      }))
    )
  ]);
}

export async function uploadMediaToSupabase(file: File, folder: "images" | "audio", onProgress?: (progress: number) => void) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Supabase 环境变量未配置，无法上传文件。");
  }

  const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").toLowerCase();
  const objectPath = `${folder}/${Date.now()}-${cleanName}`;

  await new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("PUT", `${SUPABASE_URL}/storage/v1/object/${SUPABASE_BUCKET}/${objectPath}`);
    request.setRequestHeader("apikey", SUPABASE_ANON_KEY || "");
    request.setRequestHeader("Authorization", `Bearer ${SUPABASE_ANON_KEY || ""}`);
    request.setRequestHeader("Content-Type", file.type || "application/octet-stream");
    request.setRequestHeader("x-upsert", "true");

    request.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      onProgress?.(Math.round((event.loaded / event.total) * 100));
    };

    request.onload = () => {
      if (request.status >= 200 && request.status < 300) {
        onProgress?.(100);
        resolve();
        return;
      }
      reject(new Error(`上传失败：${request.status} ${request.responseText}`));
    };

    request.onerror = () => reject(new Error("上传失败：网络连接异常"));
    request.send(file);
  });

  return `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_BUCKET}/${objectPath}`;
}

export async function deleteMediaFromSupabase(fileUrl: string) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return;

  const publicPrefix = `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_BUCKET}/`;
  if (!fileUrl.startsWith(publicPrefix)) return;

  const objectPath = decodeURIComponent(fileUrl.slice(publicPrefix.length));
  if (!objectPath) return;

  const response = await fetch(`${SUPABASE_URL}/storage/v1/object/${SUPABASE_BUCKET}/${objectPath}`, {
    method: "DELETE",
    headers: headers({
      "Content-Type": "application/json"
    }),
    body: JSON.stringify({ prefixes: [objectPath] })
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`删除照片失败：${response.status} ${detail}`);
  }
}
