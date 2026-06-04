import { useState } from "react";
import { useForm } from "react-hook-form";
import { useCreateEnquiry } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { PhoneCountryNumberField } from "@/components/site/PhoneCountryNumberField";
import { buildInternationalPhone, DEFAULT_PHONE_COUNTRY_ID, findPhoneCountry } from "@/lib/phone-countries";

const INVEST_DARK = "#0d4542";

const LABEL = "text-[11px] font-semibold uppercase tracking-[0.28em] text-[#0d4542]";
const CONTROL =
  "rounded-lg border border-[#1f1d1b]/18 bg-white text-[#1c1917] shadow-sm placeholder:text-[#1c1917]/40 focus-visible:border-[#0d4542] focus-visible:ring-1 focus-visible:ring-[#0d4542]/25";

type ReportFormValues = {
  fullName: string;
  email: string;
  country: string;
};

export function LocationGuideReportForm() {
  const { toast } = useToast();
  const createEnquiry = useCreateEnquiry();
  const [phoneCountryId, setPhoneCountryId] = useState(DEFAULT_PHONE_COUNTRY_ID);
  const [phoneNational, setPhoneNational] = useState("");

  const form = useForm<ReportFormValues>({
    defaultValues: {
      fullName: "",
      email: "",
      country: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    if (!phoneNational.trim()) {
      toast({
        title: "Phone required",
        description: "Please enter your phone number so we can reach you.",
        variant: "destructive",
      });
      return;
    }

    const dial = findPhoneCountry(phoneCountryId).dial;
    const fullPhone = buildInternationalPhone(dial, phoneNational);

    try {
      await createEnquiry.mutateAsync({
        data: {
          name: values.fullName.trim(),
          email: values.email.trim(),
          phone: fullPhone.trim() || null,
          country: values.country.trim() || null,
          budgetRange: null,
          message: "Bali location guide — market report & property guide request",
          source: "bali_location_guide_report",
        },
      });
      toast({
        title: "Request received",
        description: "We'll send the full report to your inbox shortly.",
      });
      form.reset();
      setPhoneCountryId(DEFAULT_PHONE_COUNTRY_ID);
      setPhoneNational("");
    } catch {
      toast({
        title: "Something went wrong",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    }
  });

  const field = "space-y-1.5";
  const controlH = `h-11 ${CONTROL}`;

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-x-6 md:gap-y-3.5">
      <div className={field}>
        <Label htmlFor="blg-full-name" className={LABEL}>
          Full name <span style={{ color: INVEST_DARK }}>*</span>
        </Label>
        <Input
          id="blg-full-name"
          autoComplete="name"
          className={controlH}
          placeholder="Your full name"
          {...form.register("fullName", { required: true })}
        />
      </div>

      <div className={field}>
        <Label htmlFor="blg-country" className={LABEL}>
          Country
        </Label>
        <Input
          id="blg-country"
          autoComplete="country-name"
          className={controlH}
          placeholder="Where you're based"
          {...form.register("country")}
        />
      </div>

      <div className={field}>
        <Label htmlFor="blg-email" className={LABEL}>
          Email <span style={{ color: INVEST_DARK }}>*</span>
        </Label>
        <Input
          id="blg-email"
          type="email"
          autoComplete="email"
          className={controlH}
          placeholder="you@company.com"
          {...form.register("email", { required: true })}
        />
      </div>

      <div className={field}>
        <Label htmlFor="blg-phone" id="blg-phone-label" className={LABEL}>
          Phone number <span style={{ color: INVEST_DARK }}>*</span>
        </Label>
        <PhoneCountryNumberField
          inputId="blg-phone"
          groupAriaLabelledBy="blg-phone-label"
          countryId={phoneCountryId}
          onCountryIdChange={setPhoneCountryId}
          national={phoneNational}
          onNationalChange={setPhoneNational}
          required
          groupClassName="focus-within:border-[#0d4542] focus-within:ring-[#0d4542]/25"
        />
      </div>

      <div className="flex flex-col items-start gap-4 border-t border-[#0d4542]/10 pt-4 md:col-span-2">
        <p className="max-w-2xl text-[11px] font-light leading-relaxed text-[#1c1917]/55">
          By submitting, you agree we may contact you about this enquiry.
          <br />
          We do not share your details with third parties for marketing.
        </p>
        <Button
          type="submit"
          disabled={createEnquiry.isPending}
          className="h-11 self-center shrink-0 rounded-lg px-8 text-sm font-semibold uppercase tracking-[0.14em] text-white hover:brightness-[1.06] disabled:opacity-60"
          style={{ backgroundColor: INVEST_DARK }}
        >
          {createEnquiry.isPending ? "Sending…" : "Download the Full Report"}
        </Button>
      </div>
    </form>
  );
}
