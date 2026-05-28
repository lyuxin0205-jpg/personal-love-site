"use client";

import { motion } from "framer-motion";

export function AmbientLayers() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[1] overflow-hidden">
      <motion.div
        aria-hidden
        className="absolute right-[-18%] top-[8vh] h-[34vh] w-[42vw] rounded-full bg-[radial-gradient(circle,rgba(178,218,210,.13),transparent_68%)] blur-3xl"
        animate={{ x: ["-1.5%", "1.5%", "-1.5%"], opacity: [0.22, 0.36, 0.22] }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="absolute left-[-16%] bottom-[8vh] h-[30vh] w-[40vw] rounded-full bg-[radial-gradient(circle,rgba(224,232,184,.12),transparent_70%)] blur-3xl"
        animate={{ x: ["1.5%", "-1%", "1.5%"], opacity: [0.18, 0.3, 0.18] }}
        transition={{ duration: 34, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
