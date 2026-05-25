import { cn } from "@/lib/utils";

const INC_LOGO_SRC = "/brand/inc-logo.png";

/**
 * Official INC logotype (white on black matte). `mix-blend-lighten` drops the black
 * plate on dark hero backgrounds so only the white letterforms show.
 */
export function IncLogo({ className }: { className?: string }) {
  return (
    <img
      src={INC_LOGO_SRC}
      alt="INC"
      width={278}
      height={194}
      className={cn(
        "block h-8 w-auto max-w-[5.5rem] shrink-0 object-contain object-left mix-blend-lighten md:h-9 md:max-w-[6.25rem]",
        className,
      )}
    />
  );
}
