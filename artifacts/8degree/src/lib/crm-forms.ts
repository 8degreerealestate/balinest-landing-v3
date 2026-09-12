/** GoHighLevel / LeadConnector inline website forms (Ryan CRM workflows). */
export type CrmWebsiteFormKey =
  | "buyer-agent"
  | "seller-agent"
  | "location-guide"
  | "investment-guide";

export type CrmWebsiteFormConfig = {
  formId: string;
  title: string;
  height: number;
  borderRadius: string;
};

export const CRM_WEBSITE_FORMS: Record<CrmWebsiteFormKey, CrmWebsiteFormConfig> = {
  "buyer-agent": {
    formId: "kN5LJyzjdsT79JAx7REE",
    title: "Buyer Agent's - Website Form",
    height: 460,
    borderRadius: "20px",
  },
  "seller-agent": {
    formId: "q8oUCihQhVEadQGpRGf7",
    title: "Seller's Agent Form",
    height: 716,
    borderRadius: "3px",
  },
  "location-guide": {
    formId: "OUMR1XH6VD9R9chNr9H3",
    title: "Location Guide - Website Form",
    height: 460,
    borderRadius: "20px",
  },
  "investment-guide": {
    formId: "AYDps7ezKoGiEkG6P3Ft",
    title: "Investment Guide - Website Form",
    height: 460,
    borderRadius: "20px",
  },
};

export const CRM_FORM_EMBED_SCRIPT = "https://link.msgsndr.com/js/form_embed.js";
