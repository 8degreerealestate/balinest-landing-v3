import { CrmInlineForm } from "@/components/site/CrmInlineForm";

type BuyerAgentAssistanceFormProps = {
  onSuccess?: () => void;
};

/** Buyer's Agent enquiry — GoHighLevel CRM inline form. */
export function BuyerAgentAssistanceForm(_props: BuyerAgentAssistanceFormProps) {
  return <CrmInlineForm form="buyer-agent" />;
}
