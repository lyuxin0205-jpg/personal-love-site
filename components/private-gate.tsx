"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { FormEvent, useState } from "react";
import { useContent } from "@/lib/content-store";

export function PrivateGate({ onUnlock }: { onUnlock: () => void }) {
  const { content } = useContent();
  const { couple, siteText } = content;
  const passcode = process.env.NEXT_PUBLIC_SITE_PASSCODE || couple.password;
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (password === passcode) {
      onUnlock();
      return;
    }
    setError(true);
  }

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-ink px-5 text-cream">
      <Image src="/images/gate.jpg" alt="" fill priority className="object-cover opacity-80 brightness-[1.18] saturate-[1.05]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(246,249,235,.25),rgba(246,249,235,.86)),radial-gradient(circle_at_50%_30%,rgba(190,225,200,.35),transparent_28rem)]" />
      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
        className="glass relative z-10 w-full max-w-md rounded-[1.75rem] p-7 text-center sm:p-9"
      >
        <p className="mb-3 text-sm tracking-[0.22em] text-warm">{siteText.gate.eyebrow}</p>
        <h1 className="cinema-title text-balance text-4xl text-cream sm:text-5xl">{siteText.gate.title}</h1>
        <p className="mx-auto mt-4 max-w-xs text-[15px] leading-7 text-cream/62">{siteText.gate.description}</p>
        <div className="mt-8 flex rounded-full border border-cream/10 bg-white/58 p-1.5">
          <input
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setError(false);
            }}
            type="password"
            placeholder={siteText.gate.placeholder}
            className="min-w-0 flex-1 bg-transparent px-5 text-[15px] text-cream outline-none placeholder:text-cream/38"
          />
          <button aria-label={siteText.gate.submitLabel} className="rounded-full bg-[#6fb79f] px-5 text-sm text-white transition hover:bg-[#5da98f]">
            {siteText.gate.submitLabel}
          </button>
        </div>
        {error && <p className="mt-4 text-sm text-rose">{siteText.gate.error}</p>}
      </motion.form>
    </main>
  );
}
