import { useEffect, useRef, useState } from "react";

// Fades / slides children in when scrolled into view.
export function Reveal({ children, as: Tag = "div", delay = 0, variant = "", className = "", style, ...rest }) {
  const ref = useRef(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) { setOn(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <Tag ref={ref} style={{ "--d": `${delay}ms`, ...style }} className={`reveal ${variant} ${on ? "in" : ""} ${className}`} {...rest}>{children}</Tag>;
}

// Counts up to a number when visible.  <CountUp to={30} suffix="+" />
export function CountUp({ to, suffix = "", duration = 1600, format }) {
  const ref = useRef(null);
  const [n, setN] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf;
    const run = () => {
      const t0 = performance.now();
      const tick = (t) => {
        const p = Math.min(1, (t - t0) / duration);
        setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    if (!("IntersectionObserver" in window)) { setN(to); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { run(); io.disconnect(); } }, { threshold: 0.4 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [to, duration]);
  return <span ref={ref}>{format ? format(n) : n}{suffix}</span>;
}

// Lightweight mouse-follow tilt for cards.
export function Tilt({ children, className = "", max = 7 }) {
  const ref = useRef(null);
  const move = (e) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateY(${x * max}deg) rotateX(${-y * max}deg) translateY(-4px)`;
  };
  const leave = () => { if (ref.current) ref.current.style.transform = ""; };
  return <div ref={ref} onMouseMove={move} onMouseLeave={leave} className={`transition-transform duration-300 ${className}`}>{children}</div>;
}
