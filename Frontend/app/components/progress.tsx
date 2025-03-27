"use client";

import { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";

export const CircularProgressBar = ({ efficiency }: {efficiency: number}) => {
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
    <div className="flex justify-center items-center  ">
      <svg className="w-60 h-60" viewBox="0 0 100 100">
        {/* Background Circle (Red - Remaining part) */}
        <circle
          cx="50"
          cy="50"
          r="40"
          stroke="red"
          strokeWidth="4"
          fill="transparent"
          strokeDasharray="251.2"
          strokeDashoffset="0"
          className="drop-shadow-lg"
        />

        {/* Animated Foreground Circle (Green - Efficiency part) */}
        <motion.circle
          cx="50"
          cy="50"
          r="40"
          stroke="limegreen"
          strokeWidth="4"
          fill="transparent"
          strokeDasharray="251.2"
          strokeDashoffset={251.2 - (progress / 100) * 251.2}
          initial={{ strokeDashoffset: 251.2 }}
          animate={{ strokeDashoffset: 251.2 - (progress / 100) * 251.2 }}
          transition={{ duration: 2, ease: "easeInOut" }}
          className="drop-shadow-[0px_0px_10px_limegreen]"
        />

        {/* Efficiency Percentage Text (Animated) */}
        <motion.text
          x="50"
          y="55"
          textAnchor="middle"
          fontSize="12"
          fill="black"
          fontWeight="bold"
          animate={controls}
        >
          {progress}%
        </motion.text>
      </svg>
    </div>
  );
};

export default CircularProgressBar;