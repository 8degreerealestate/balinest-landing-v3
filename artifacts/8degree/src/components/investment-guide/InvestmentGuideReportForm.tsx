import { useMemo, useState } from "react";
import { Check } from "lucide-react";
import { useForm } from "react-hook-form";
import { useCreateEnquiry } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItemIndicatorPrimitive,
  SelectItemPrimitive,
  SelectItemTextPrimitive,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { buildInternationalPhone, PHONE_COUNTRIES, PHONE_SELECT_ITEM_CLASS } from "@/lib/phone-countries";
import { cn } from "@/lib/utils";

const INVEST_DARK = "#0d4542";

const LABEL = "text-[11px] font-semibold uppercase tracking-[0.28em] text-[#0d4542]";
const CONTROL =
  "rounded-lg border border-[#1f1d1b]/18 bg-white text-[#1c1917] shadow-sm placeholder:text-[#1c1917]/40 focus-visible:border-[#0d4542] focus-visible:ring-1 focus-visible:ring-[#0d4542]/25";

const REQ = (
  <span className="ml-1 inline-block translate-y-[-1px] text-[0.45rem] leading-none text-[#0d4542]">◆</span>
);

type ReportFormValues = {
  fullName: string;
  email: string;
  country: string;
};

export function InvestmentGuideReportForm() {
  const { toast } = useToast();
  const createEnquiry = useCreateEnquiry();
  const [phoneCountryId, setPhoneCountryId] = useState<string>("id");
  const [phoneNational, setPhoneNational] = useState("");

  const form = useForm<ReportFormValues>({
    defaultValues: {
      fullName: "",
      email: "",
      country: "",
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

    try {
      await createEnquiry.mutateAsync({
        data: {
          name: values.fullName.trim(),
          email: values.email.trim(),
          phone: fullPhone.trim() || null,
          country: values.country.trim() || null,
          budgetRange: null,
          message: "Investment guide report download request",
          source: "investment_guide_report",
        },
      });
      toast({
        title: "Request received",
        description: "We'll send the full report to your inbox shortly.",
      });
      form.reset();
      setPhoneCountryId("id");
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
        <Label htmlFor="ig-full-name" className={LABEL}>
          Full name <span style={{ color: INVEST_DARK }}>*</span>
        </Label>
        <Input
          id="ig-full-name"
          autoComplete="name"
          className={controlH}
          placeholder="Your full name"
          {...form.register("fullName", { required: true })}
        />
      </div>

      <div className={field}>
        <Label htmlFor="ig-country" className={LABEL}>
          Country
        </Label>
        <Input
          id="ig-country"
          autoComplete="country-name"
          className={controlH}
          placeholder="Where you're based"
          {...form.register("country")}
        />
      </div>

      <div className={field}>
        <Label htmlFor="ig-email" className={LABEL}>
          Email <span style={{ color: INVEST_DARK }}>*</span>
        </Label>
        <Input
          id="ig-email"
          type="email"
          autoComplete="email"
          className={controlH}
          placeholder="you@company.com"
          {...form.register("email", { required: true })}
        />
      </div>

      <div className={field}>
        <Label htmlFor="ig-phone" id="ig-phone-label" className={LABEL}>
          Phone number
          {REQ}
        </Label>
        <div
          role="group"
          aria-labelledby="ig-phone-label"
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
            id="ig-phone"
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
