"use client";

import { motion } from "framer-motion";

const flecks = Array.from({ length: 24 }, (_, index) => ({
  id: index,
  left: `${(index * 41) % 100}%`,
  top: `${(index * 29) % 100}%`,
  delay: (index % 7) * 0.32,
  size: index % 4 === 0 ? 4 : 2
}));

export function Starfield() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {flecks.map((item) => (
        <motion.span
          key={item.id}
          className="absolute rounded-full bg-[#8fb5a3]/28"
          style={{ left: item.left, top: item.top, width: item.size, height: item.size }}
          animate={{ opacity: [0.04, 0.18, 0.05], y: [0, -7, 0] }}
          transition={{ duration: 9 + (item.id % 5), repeat: Infinity, delay: item.delay, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}
