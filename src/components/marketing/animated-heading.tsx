import {
  Children,
  cloneElement,
  isValidElement,
  useLayoutEffect,
  useRef,
} from "react";
import type { ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
function textOf(children: ReactNode): string {
  return Children.toArray(children)
    .map((child) =>
      isValidElement<{ children?: ReactNode }>(child)
        ? textOf(child.props.children)
        : String(child ?? ""),
    )
    .join("");
}
function layers(children: ReactNode): ReactNode {
  return Children.map(children, (child) => {
    if (typeof child === "string" || typeof child === "number") {
      if (!String(child).trim()) return child;
      return (
        <span className="m-title-reveal">
          <span className="m-title-source">{child}</span>
          <span
            className="m-title-band m-title-band-green"
            aria-hidden="true"
          />
          <span
            className="m-title-band m-title-band-black"
            aria-hidden="true"
          />
        </span>
      );
    }
    if (isValidElement<{ children?: ReactNode }>(child) && child.props.children)
      return cloneElement(child, {}, layers(child.props.children));
    return child;
  });
}
export default function AnimatedHeading({
  as: Tag = "h2",
  children,
}: {
  as?: "h1" | "h2";
  children: ReactNode;
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  const textKey = textOf(children);
  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const heading = ref.current;
      if (!heading) return;
      const tl = gsap.timeline({
        scrollTrigger: { trigger: heading, start: "top 92%", once: true },
      });
      heading
        .querySelectorAll<HTMLElement>(".m-title-reveal")
        .forEach((line, i) => {
          const source = line.querySelector(".m-title-source");
          const green = line.querySelector(".m-title-band-green");
          const black = line.querySelector(".m-title-band-black");
          const at = i * 0.12;
          gsap.set(source, { opacity: 0 });
          tl.fromTo(
            green,
            { scaleX: 0, transformOrigin: "left center" },
            { scaleX: 1, duration: 0.38, ease: "power3.inOut" },
            at,
          )
            .fromTo(
              black,
              { scaleX: 0, transformOrigin: "left center" },
              { scaleX: 1, duration: 0.38, ease: "power3.inOut" },
              at + 0.1,
            )
            .set(source, { opacity: 1 }, at + 0.48)
            .set([green, black], { transformOrigin: "right center" }, at + 0.48)
            .to(
              green,
              { scaleX: 0, duration: 0.44, ease: "power3.inOut" },
              at + 0.48,
            )
            .to(
              black,
              { scaleX: 0, duration: 0.44, ease: "power3.inOut" },
              at + 0.58,
            );
        });
    });
    return () => mm.revert();
  }, [textKey]);
  return <Tag ref={ref}>{layers(children)}</Tag>;
}
