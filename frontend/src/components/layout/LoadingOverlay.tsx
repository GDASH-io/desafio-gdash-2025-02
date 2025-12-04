
import React from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";

export function LoadingOverlay({ visible }: { visible: boolean }) {
  if (!visible) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999]">
      <motion.div
        className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
      >
        <motion.div
          className="w-12 h-12 bg-white/80 rounded-full"
          animate={{ y: [0, -10, 0], x: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        />
      </motion.div>
    </div>,
    document.body
  );
}

