import { motion } from "framer-motion";
import { MapPin, Phone, Mail, MessageCircle } from "lucide-react";
import { useCreateEnquiry } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { Seo } from "@/components/site/Seo";
import { truncateForMeta } from "@/lib/site-seo";
import { type SiteLanguage, useSiteLanguage } from "@/lib/site-language";
import {
  buildWhatsappUrl,
  getContactEmail,
  getContactPhoneDisplay,
} from "@/lib/site-contact";

const CONTACT_COPY: Record<SiteLanguage, Record<string, string>> = {
  en: { letsTalk: "Let's Talk", getInTouch: "Get in Touch", chat: "Chat on WhatsApp", send: "Send Message", sending: "Sending...", budget: "Investment Budget" },
  id: { letsTalk: "Mari Bicara", getInTouch: "Hubungi Kami", chat: "Chat di WhatsApp", send: "Kirim Pesan", sending: "Mengirim...", budget: "Anggaran Investasi" },
  fr: { letsTalk: "Parlons", getInTouch: "Contactez-nous", chat: "Chat WhatsApp", send: "Envoyer", sending: "Envoi...", budget: "Budget d'Investissement" },
  zh: { letsTalk: "联系我们", getInTouch: "立即咨询", chat: "WhatsApp 咨询", send: "发送信息", sending: "发送中...", budget: "投资预算" },
  tr: { letsTalk: "Konusalim", getInTouch: "Iletisime Gecin", chat: "WhatsApp'ta Sohbet", send: "Mesaj Gonder", sending: "Gonderiliyor...", budget: "Yatirim Butcesi" },
};

export default function Contact() {
  const language = useSiteLanguage();
  const t = CONTACT_COPY[language];
  const createEnquiry = useCreateEnquiry();
  const { toast } = useToast();

  const form = useForm({
    defaultValues: { name: "", email: "", phone: "", country: "", budgetRange: "", message: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await createEnquiry.mutateAsync({
        data: {
          name: values.name,
          email: values.email,
          phone: values.phone || null,
          country: values.country || null,
          budgetRange: values.budgetRange || null,
          message: values.message || null,
          source: "contact_page",
        },
      });
      toast({ title: "Message received", description: "We will be in touch within 24 hours." });
      form.reset();
    } catch {
      toast({ title: "Error", description: "Please try again.", variant: "destructive" });
    }
  });

  const contactEmail = getContactEmail();
  const contactPhone = getContactPhoneDisplay();
  const contactDetails = [
    { icon: MapPin, label: "Location", value: "Jalan Laksmana 88, Seminyak, Bali, Indonesia 80361" },
    { icon: Mail, label: "Email", value: contactEmail },
    { icon: Phone, label: "Phone", value: contactPhone },
    { icon: MessageCircle, label: "WhatsApp", value: contactPhone },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Contact · enquire about Bali property"
        description={truncateForMeta(
          "Contact 8 Degree in Seminyak for villa sales, developments, and investment enquiries across Bali.",
        )}
        path="/contact"
      />
      <div className="bg-foreground text-background pt-32 pb-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs tracking-[0.3em] uppercase text-primary mb-4"
          >
            {t.letsTalk}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-serif text-4xl md:text-6xl leading-tight"
          >
            {t.getInTouch}
          </motion.h1>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-6 py-16">
        <div className="grid md:grid-cols-5 gap-16">
          {/* Contact Info */}
          <div className="md:col-span-2">
            <p className="text-muted-foreground leading-relaxed mb-8">
              8 Degree is a boutique advisory. Whether you are focused on portfolio performance, relocation, or high-value transactions, we respond with structured guidance. We aim to reply within one business day.
            </p>
            <div className="space-y-6">
              {contactDetails.map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-8 h-8 border border-border flex items-center justify-center shrink-0">
                    <item.icon size={14} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground tracking-[0.2em] uppercase mb-1">{item.label}</p>
                    <p className="text-sm">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 pt-8 border-t border-border">
              <a href={buildWhatsappUrl()} target="_blank" rel="noopener noreferrer">
                <Button className="w-full rounded-none tracking-widest uppercase h-12" data-testid="button-whatsapp-contact">
                  <MessageCircle size={16} className="mr-2" />
                  {t.chat}
                </Button>
              </a>
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-3">
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  placeholder="Full Name *"
                  {...form.register("name", { required: true })}
                  className="rounded-none"
                  data-testid="input-name"
                />
                <Input
                  placeholder="Email Address *"
                  type="email"
                  {...form.register("email", { required: true })}
                  className="rounded-none"
                  data-testid="input-email"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  placeholder="Phone / WhatsApp"
                  {...form.register("phone")}
                  className="rounded-none"
                  data-testid="input-phone"
                />
                <Input
                  placeholder="Country"
                  {...form.register("country")}
                  className="rounded-none"
                  data-testid="input-country"
                />
              </div>
              <Select onValueChange={(v) => form.setValue("budgetRange", v)}>
                <SelectTrigger className="rounded-none w-full" data-testid="select-budget">
                  <SelectValue placeholder={t.budget} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Under $300,000">Under $300,000</SelectItem>
                  <SelectItem value="$300,000 - $500,000">$300,000 – $500,000</SelectItem>
                  <SelectItem value="$500,000 - $750,000">$500,000 – $750,000</SelectItem>
                  <SelectItem value="$750,000 - $1,000,000">$750,000 – $1M</SelectItem>
                  <SelectItem value="Over $1,000,000">Over $1M</SelectItem>
                </SelectContent>
              </Select>
              <Textarea
                placeholder="Your message: tell us about your investment objectives or any questions you have..."
                {...form.register("message")}
                className="rounded-none resize-none h-36"
                data-testid="textarea-message"
              />
              <Button
                type="submit"
                className="w-full rounded-none tracking-widest uppercase h-12"
                disabled={createEnquiry.isPending}
                data-testid="button-submit"
              >
                {createEnquiry.isPending ? t.sending : t.send}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                We respond to every enquiry within one business day.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
