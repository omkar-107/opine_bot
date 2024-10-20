import React from "react";
import { motion } from "framer-motion";

export function Button({ text, href, className }) {
  return (
    <motion.a
      href={href}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`px-6 py-3 bg-slate-700 text-white rounded-md font-medium ${className}`}
    >
      {text}
    </motion.a>
  );
}
