"use client";

import { motion } from "framer-motion";
import { useContent } from "@/lib/content-store";

export function LoveMap() {
  const { content } = useContent();
  const { siteText, trips } = content;
  return (
    <div className="relative mx-auto max-w-7xl overflow-hidden border border-[#9dbbab]/22 bg-[#fffdf1]/66 p-4 shadow-[0_18px_46px_rgba(37,73,67,.08)] sm:p-7">
      <div className="absolute inset-0 opacity-55 [background-image:linear-gradient(rgba(43,63,48,.045)_1px,transparent_1px),linear-gradient(90deg,rgba(43,63,48,.045)_1px,transparent_1px)] [background-size:38px_38px]" />
      <div className="relative min-h-[500px] overflow-hidden border border-[#8fb5a3]/18 bg-[linear-gradient(135deg,rgba(248,249,231,.82),rgba(218,239,235,.74))]">
        <div className="absolute left-[10%] top-[18%] h-[62%] w-[78%] rounded-[46%] border border-[#8fb5a3]/22 bg-white/10 blur-[1px]" />
        <div className="absolute left-[20%] top-[35%] h-[38%] w-[50%] rounded-[46%] border border-[#6f9284]/14" />
        {trips.map((trip, index) => (
          <motion.div
            key={trip.city}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="absolute"
            style={{ left: `${trip.x}%`, top: `${trip.y}%` }}
          >
            <div className="group relative">
              <span className="relative block size-3 rounded-full bg-[#315f5a] shadow-[0_0_0_7px_rgba(111,159,96,.16),0_8px_18px_rgba(37,73,67,.18)]" />
              <span className="absolute left-5 top-1/2 -translate-y-1/2 whitespace-nowrap text-sm text-[#244d49]">{trip.city}</span>
              <div className="pointer-events-none absolute bottom-12 left-1/2 w-56 -translate-x-1/2 border border-[#8fb5a3]/22 bg-[#fffdf1]/92 p-4 opacity-0 shadow-[0_12px_28px_rgba(37,73,67,.12)] backdrop-blur-md transition group-hover:opacity-100">
                <p className="text-sm text-[#244d49]">{trip.city}</p>
                <p className="mt-2 text-xs leading-5 text-[#315f5a]/58">{trip.caption}</p>
              </div>
            </div>
          </motion.div>
        ))}
        <p className="absolute bottom-6 left-6 max-w-sm text-sm leading-7 text-[#315f5a]/58">{siteText.map.note}</p>
      </div>
    </div>
  );
}
