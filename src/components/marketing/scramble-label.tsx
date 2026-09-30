import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
gsap.registerPlugin(ScrollTrigger, ScrambleTextPlugin);
export default function ScrambleLabel({ children }: { children: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const el = ref.current;
      if (!el) return;
      const source = el.querySelector(".m-scramble-source");
      const overlay = el.querySelector(".m-scramble-overlay");
      gsap
        .timeline({
          scrollTrigger: { trigger: el, start: "top 93%", once: true },
        })
        .set(source, { opacity: 0 })
        .set(overlay, { opacity: 1 })
        .to(overlay, {
          duration: 1.2,
          scrambleText: {
            text: children,
            chars: "!<>_[]{}*+/",
            speed: 0.4,
            revealDelay: 0.15,
            tweenLength: false,
          },
          ease: "none",
        })
        .set(source, { opacity: 1 })
        .set(overlay, { opacity: 0, textContent: "" });
    });
    return () => mm.revert();
  }, [children]);
  return (
    <span ref={ref} className="m-eyebrow m-scramble-label">
      <span className="m-scramble-source">{children}</span>
      <span
        className="m-scramble-overlay"
        aria-hidden="true"
        data-nosnippet=""
      />
    </span>
  );
}
