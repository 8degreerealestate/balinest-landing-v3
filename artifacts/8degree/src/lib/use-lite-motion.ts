import { useEffect, useState } from "react";

/** True on touch / narrow viewports — use simpler scroll animations. */
export function useLiteMotion(): boolean {
  const [lite, setLite] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px), (pointer: coarse)");
    const update = () => setLite(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return lite;
}
