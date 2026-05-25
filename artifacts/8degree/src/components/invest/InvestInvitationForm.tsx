import { useMemo, useState } from "react";
import { Check } from "lucide-react";
import { useForm } from "react-hook-form";
import { useCreateEnquiry } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { buildInternationalPhone, PHONE_COUNTRIES } from "@/lib/phone-countries";
import { cn } from "@/lib/utils";

const INVEST_DARK = "#0d4542";

const LABEL = "text-[11px] font-semibold uppercase tracking-[0.28em] text-[#0d4542]";
const CONTROL =
  "rounded-lg border border-[#1f1d1b]/18 bg-white text-[#1c1917] shadow-sm placeholder:text-[#1c1917]/40 focus-visible:border-[#0d4542] focus-visible:ring-1 focus-visible:ring-[#0d4542]/25";

const INVEST_SELECT_ITEM =
  "relative cursor-default select-none rounded-sm py-2 pl-8 pr-3 text-sm font-normal text-[#1c1917] outline-none data-[highlighted]:bg-[#E0FDAC] data-[highlighted]:text-[#1c1917] focus:bg-[#E0FDAC] focus:text-[#1c1917] data-[disabled]:pointer-events-none data-[disabled]:opacity-50";

const INVEST_PHONE_SELECT_ITEM =
  "relative flex w-full cursor-default select-none items-center gap-2 rounded-sm py-2 pl-2 pr-8 text-sm outline-none data-[highlighted]:bg-[#0d4542] data-[highlighted]:text-white focus:bg-[#0d4542] focus:text-white data-[disabled]:pointer-events-none data-[disabled]:opacity-50";

const INVESTMENT_INTEREST_OPTIONS = ["Just exploring", "Considering", "Ready to discuss"] as const;

const REQ = (
  <span className="ml-1 inline-block translate-y-[-1px] text-[0.45rem] leading-none text-[#0d4542]">◆</span>
);

type InvestInvitationValues = {
  fullName: string;
  email: string;
  country: string;
  investmentInterest: string;
  message: string;
};

export function InvestInvitationForm() {
  const { toast } = useToast();
  const createEnquiry = useCreateEnquiry();
  const [phoneCountryId, setPhoneCountryId] = useState<string>("id");
  const [phoneNational, setPhoneNational] = useState("");

  const form = useForm<InvestInvitationValues>({
    defaultValues: {
      fullName: "",
      email: "",
      country: "",
      investmentInterest: "",
      message: "",
    },
  });

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

  const onSubmit = form.handleSubmit(async (values) => {
    const dial = PHONE_COUNTRIES.find((c) => c.id === phoneCountryId)?.dial ?? "+62";
    const fullPhone = buildInternationalPhone(dial, phoneNational);

    const interestLine = values.investmentInterest
      ? `Investment interest: ${values.investmentInterest}`
      : null;
    const optionalNote = values.message.trim() || null;
    const composedMessage = [interestLine, optionalNote].filter(Boolean).join("\n\n") || null;

    try {
      await createEnquiry.mutateAsync({
        data: {
          name: values.fullName.trim(),
          email: values.email.trim(),
          phone: fullPhone.trim() || null,
          country: values.country.trim() || null,
          budgetRange: values.investmentInterest || null,
          message: composedMessage,
          source: "invest_inc_invitation",
        },
      });
      toast({
        title: "Request received",
        description: "We'll send the investor brief privately within 24 hours.",
      });
      form.reset();
      setPhoneCountryId("id");
      setPhoneNational("");
    } catch {
      toast({
        title: "Something went wrong",
        description: "Please try again or email us directly.",
        variant: "destructive",
      });
    }
  });

  const field = "space-y-1.5";
  const controlH = `h-11 ${CONTROL}`;

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className={field}>
        <Label htmlFor="inc-full-name" className={LABEL}>
          Full name
        </Label>
        <Input
          id="inc-full-name"
          autoComplete="name"
          className={controlH}
          placeholder="Your name"
          {...form.register("fullName", { required: true })}
        />
      </div>

      <div className={field}>
        <Label htmlFor="inc-email" className={LABEL}>
          Email
        </Label>
        <Input
          id="inc-email"
          type="email"
          autoComplete="email"
          className={controlH}
          placeholder="you@email.com"
          {...form.register("email", { required: true })}
        />
      </div>

      <div className={field}>
        <Label htmlFor="inc-phone" id="inc-phone-label" className={LABEL}>
          WhatsApp / phone
          {REQ}
        </Label>
        <div
          role="group"
          aria-labelledby="inc-phone-label"
          className={cn(
            "flex h-11 w-full min-w-0 items-stretch overflow-hidden rounded-lg border border-[#1f1d1b]/18 bg-white shadow-sm",
            "focus-within:border-[#0d4542] focus-within:ring-1 focus-within:ring-[#0d4542]/25",
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
            <SelectContent className="z-[60] max-h-60 min-w-[min(100vw-2rem,18rem)] overflow-hidden rounded-xl border border-[#1f1d1b]/10 bg-[#eceae4] p-1 shadow-lg">
              {PHONE_COUNTRIES.map((c) => (
                <SelectItemPrimitive
                  key={c.id}
                  value={c.id}
                  textValue={c.label}
                  title={c.label}
                  className={INVEST_PHONE_SELECT_ITEM}
                >
                  <SelectItemTextPrimitive className="inline-flex shrink-0 items-center text-[1.125rem] leading-none">
                    {c.flag}
                  </SelectItemTextPrimitive>
                  <span className="min-w-0 flex-1 truncate text-left text-sm">{c.countryName}</span>
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
            id="inc-phone"
            type="tel"
            inputMode="tel"
            value={phoneNational}
            onChange={(e) => setPhoneNational(e.target.value)}
            placeholder={phonePlaceholder}
            autoComplete={phoneCountryId === "other" ? "tel" : "tel-national"}
            className={cn(
              "h-11 min-h-0 min-w-0 flex-1 rounded-none border-0 bg-transparent px-3 py-0 text-sm font-normal text-[#1c1917] shadow-none",
              "placeholder:text-[#1c1917]/40 focus-visible:ring-0 focus-visible:ring-offset-0",
            )}
          />
        </div>
      </div>

      <div className={field}>
        <Label htmlFor="inc-country" className={LABEL}>
          Country of residence
        </Label>
        <Input
          id="inc-country"
          autoComplete="country-name"
          className={controlH}
          placeholder="Where you're based"
          {...form.register("country")}
        />
      </div>

      <div className={field}>
        <Label className={LABEL}>Investment interest</Label>
        <Select
          onValueChange={(v) => form.setValue("investmentInterest", v)}
          value={form.watch("investmentInterest") || undefined}
        >
          <SelectTrigger
            className={cn(
              controlH,
              "w-full justify-between font-normal [&>span]:text-[#1c1917] [&>span]:data-[placeholder]:text-[#1c1917]/40",
            )}
          >
            <SelectValue placeholder="Select one..." />
          </SelectTrigger>
          <SelectContent className="z-[60] overflow-hidden rounded-md border border-[#1f1d1b]/18 bg-white p-1 shadow-md">
            {INVESTMENT_INTEREST_OPTIONS.map((opt) => (
              <SelectItem key={opt} value={opt} className={INVEST_SELECT_ITEM}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className={field}>
        <Label htmlFor="inc-message" className={LABEL}>
          Anything we should know? (optional)
        </Label>
        <Textarea
          id="inc-message"
          rows={3}
          className={cn("min-h-[96px] resize-y py-2.5", CONTROL)}
          placeholder="A line about you or your interest."
          {...form.register("message")}
        />
      </div>

      <div className="space-y-3 pt-2">
        <Button
          type="submit"
          disabled={createEnquiry.isPending}
          className="h-11 w-full rounded-lg text-sm font-semibold uppercase tracking-[0.14em] text-white hover:brightness-[1.06] disabled:opacity-60"
          style={{ backgroundColor: INVEST_DARK }}
        >
          {createEnquiry.isPending ? "Sending…" : "Send my request"}
        </Button>
        <p className="text-center font-sans text-[11px] font-light italic leading-relaxed text-[#1c1917]/50">
          Sent privately. Reviewed by Robert within 24 hours.
        </p>
      </div>
    </form>
  );
}
