"use client";

import { ReactNode, useEffect, useState } from "react";
import { PrivateGate } from "@/components/private-gate";
import { consumeAccessNotice, getAccessMarker, readStoredAccessMarker, storeAccessMarker } from "@/lib/access-control";
import { useContent } from "@/lib/content-store";

export function SiteAccessGate({ children }: { children: ReactNode }) {
  const { content, status } = useContent();
  const [unlocked, setUnlocked] = useState(false);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function checkAccess() {
      if (status === "loading" || status === "saving") return;
      if (status === "error") {
        if (!cancelled) {
          setUnlocked(false);
          setReady(true);
          setNotice(consumeAccessNotice());
        }
        return;
      }

      const marker = await getAccessMarker(content.couple);
      if (!cancelled) {
        setUnlocked(Boolean(marker && readStoredAccessMarker() === marker));
        setReady(true);
        setNotice(consumeAccessNotice());
      }
    }

    void checkAccess();
    return () => {
      cancelled = true;
    };
  }, [content.couple, status]);

  function unlock(marker: string) {
    storeAccessMarker(marker);
    setUnlocked(true);
  }

  if (!ready) return null;
  if (!unlocked) return <PrivateGate notice={notice} onUnlock={unlock} />;

  return <>{children}</>;
}
