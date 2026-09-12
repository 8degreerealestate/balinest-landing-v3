import { useEffect, useRef } from "react";
import { CRM_FORM_EMBED_SCRIPT, CRM_WEBSITE_FORMS, type CrmWebsiteFormKey } from "@/lib/crm-forms";

let formEmbedScriptPromise: Promise<void> | null = null;

function loadCrmFormEmbedScript(): Promise<void> {
  if (typeof document === "undefined") return Promise.resolve();
  if (formEmbedScriptPromise) return formEmbedScriptPromise;

  const existing = document.querySelector(`script[src="${CRM_FORM_EMBED_SCRIPT}"]`);
  if (existing) {
    formEmbedScriptPromise = Promise.resolve();
    return formEmbedScriptPromise;
  }

  formEmbedScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = CRM_FORM_EMBED_SCRIPT;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("CRM form embed script failed to load"));
    document.body.appendChild(script);
  });

  return formEmbedScriptPromise;
}

function initGhlIframeResize(iframe: HTMLIFrameElement) {
  if (iframe.getAttribute("data-iframe-resizer-initialized") === "true") return;

  const iFrameResize = (
    window as Window & {
      iFrameResize?: (options: Record<string, unknown>, target: string | HTMLElement) => void;
    }
  ).iFrameResize;

  if (typeof iFrameResize !== "function") return;

  iFrameResize(
    {
      log: false,
      checkOrigin: false,
      enablePublicMethods: true,
      scrolling: true,
      heightCalculationMethod: "offset",
      autoResize: true,
    },
    iframe,
  );
}

function mountGhlInlineForm(container: HTMLElement, form: CrmWebsiteFormKey) {
  const config = CRM_WEBSITE_FORMS[form];
  const iframeId = `inline-${config.formId}`;
  const formUrl = `https://api.leadconnectorhq.com/widget/form/${config.formId}`;

  container.replaceChildren();

  const iframe = document.createElement("iframe");
  iframe.src = formUrl;
  iframe.title = config.title;
  iframe.id = iframeId;
  iframe.setAttribute("data-layout", "{'id':'INLINE'}");
  iframe.setAttribute("data-trigger-type", "alwaysShow");
  iframe.setAttribute("data-trigger-value", "");
  iframe.setAttribute("data-activation-type", "alwaysActivated");
  iframe.setAttribute("data-activation-value", "");
  iframe.setAttribute("data-deactivation-type", "neverDeactivate");
  iframe.setAttribute("data-deactivation-value", "");
  iframe.setAttribute("data-form-name", config.title);
  iframe.setAttribute("data-height", String(config.height));
  iframe.setAttribute("data-layout-iframe-id", iframeId);
  iframe.setAttribute("data-form-id", config.formId);
  iframe.style.width = "100%";
  iframe.style.height = `${config.height}px`;
  iframe.style.border = "none";
  iframe.style.borderRadius = config.borderRadius;

  container.appendChild(iframe);

  void loadCrmFormEmbedScript().then(() => {
    // SPA routes mount iframes after form_embed.js may have already run — wire resize manually.
    initGhlIframeResize(iframe);
  });
}

type CrmInlineFormProps = {
  form: CrmWebsiteFormKey;
  className?: string;
};

/** Embeds a GoHighLevel / LeadConnector form — submissions go directly to CRM workflows. */
export function CrmInlineForm({ form, className }: CrmInlineFormProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const config = CRM_WEBSITE_FORMS[form];

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    mountGhlInlineForm(container, form);

    return () => {
      container.replaceChildren();
    };
  }, [form]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ minHeight: config.height, position: "relative", zIndex: 1 }}
    />
  );
}
