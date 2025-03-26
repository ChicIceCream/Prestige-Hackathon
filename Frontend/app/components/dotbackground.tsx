import { cn } from "@/lib/utils";
import React from "react";

export function DotBackgroundDemo({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full h-screen flex items-center justify-center bg-white z-10 mx-10">
      <div
        className={cn(
          "absolute inset-0",
          "[background-size:20px_20px]",
          "[background-image:radial-gradient(#d4d4d4_1px,transparent_1px)]"
        )}
      />
      {/* Radial gradient for the container to give a faded look */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      <div className="z-20 text-center">{children}</div>
    </div>
  );
}
