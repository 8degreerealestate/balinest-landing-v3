import { useState } from "react";
import { Mail } from "lucide-react";
import { useCreateEnquiry } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { PhoneCountryNumberField } from "@/components/site/PhoneCountryNumberField";
import { buildInternationalPhone, DEFAULT_PHONE_COUNTRY_ID, findPhoneCountry } from "@/lib/phone-countries";
import { cn } from "@/lib/utils";
import { useSiteCopy } from "@/lib/site-language";
import { BUYER_AGENT_COPY } from "@/lib/i18n/buyer-agent";
import { COMMON_COPY } from "@/lib/i18n/common";

const REQ = (
  <span className="ml-1 inline-block translate-y-[-1px] text-[0.45rem] leading-none text-[#01514E]">
    ◆
  </span>
);

const LABEL = "text-[11px] font-semibold uppercase tracking-[0.28em] text-[#01514E]";
const CONTROL =
  "rounded-lg border border-[#1f1d1b]/18 bg-white text-[#1c1917] shadow-sm placeholder:text-[#1c1917]/40 focus-visible:border-[#01514E] focus-visible:ring-1 focus-visible:ring-[#01514E]/25";

const BUDGET_OPTIONS = ["$300K - $500K", "$500K - $1M", "$1M above"] as const;

type BuyerAgentAssistanceFormProps = {
  onSuccess?: () => void;
};

export function BuyerAgentAssistanceForm({ onSuccess }: BuyerAgentAssistanceFormProps) {
  const { toast } = useToast();
  const createEnquiry = useCreateEnquiry();
  const t = useSiteCopy(BUYER_AGENT_COPY).form;
  const common = useSiteCopy(COMMON_COPY);

  const timelineOptions = [
    { value: "now" as const, label: t.timelineNow },
    { value: "next_3_months" as const, label: t.timeline3m },
    { value: "next_6_months" as const, label: t.timeline6m },
  ];

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneCountryId, setPhoneCountryId] = useState(DEFAULT_PHONE_COUNTRY_ID);
  const [phoneNational, setPhoneNational] = useState("");
  const [timeline, setTimeline] = useState("");
  const [budget, setBudget] = useState<string>(BUDGET_OPTIONS[0]);

  const reset = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhoneCountryId(DEFAULT_PHONE_COUNTRY_ID);
    setPhoneNational("");
    setTimeline("");
    setBudget(BUDGET_OPTIONS[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = `${firstName} ${lastName}`.trim();
    const dial = findPhoneCountry(phoneCountryId).dial;
    const fullPhone = buildInternationalPhone(dial, phoneNational);
    const phoneDigits = fullPhone.replace(/\D/g, "");
    if (!name || !email || !timeline || !budget || phoneDigits.length < 8) {
      toast({
        title: common.missingInfoTitle,
        description: common.missingInfoDesc,
        variant: "destructive",
      });
      return;
    }

    const timelineLabel = timelineOptions.find((o) => o.value === timeline)?.label ?? timeline;

    try {
      await createEnquiry.mutateAsync({
        data: {
          name,
          email,
          phone: fullPhone,
          budgetRange: budget,
          message: `Investment timeline range: ${timelineLabel}`,
          source: "buyer_agent_assistance_modal",
        },
      });
      toast({ title: t.thankTitle, description: t.thankDesc });
      reset();
      onSuccess?.();
    } catch {
      toast({ title: t.errorTitle, description: t.errorDesc, variant: "destructive" });
    }
  };

  const pending = createEnquiry.isPending;

  const controlH = `h-11 ${CONTROL}`;
  const field = "space-y-1.5";

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-x-6 md:gap-y-3.5"
    >
      <div className={field}>
        <Label htmlFor="ba-first" className={LABEL}>
          {t.firstName}
          {REQ}
        </Label>
        <Input
          id="ba-first"
          value={firstName}
          onChange={(ev) => setFirstName(ev.target.value)}
          placeholder={t.firstName}
          required
          autoComplete="given-name"
          className={controlH}
        />
      </div>

      <div className={field}>
        <Label htmlFor="ba-last" className={LABEL}>
          {t.lastName}
          {REQ}
        </Label>
        <Input
          id="ba-last"
          value={lastName}
          onChange={(ev) => setLastName(ev.target.value)}
          placeholder={t.lastName}
          required
          autoComplete="family-name"
          className={controlH}
        />
      </div>

      <div className={field}>
        <Label htmlFor="ba-email" className={LABEL}>
          {t.email}
          {REQ}
        </Label>
        <div className="relative">
          <Mail
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1c1917]/40"
            strokeWidth={1.75}
            aria-hidden
          />
          <Input
            id="ba-email"
            type="email"
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
            placeholder={t.emailPh}
            required
            autoComplete="email"
            className={cn(controlH, "pl-10")}
          />
        </div>
      </div>

      <div className={field}>
        <Label htmlFor="ba-phone" id="ba-phone-label" className={LABEL}>
          {t.phone}
          {REQ}
        </Label>
        <PhoneCountryNumberField
          inputId="ba-phone"
          groupAriaLabelledBy="ba-phone-label"
          countryId={phoneCountryId}
          onCountryIdChange={setPhoneCountryId}
          national={phoneNational}
          onNationalChange={setPhoneNational}
          required
          hint={
            <p className="text-xs font-light text-[#1c1917]/55">
              <span className="font-medium text-[#1c1917]/80">{findPhoneCountry(phoneCountryId).dial}</span> —{" "}
              {t.dialHint}
            </p>
          }
        />
      </div>

      <div className={field}>
        <Label className={LABEL}>
          {t.timeline}
          {REQ}
        </Label>
        <Select value={timeline} onValueChange={setTimeline}>
          <SelectTrigger
            className={cn(
              controlH,
              "w-full justify-between font-normal [&>span]:text-[#1c1917] [&>span]:data-[placeholder]:text-[#1c1917]/40",
            )}
          >
            <SelectValue placeholder={t.timelinePh} />
          </SelectTrigger>
          <SelectContent className="z-[60]">
            {timelineOptions.map((o) => (
              <SelectItem key={o.value} value={o.value} className="font-normal">
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className={cn(field, "md:min-h-0")}>
        <Label className={LABEL}>
          {t.budget}
          {REQ}
        </Label>
        <RadioGroup value={budget} onValueChange={setBudget} className="flex flex-col gap-2 pt-0.5">
          {BUDGET_OPTIONS.map((opt, i) => {
            const rid = `ba-budget-${i}`;
            return (
              <div key={opt} className="flex items-center gap-2.5">
                <RadioGroupItem
                  value={opt}
                  id={rid}
                  className="border-[#1c1917]/35 text-[#01514E] data-[state=checked]:border-[#01514E] data-[state=checked]:text-[#01514E]"
                />
                <Label htmlFor={rid} className="cursor-pointer text-sm font-normal text-[#1c1917]">
                  {opt}
                </Label>
              </div>
            );
          })}
        </RadioGroup>
      </div>

      <div className="flex flex-col items-stretch gap-3 border-t border-[#01514E]/10 pt-4 sm:flex-row sm:items-center sm:justify-end md:col-span-2">
        <Button
          type="submit"
          disabled={pending}
          className="h-11 w-full shrink-0 rounded-lg bg-[#01514E] px-8 font-sans text-sm font-semibold uppercase tracking-[0.14em] text-white hover:bg-[#013d3a] disabled:opacity-60 sm:w-auto sm:min-w-[200px]"
        >
          {pending ? t.submitting : t.submit}
        </Button>
      </div>
    </form>
  );
}
