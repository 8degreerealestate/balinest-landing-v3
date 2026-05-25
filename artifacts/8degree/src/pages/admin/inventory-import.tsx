import { useLayoutEffect } from "react";

/** Legacy URL: full navigation so hash deep-link is applied reliably. */
export default function AdminInventoryImportRedirect() {
  useLayoutEffect(() => {
    const u = new URL(window.location.href);
    u.pathname = u.pathname.replace(/\/?inventory-import\/?$/, "/inventory");
    u.hash = "#import-import";
    window.location.replace(u.toString());
  }, []);

  return (
    <div className="p-8 text-muted-foreground text-sm">Opening import…</div>
  );
}
