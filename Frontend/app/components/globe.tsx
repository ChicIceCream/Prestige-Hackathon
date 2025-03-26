"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import GLOBE from "vanta/dist/vanta.globe.min";

const GlobeBackground = () => {
  const [vantaEffect, setVantaEffect] = useState<any>(null);
  const bgRef = useRef(null);

  useEffect(() => {
    if (!vantaEffect) {
      setVantaEffect(
        GLOBE({
          el: bgRef.current,
          THREE,
       mouseControls: true,
  touchControls: true,
  gyroControls: false,
  minHeight: 200.00,
  minWidth: 200.00,
  scale: 1.00,
  scaleMobile: 1.00,
  color: 0xc74082,
  size: 1.50,
  backgroundColor: 0x4d2472
        })
      );
    }
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);

  return <div ref={bgRef} className="absolute inset-0 -z-10 w-full h-full" />;
};

export default GlobeBackground;