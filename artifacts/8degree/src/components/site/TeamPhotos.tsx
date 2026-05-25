import { useState } from "react";
import { SITE_MEDIA } from "@/lib/site-assets";

export function TeamPhotos() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {SITE_MEDIA.team.map((member) => (
        <TeamSlot key={member.src} src={member.src} name={member.name} role={member.role} />
      ))}
    </div>
  );
}

function TeamSlot({ src, name, role }: { src: string; name: string; role: string }) {
  const [hidden, setHidden] = useState(false);
  if (hidden) return null;
  return (
    <div className="group relative aspect-[3/4] overflow-hidden border border-border bg-muted">
      <img
        src={src}
        alt={`${name}, ${role}`}
        className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
        onError={() => setHidden(true)}
      />
      <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-3 py-2">
        <div className="text-sm font-medium text-white">{name}</div>
      </div>
    </div>
  );
}
