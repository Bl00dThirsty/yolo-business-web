import { useEffect, useRef, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import animationData from "@/assets/animations/Success.json";
export function SuccessAnimation() {
  const container = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    let disposed = false;
    let animation: import("lottie-web").AnimationItem | undefined;
    if (!media.matches)
      void import("lottie-web/build/player/lottie_light")
        .then(({ default: lottie }) => {
          if (disposed || !container.current) return;
          animation = lottie.loadAnimation({
            container: container.current,
            renderer: "svg",
            loop: false,
            autoplay: true,
            animationData: structuredClone(animationData),
          });
          setReady(true);
        })
        .catch(() => {});
    const reduce = () => {
      if (media.matches) animation?.goToAndStop(animationData.op - 1, true);
    };
    media.addEventListener("change", reduce);
    return () => {
      disposed = true;
      animation?.destroy();
      media.removeEventListener("change", reduce);
    };
  }, []);
  return (
    <span className="bw-success-animation" aria-hidden="true">
      <span ref={container} />
      {!ready && <CheckCircle2 size={28} />}
    </span>
  );
}
