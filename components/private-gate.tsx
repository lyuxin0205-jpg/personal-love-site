"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { FormEvent, useState } from "react";
import { getAccessMarker, verifyPasscode } from "@/lib/access-control";
import { useContent } from "@/lib/content-store";

export function PrivateGate({ notice, onUnlock }: { notice?: string; onUnlock: (marker: string) => void }) {
  const { content, status, saveError } = useContent();
  const { couple, siteText } = content;
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);
  const unavailable = status === "loading" || status === "saving" || status === "error";

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (unavailable) return;

    setChecking(true);
    setError("");
    try {
      const marker = await getAccessMarker(couple);
      if (!marker) {
        setError("密码数据读取失败，请稍后重试。");
        return;
      }
      if (await verifyPasscode(couple, password)) {
        onUnlock(marker);
        return;
      }
      setError(siteText.gate.error);
    } finally {
      setChecking(false);
    }
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
        {notice && <p className="mx-auto mt-5 max-w-xs rounded-2xl border border-[#6fb79f]/24 bg-white/44 px-4 py-3 text-sm leading-6 text-[#244d49]">{notice}</p>}
        {status === "error" && (
          <p className="mx-auto mt-5 max-w-xs rounded-2xl border border-rose/24 bg-white/48 px-4 py-3 text-sm leading-6 text-rose">
            密码数据读取失败，请稍后重试。{saveError ? ` ${saveError}` : ""}
          </p>
        )}
        <div className="mt-8 flex rounded-full border border-cream/10 bg-white/58 p-1.5">
          <input
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setError("");
            }}
            type="password"
            autoComplete="current-password"
            placeholder={siteText.gate.placeholder}
            disabled={unavailable || checking}
            className="min-w-0 flex-1 bg-transparent px-5 text-[15px] text-cream outline-none placeholder:text-cream/38 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <button
            aria-label={siteText.gate.submitLabel}
            disabled={unavailable || checking}
            className="rounded-full bg-[#6fb79f] px-5 text-sm text-white transition hover:bg-[#5da98f] disabled:cursor-not-allowed disabled:opacity-55"
          >
            {checking ? "校验中" : siteText.gate.submitLabel}
          </button>
        </div>
        {error && <p className="mt-4 text-sm text-rose">{error}</p>}
        {status === "loading" && <p className="mt-4 text-sm text-cream/58">正在读取访问权限...</p>}
      </motion.form>
    </main>
  );
}
