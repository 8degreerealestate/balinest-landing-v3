import { useState } from "react";
import { SITE_MEDIA } from "@/lib/site-assets";

const FALLBACK =
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80";

export function TopAreaImage({ alt }: { alt: string }) {
  const [src, setSrc] = useState<string>(SITE_MEDIA.topArea);

  return (
    <img
      src={src}
      alt={alt}
      className="h-full w-full object-cover"
      decoding="async"
      loading="lazy"
      onError={() => {
        if (src === SITE_MEDIA.topArea) {
          setSrc(SITE_MEDIA.heroPoster);
          return;
        }
        if (src === SITE_MEDIA.heroPoster) {
          setSrc(SITE_MEDIA.heroStill);
          return;
        }
        setSrc(FALLBACK);
      }}
    />
  );
}
