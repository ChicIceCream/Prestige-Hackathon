"use client";

import { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";

export const CircularProgressBar = ({ efficiency }: { efficiency: number }) => {
  const [progress, setProgress] = useState(0);
  const controls = useAnimation();

  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(efficiency);
      controls.start({ value: efficiency, transition: { duration: 2 } });
    }, 500);

    return () => clearTimeout(timer);
  }, [efficiency, controls]);

  return (
    <div className="flex justify-center items-center rounded-full">
      <svg className="w-60 h-60" viewBox="0 0 100 100">
        <defs>
          {/* Gradient for Progress Stroke */}
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00ff7f" />
            <stop offset="100%" stopColor="#00bfff" />
          </linearGradient>

          {/* Glow Filter */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background Circle */}
        <circle
          cx="50"
          cy="50"
          r="40"
          stroke="#FF7F7F"
          strokeWidth="6"
          fill="transparent"
          strokeDasharray="251.2"
          strokeDashoffset="0"
          className="drop-shadow-lg"
        />

        {/* Animated Progress Circle with Glow */}
        <motion.circle
          cx="50"
          cy="50"
          r="40"
          stroke="url(#progressGradient)" // Gradient color
          strokeWidth="6"
          fill="transparent"
          strokeDasharray="251.2"
          strokeDashoffset={251.2 - (progress / 100) * 251.2}
          initial={{ strokeDashoffset: 251.2 }}
          animate={{ strokeDashoffset: 251.2 - (progress / 100) * 251.2 }}
          transition={{ duration: 2, ease: "easeInOut" }}
          style={{ filter: "url(#glow)" }} // Apply glow effect
        />

        {/* Percentage Text with Shadow */}
        <motion.text
          x="50"
          y="55"
          textAnchor="middle"
          fontSize="14"
          fill="black"
          fontWeight="bold"
          animate={controls}
          className="drop-shadow-lg"
        >
          {progress}%
        </motion.text>
      </svg>
    </div>
  );
};

export default CircularProgressBar;
