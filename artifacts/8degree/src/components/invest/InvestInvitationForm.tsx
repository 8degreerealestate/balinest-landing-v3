import { useState } from "react";
import { useForm } from "react-hook-form";
import { useCreateEnquiry } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { PhoneCountryNumberField } from "@/components/site/PhoneCountryNumberField";
import { buildInternationalPhone, DEFAULT_PHONE_COUNTRY_ID, findPhoneCountry } from "@/lib/phone-countries";
import { cn } from "@/lib/utils";

const INVEST_DARK = "#0d4542";

const LABEL = "text-[11px] font-semibold uppercase tracking-[0.28em] text-[#0d4542]";
const CONTROL =
  "rounded-lg border border-[#1f1d1b]/18 bg-white text-[#1c1917] shadow-sm placeholder:text-[#1c1917]/40 focus-visible:border-[#0d4542] focus-visible:ring-1 focus-visible:ring-[#0d4542]/25";

const INVEST_SELECT_ITEM =
  "relative cursor-default select-none rounded-sm py-2 pl-8 pr-3 text-sm font-normal text-[#1c1917] outline-none data-[highlighted]:bg-[#E0FDAC] data-[highlighted]:text-[#1c1917] focus:bg-[#E0FDAC] focus:text-[#1c1917] data-[disabled]:pointer-events-none data-[disabled]:opacity-50";

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
  const [phoneCountryId, setPhoneCountryId] = useState(DEFAULT_PHONE_COUNTRY_ID);
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

  const onSubmit = form.handleSubmit(async (values) => {
    const dial = findPhoneCountry(phoneCountryId).dial;
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
      setPhoneCountryId(DEFAULT_PHONE_COUNTRY_ID);
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
        <PhoneCountryNumberField
          inputId="inc-phone"
          groupAriaLabelledBy="inc-phone-label"
          countryId={phoneCountryId}
          onCountryIdChange={setPhoneCountryId}
          national={phoneNational}
          onNationalChange={setPhoneNational}
          required
          groupClassName="focus-within:border-[#0d4542] focus-within:ring-[#0d4542]/25"
          selectContentClassName="overflow-hidden rounded-xl border border-[#1f1d1b]/10 bg-[#eceae4] p-1 shadow-lg"
        />
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
