import { MessageCircle } from "lucide-react";
import { buildWhatsappUrl } from "@/lib/site-contact";

export function WhatsAppButton() {
  const message = "Hello, I am interested in learning more about 8 Degree properties.";
  const url = buildWhatsappUrl(message);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        bottom: "max(1.25rem, env(safe-area-inset-bottom, 0px))",
        right: "max(1.25rem, env(safe-area-inset-right, 0px))",
      }}
      className="fixed z-50 flex min-h-[3.25rem] min-w-[3.25rem] items-center justify-center rounded-full bg-[#25D366] p-3 text-white shadow-xl transition-all duration-300 hover:-translate-y-1 hover:bg-[#20bd5a] sm:min-h-14 sm:min-w-14 sm:p-4"
      aria-label="Contact us on WhatsApp"
    >
      <MessageCircle size={28} />
    </a>
  );
}
