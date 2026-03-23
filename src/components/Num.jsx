import { useState, useEffect, useRef } from "react";

const D = {
  ink: "#2d3142",
};

// ═══════ ANIMATED NUMBER ═══════
export default function Num({ value, color = D.ink, size = 32 }) {
  const [d, setD] = useState(0);
  const rafRef = useRef(null);
  useEffect(() => {
    const n = parseInt(value) || 0;
    const st = performance.now();
    const tick = (now) => {
      const p = Math.min((now - st) / 1000, 1);
      setD(Math.round(n * (1 - Math.pow(1 - p, 4))));
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [value]);
  return (
    <span style={{ fontSize: size, fontWeight: 400, fontFamily: "'DM Mono',monospace", color, letterSpacing: -0.5 }}>
      {d}
    </span>
  );
}
