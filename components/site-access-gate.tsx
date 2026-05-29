"use client";

import { ReactNode, useEffect, useState } from "react";
import { PrivateGate } from "@/components/private-gate";

const ACCESS_KEY = "only-us-access-unlocked";

export function SiteAccessGate({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUnlocked(window.localStorage.getItem(ACCESS_KEY) === "true" || window.localStorage.getItem("only-us-unlocked") === "true");
    setReady(true);
  }, []);

  function unlock() {
    window.localStorage.setItem(ACCESS_KEY, "true");
    window.localStorage.setItem("only-us-unlocked", "true");
    setUnlocked(true);
  }

  function logout() {
    window.localStorage.removeItem(ACCESS_KEY);
    window.localStorage.removeItem("only-us-unlocked");
    setUnlocked(false);
  }

  if (!ready) return null;
  if (!unlocked) return <PrivateGate onUnlock={unlock} />;

  return (
    <>
      {children}
      <button
        type="button"
        onClick={logout}
        className="fixed right-4 top-4 z-[55] rounded-full border border-[#4e8173]/14 bg-[#fffdf1]/48 px-3 py-2 text-xs text-[#315f5a]/46 shadow-[0_8px_24px_rgba(37,73,67,.045)] backdrop-blur-[3px] transition hover:bg-[#eef5dc]/78 hover:text-[#173f3a]/78 sm:right-5 sm:top-5"
      >
        退出访问
      </button>
    </>
  );
}
