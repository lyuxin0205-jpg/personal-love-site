"use client";

import { motion } from "framer-motion";
import { FormEvent, useState } from "react";
import { useContent } from "@/lib/content-store";

export function CoupleDiary() {
  const { content, updateContent } = useContent();
  const { diarySeeds, siteText } = content;
  const [by, setBy] = useState(siteText.diary.authors[0]);
  const [text, setText] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!text.trim()) return;
    updateContent((current) => ({
      ...current,
      diarySeeds: [{ by, text: text.trim(), date: new Date().toLocaleDateString("zh-CN") }, ...current.diarySeeds]
    }));
    setText("");
  }

  return (
    <div className="border border-[#9dbbab]/22 bg-[#fffdf1]/66 p-5 shadow-[0_16px_42px_rgba(37,73,67,.08)] sm:p-7">
      <form onSubmit={submit} className="mb-6 grid gap-3">
        <div className="flex w-fit rounded-full border border-[#8fb5a3]/22 bg-white/60 p-1">
          {siteText.diary.authors.map((name) => (
            <button key={name} type="button" onClick={() => setBy(name)} className={`rounded-full px-4 py-2 text-sm transition ${by === name ? "bg-[#6fb79f] text-white" : "text-[#315f5a]/58 hover:text-[#244d49]"}`}>
              {name}
            </button>
          ))}
        </div>
        <textarea value={text} onChange={(event) => setText(event.target.value)} placeholder={siteText.diary.placeholder} rows={4} className="resize-none border border-[#8fb5a3]/18 bg-white/62 p-4 text-[16px] leading-7 text-[#244d49] outline-none placeholder:text-[#315f5a]/36 focus:border-[#6fb79f]/50" />
        <button className="inline-flex w-fit items-center gap-2 rounded-full bg-[#6fb79f] px-5 py-3 text-sm text-white transition hover:bg-[#5da98f]">
          {siteText.diary.button}
        </button>
      </form>
      <div className="grid gap-4">
        {diarySeeds.map((entry, index) => (
          <motion.article key={`${entry.date}-${entry.text}`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }} className="border-l border-[#8fb5a3]/34 bg-white/48 p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm text-[#5b8f7f]">{entry.by}</p>
              <p className="text-xs text-[#315f5a]/40">{entry.date}</p>
            </div>
            <p className="text-[15px] leading-8 text-[#315f5a]/72">{entry.text}</p>
          </motion.article>
        ))}
      </div>
    </div>
  );
}
