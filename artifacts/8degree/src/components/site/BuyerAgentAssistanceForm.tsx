import { useMemo, useState } from "react";
import { Check, Mail } from "lucide-react";
import { useCreateEnquiry } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemIndicatorPrimitive,
  SelectItemPrimitive,
  SelectItemTextPrimitive,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { buildInternationalPhone, PHONE_COUNTRIES, PHONE_SELECT_ITEM_CLASS } from "@/lib/phone-countries";
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
  const [phoneCountryId, setPhoneCountryId] = useState<string>("id");
  const [phoneNational, setPhoneNational] = useState("");
  const [timeline, setTimeline] = useState("");
  const [budget, setBudget] = useState<string>(BUDGET_OPTIONS[0]);

  const reset = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhoneCountryId("id");
    setPhoneNational("");
    setTimeline("");
    setBudget(BUDGET_OPTIONS[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = `${firstName} ${lastName}`.trim();
    const dial = PHONE_COUNTRIES.find((c) => c.id === phoneCountryId)?.dial ?? "+62";
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

  const selectedDial = useMemo(
    () => PHONE_COUNTRIES.find((c) => c.id === phoneCountryId)?.dial ?? "+62",
    [phoneCountryId],
  );

  const selectedCountry = useMemo(
    () => PHONE_COUNTRIES.find((c) => c.id === phoneCountryId) ?? PHONE_COUNTRIES[0],
    [phoneCountryId],
  );

  const phonePlaceholder = useMemo(() => {
    if (phoneCountryId === "other") return "+1 234 567 8900";
    if (phoneCountryId === "id") return "0812-345-678";
    if (phoneCountryId === "au") return "0412-345-678";
    return "412 345 678";
  }, [phoneCountryId]);

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
        <div
          role="group"
          aria-labelledby="ba-phone-label"
          className={cn(
            "flex h-11 w-full min-w-0 items-stretch overflow-hidden rounded-lg border border-[#1f1d1b]/18 bg-white shadow-sm",
            "focus-within:border-[#01514E] focus-within:ring-1 focus-within:ring-[#01514E]/25",
          )}
        >
          <Select value={phoneCountryId} onValueChange={setPhoneCountryId}>
            <SelectTrigger
              aria-label={`Country code, ${selectedCountry.label}`}
              className={cn(
                "h-11 min-h-11 w-[3.5rem] max-w-[3.5rem] shrink-0 rounded-none border-0 bg-transparent px-1.5 py-0 shadow-none",
                "justify-between gap-0.5 focus:ring-0 focus:ring-offset-0 data-[state=open]:bg-[#f4f1ea]/80",
                "[&_svg]:h-[15px] [&_svg]:w-[15px] [&_svg]:shrink-0 [&_svg]:text-[#1c1917]/45",
                "[&>span]:text-[1.0625rem] [&>span]:leading-none",
              )}
            >
              <SelectValue placeholder="🌐" />
            </SelectTrigger>
            <SelectContent className="z-[60] max-h-60 min-w-[min(100vw-2rem,18rem)]">
              {PHONE_COUNTRIES.map((c) => (
                <SelectItemPrimitive
                  key={c.id}
                  value={c.id}
                  textValue={c.label}
                  title={c.label}
                  className={cn(PHONE_SELECT_ITEM_CLASS, "font-normal")}
                >
                  <SelectItemTextPrimitive className="inline-flex shrink-0 items-center text-[1.125rem] leading-none">
                    {c.flag}
                  </SelectItemTextPrimitive>
                  <span className="min-w-0 flex-1 truncate text-left text-sm text-[#1c1917]">{c.countryName}</span>
                  <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
                    <SelectItemIndicatorPrimitive>
                      <Check className="h-4 w-4" />
                    </SelectItemIndicatorPrimitive>
                  </span>
                </SelectItemPrimitive>
              ))}
            </SelectContent>
          </Select>
          <div className="w-px shrink-0 self-stretch bg-[#1f1d1b]/18" aria-hidden />
          <Input
            id="ba-phone"
            type="tel"
            inputMode="tel"
            value={phoneNational}
            onChange={(ev) => setPhoneNational(ev.target.value)}
            placeholder={phonePlaceholder}
            required
            autoComplete={phoneCountryId === "other" ? "tel" : "tel-national"}
            className={cn(
              "h-11 min-h-0 min-w-0 flex-1 rounded-none border-0 bg-transparent px-3 py-0 text-sm font-normal text-[#1c1917] shadow-none",
              "placeholder:text-[#1c1917]/40 focus-visible:ring-0 focus-visible:ring-offset-0",
            )}
          />
        </div>
        {phoneCountryId !== "other" && selectedDial ? (
          <p className="text-xs font-light text-[#1c1917]/55">
            <span className="font-medium text-[#1c1917]/80">{selectedDial}</span> — {t.dialHint}
          </p>
        ) : (
          <p className="text-xs font-light text-[#1c1917]/55">{t.dialHintIntl}</p>
        )}
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
