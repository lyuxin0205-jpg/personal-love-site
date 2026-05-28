"use client";

import { motion } from "framer-motion";
import { FormEvent, useState } from "react";
import { useContent } from "@/lib/content-store";

export function MessageBoard() {
  const { content, updateContent } = useContent();
  const { siteText } = content;
  const [text, setText] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!text.trim()) return;
    updateContent((current) => ({
      ...current,
      siteText: {
        ...current.siteText,
        messageBoard: {
          ...current.siteText.messageBoard,
          defaultNotes: [{ id: crypto.randomUUID(), text: text.trim(), date: current.siteText.messageBoard.justNowLabel }, ...current.siteText.messageBoard.defaultNotes]
        }
      }
    }));
    setText("");
  }

  return (
    <div className="border border-[#9dbbab]/22 bg-[#fffdf1]/62 p-5 shadow-[0_16px_42px_rgba(37,73,67,.08)] sm:p-7">
      <form onSubmit={submit} className="mb-5 flex gap-3 border border-[#8fb5a3]/18 bg-white/54 p-2">
        <input value={text} onChange={(event) => setText(event.target.value)} placeholder={siteText.messageBoard.placeholder} className="min-w-0 flex-1 bg-transparent px-3 text-[16px] text-[#244d49] outline-none placeholder:text-[#315f5a]/36" />
        <button aria-label={siteText.messageBoard.sendLabel} className="rounded-full bg-[#6fb79f] px-4 text-sm text-white transition hover:bg-[#5da98f]">
          {siteText.messageBoard.sendLabel}
        </button>
      </form>
      <div className="grid gap-3">
        {siteText.messageBoard.defaultNotes.map((note, index) => (
          <motion.div key={note.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className={`border border-[#9dbbab]/16 p-4 text-[#244d49] shadow-[0_8px_18px_rgba(37,73,67,.06)] ${index % 2 ? "bg-[#eef6d9]" : "bg-[#e4f4f0]"}`}>
            <p className="leading-7">{note.text}</p>
            <p className="mt-3 text-xs text-[#315f5a]/42">{note.date}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
