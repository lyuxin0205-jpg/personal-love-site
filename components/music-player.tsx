"use client";

import { Pause, Play, Volume2 } from "lucide-react";
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { useContent } from "@/lib/content-store";

export function MusicPlayer() {
  const { content } = useContent();
  const { siteText } = content;
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.45);

  async function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }
    await audio.play();
    setPlaying(true);
  }

  return (
    <motion.div initial={{ y: 42, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8, duration: 1, ease: [0.22, 1, 0.36, 1] }} className="fixed bottom-[calc(env(safe-area-inset-bottom)+.85rem)] left-1/2 z-50 w-[calc(100%-1.75rem)] max-w-lg -translate-x-1/2">
      <motion.div whileHover={{ y: -1 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} className="flex items-center gap-3 rounded-full border border-[#8fb5a3]/16 bg-white/62 p-1.5 pr-3 shadow-[0_10px_28px_rgba(37,73,67,.08)] backdrop-blur-md sm:gap-3">
        <audio ref={audioRef} src={siteText.player.src} loop preload="auto" />
        <button aria-label={playing ? siteText.player.pauseLabel : siteText.player.playLabel} onClick={toggle} className="grid size-9 shrink-0 place-items-center rounded-full bg-[#6fb79f] text-white transition duration-500 hover:bg-[#5da98f] sm:size-10">
          {playing ? <Pause className="size-4" /> : <Play className="size-4 fill-current" />}
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] text-cream/88">{siteText.player.title}</p>
          <div className="mt-1.5 h-[3px] overflow-hidden rounded-full bg-cream/10">
            <motion.div className="h-full rounded-full bg-gold" animate={{ width: playing ? ["0%", "100%"] : "18%" }} transition={{ duration: 32, repeat: playing ? Infinity : 0, ease: "linear" }} />
          </div>
        </div>
        <Volume2 className="hidden size-3.5 text-cream/34 sm:block" />
        <input
          aria-label={siteText.player.volumeLabel}
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(event) => {
            const value = Number(event.target.value);
            setVolume(value);
            if (audioRef.current) audioRef.current.volume = value;
          }}
          className="hidden w-16 accent-gold sm:block"
        />
      </motion.div>
    </motion.div>
  );
}
