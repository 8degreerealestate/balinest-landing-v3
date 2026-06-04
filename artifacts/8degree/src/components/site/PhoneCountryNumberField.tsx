import { useMemo } from "react";
import { Check } from "lucide-react";
import {
  ItemIndicator as SelectItemIndicatorPrimitive,
  ItemText as SelectItemTextPrimitive,
  Item as SelectItemPrimitive,
} from "@radix-ui/react-select";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  findPhoneCountry,
  PHONE_COUNTRIES,
  phoneNationalPlaceholder,
  PHONE_SELECT_ITEM_CLASS,
} from "@/lib/phone-countries";

type PhoneCountryNumberFieldProps = {
  inputId: string;
  countryId: string;
  onCountryIdChange: (id: string) => void;
  national: string;
  onNationalChange: (value: string) => void;
  required?: boolean;
  hint?: React.ReactNode;
  groupClassName?: string;
  selectContentClassName?: string;
  /** When set, the phone group uses `aria-labelledby` instead of a generic label. */
  groupAriaLabelledBy?: string;
};

export function PhoneCountryNumberField({
  inputId,
  countryId,
  onCountryIdChange,
  national,
  onNationalChange,
  required,
  hint,
  groupClassName,
  selectContentClassName,
  groupAriaLabelledBy,
}: PhoneCountryNumberFieldProps) {
  const selectedCountry = useMemo(() => findPhoneCountry(countryId), [countryId]);
  const placeholder = useMemo(() => phoneNationalPlaceholder(countryId), [countryId]);

  return (
    <div className="space-y-1.5">
      <div
        role="group"
        {...(groupAriaLabelledBy
          ? { "aria-labelledby": groupAriaLabelledBy }
          : { "aria-label": `Phone number, ${selectedCountry.label}` })}
        className={cn(
          "flex h-11 w-full min-w-0 items-stretch overflow-hidden rounded-lg border border-[#1f1d1b]/18 bg-white shadow-sm",
          "focus-within:border-[#01514E] focus-within:ring-1 focus-within:ring-[#01514E]/25",
          groupClassName,
        )}
      >
        <Select value={countryId} onValueChange={onCountryIdChange}>
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
          <SelectContent
            className={cn(
              "z-[60] max-h-[min(18rem,55vh)] min-w-[min(100vw-2rem,20rem)]",
              selectContentClassName,
            )}
          >
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
                <span className="min-w-0 flex-1 truncate text-left text-sm text-[#1c1917]">
                  {c.countryName}
                </span>
                <span className="shrink-0 tabular-nums text-xs text-[#1c1917]/55">{c.dial}</span>
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
          id={inputId}
          type="tel"
          inputMode="tel"
          value={national}
          onChange={(e) => onNationalChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          autoComplete="tel-national"
          className={cn(
            "h-11 min-h-0 min-w-0 flex-1 rounded-none border-0 bg-transparent px-3 py-0 text-sm font-normal text-[#1c1917] shadow-none",
            "placeholder:text-[#1c1917]/40 focus-visible:ring-0 focus-visible:ring-offset-0",
          )}
        />
      </div>
      {hint}
    </div>
  );
}
