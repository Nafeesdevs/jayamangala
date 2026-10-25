import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { CheckCircle2, Clock, Mail, MapPin, Phone, Target, Eye } from "lucide-react";
import { useLang } from "../context/LangContext";
import { SITE } from "../config/site";
import { Field, Spinner } from "../components/common/ui";
import { usePageMeta } from "../hooks/usePageMeta";
import { LeadAPI } from "../api/services";
import { errMsg } from "../api/client";
import { track } from "../hooks/useAnalytics";

const Wrap = ({ title, children, narrow = true, noGap = false }) => (
  <div className={`container-x py-8 sm:py-14 ${narrow ? "max-w-3xl" : ""}`}>
    <h1 className="font-display text-[2rem] font-semibold leading-tight sm:text-5xl">{title}</h1>
    {children}
  </div>
);

export function About() {
  const { t } = useLang();
  usePageMeta("About Us", "Learn about Jayamangala Agro Foods — quality edible oils and food products from Kumbakonam, Tamil Nadu since 1995.");
  return (
    <div className="w-full overflow-x-hidden py-6 sm:py-10">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-6 md:px-8">
        <div className="grid items-start gap-8 lg:grid-cols-12 lg:gap-8 xl:gap-10">
          {/* Left column: Brand story, details, mission & vision */}
          <div className="w-full min-w-0 break-words lg:col-span-5">
            <h1 className="font-display text-[2rem] font-semibold leading-tight sm:text-5xl">{t("about.title")}</h1>
            <img src="/logo.png" alt="Jayamangala Agro Foods" className="mt-3.5 h-14 sm:h-16 w-auto rounded-xl object-contain shadow-glow" />
            <p className="mt-4 text-sm leading-relaxed text-ink-soft sm:text-base break-words">{t("about.p1")}</p>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft sm:text-base break-words">{t("about.p2")}</p>
            {t("about.p3") && <p className="mt-3 text-sm leading-relaxed text-ink-soft sm:text-base break-words">{t("about.p3")}</p>}
            
            {/* Trust Highlights Checklist */}
            <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              {[
                { label: "100% Cold Pressed Oils", sub: "Groundnut, Sesame & Coconut" },
                { label: "Aarvikaa Fresh Dairy", sub: "Farm Milk, Curd & Dairy" },
                { label: "Food Provisions & Staples", sub: "Grains, Pulses & Pooja Essentials" }
              ].map((item, idx) => (
                <div key={idx} className="w-full min-w-0 rounded-xl border border-cream-sand bg-white/70 p-3 shadow-sm backdrop-blur">
                  <p className="text-xs font-bold text-secondary-800 break-words">✓ {item.label}</p>
                  <p className="text-[11px] text-ink-faint mt-0.5 break-words">{item.sub}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="card w-full min-w-0 p-4 sm:p-6">
                <Target className="h-6 w-6 text-primary-600" />
                <h3 className="mt-2.5 font-semibold text-secondary-800 break-words">{t("about.mission")}</h3>
                <p className="mt-1 text-sm text-ink-soft leading-relaxed break-words">{t("about.missionD")}</p>
              </div>
              <div className="card w-full min-w-0 p-4 sm:p-6">
                <Eye className="h-6 w-6 text-secondary-600" />
                <h3 className="mt-2.5 font-semibold text-secondary-800 break-words">{t("about.vision")}</h3>
                <p className="mt-1 text-sm text-ink-soft leading-relaxed break-words">{t("about.visionD")}</p>
              </div>
            </div>
          </div>

          {/* Right column: Wide Storefront Showcase Card (Fully responsive across all screen sizes) */}
          <div className="w-full min-w-0 lg:col-span-7 lg:-mt-2 lg:-mr-4 xl:-mr-8">
            <div className="group relative w-full overflow-hidden rounded-[2rem_.6rem_2rem_.6rem] sm:rounded-[2.5rem_.8rem_2.5rem_.8rem] border border-cream-sand bg-white p-2.5 sm:p-3 shadow-lift transition-all duration-500 hover:-translate-y-1">
              <div className="relative aspect-[4/3] w-full min-h-[260px] sm:min-h-[460px] md:min-h-[500px] lg:min-h-[540px] overflow-hidden rounded-[1.6rem_.5rem_1.6rem_.5rem] sm:rounded-[2rem_.6rem_2rem_.6rem] bg-cream-deep/60">
                <img 
                  src="/images/jayamangala-store.jpg" 
                  alt="Jayamangala Agro Foods Storefront" 
                  className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-secondary-900/90 via-secondary-900/30 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white sm:bottom-6 sm:left-6 sm:right-6">
                  <span className="inline-block rounded-full bg-primary-600 px-3 py-1 text-[11px] sm:text-xs font-bold tracking-wide uppercase shadow-sm">
                    Kumbakonam Store & Online
                  </span>
                  <h4 className="mt-2 font-display text-lg font-bold leading-snug sm:text-2xl text-white">
                    Pure Oils · Fresh Milk · Daily Foods
                  </h4>
                  <p className="mt-1 text-[11px] sm:text-xs text-white/90">
                    Serving thousands of happy families and businesses since 1995.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Contact() {
  const { t, lang } = useLang();
  usePageMeta("Contact Us", "Get in touch with Jayamangala Agro Foods. Visit us at Kumbakonam or call +91 93443 02121.");
  const [f, setF] = useState({ name: "", phone: "", email: "", message: "" });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!f.name.trim()) return toast.error(lang === "ta" ? "பெயர் தேவை" : "Name is required");
    if (!/^\d{10}$/.test(f.phone.replace(/[\s\-()]/g, ""))) {
      return toast.error(lang === "ta" ? "சரியான 10 இலக்க தொலைபேசி எண் தேவை" : "Enter a valid 10-digit phone number");
    }
    if (!f.message.trim()) return toast.error(lang === "ta" ? "செய்தி தேவை" : "Message is required");

    setBusy(true);
    try {
      await LeadAPI.contact({
        name: f.name.trim(),
        phone: f.phone.trim(),
        email: f.email.trim(),
        message: f.message.trim(),
      });
      track("contact_submit");
      setDone(true);
    } catch (err) {
      toast.error(errMsg(err) || (lang === "ta" ? "சமர்ப்பிக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்." : "Submission failed. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  const rows = [
    [MapPin, t("contact.visit"), SITE.address, null],
    [Phone, t("contact.call"), SITE.phone, `tel:${SITE.phone.replace(/\s/g, "")}`],
    [Mail, t("contact.mail"), SITE.email, `mailto:${SITE.email}`],
    [Clock, t("contact.hours"), SITE.hours, null],
  ];

  return (
    <Wrap title={t("contact.title")} narrow={false}>
      <p className="mt-2 text-ink-soft">{t("contact.sub")}</p>
      <div className="mt-8 grid gap-6 sm:mt-10 lg:grid-cols-2 lg:gap-8">
        <div className="grid min-w-0 gap-4 md:grid-cols-2 lg:grid-cols-1">
          {rows.map(([Icon, l, v, href]) => (
            <div key={l} className="card flex min-w-0 gap-4 p-4 sm:p-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary-50 text-secondary-600"><Icon className="h-5 w-5" /></span>
              <div className="min-w-0"><p className="text-xs text-ink-soft">{l}</p>
                {href ? <a href={href} className="wrap-anywhere font-medium hover:text-primary-600">{v}</a> : <p className="wrap-anywhere font-medium">{v}</p>}
              </div>
            </div>
          ))}
        </div>

        {done ? (
          <div className="card flex flex-col items-center justify-center gap-4 p-8 text-center">
            <CheckCircle2 className="h-14 w-14 text-secondary-600" />
            <h2 className="font-display text-2xl font-bold text-secondary-700">
              {lang === "ta" ? "நன்றி!" : "Thank you!"}
            </h2>
            <p className="text-sm text-ink-soft">
              {lang === "ta"
                ? "உங்கள் செய்தி அனுப்பப்பட்டது. நாங்கள் விரைவில் தொடர்பு கொள்வோம்."
                : "Your message has been saved. We'll get back to you shortly."}
            </p>
            <button className="btn-outline mt-2" onClick={() => { setDone(false); setF({ name: "", phone: "", email: "", message: "" }); }}>
              {lang === "ta" ? "மற்றொரு செய்தி அனுப்பு" : "Send another message"}
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="card min-w-0 space-y-4 p-5 sm:p-6">
            <h2 className="font-semibold">{t("contact.form")}</h2>
            <Field label={lang === "ta" ? "பெயர் *" : "Name *"}>
              <input className="input" required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} maxLength={100} />
            </Field>
            <Field label={lang === "ta" ? "தொலைபேசி எண் *" : "Phone Number *"}>
              <input className="input" type="tel" required inputMode="numeric" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} maxLength={15} />
            </Field>
            <Field label={t("auth.email")}>
              <input className="input" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} maxLength={200} />
            </Field>
            <Field label={lang === "ta" ? "செய்தி *" : "Message *"}>
              <textarea className="input min-h-[120px]" required value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} maxLength={2000} />
              <p className="mt-1 text-right text-xs text-ink-faint">{f.message.length}/2000</p>
            </Field>
            <button className="btn-primary w-full" disabled={busy}>
              {busy ? <><Spinner className="h-4 w-4 !text-white" />{lang === "ta" ? "அனுப்புகிறது…" : "Sending…"}</> : t("contact.send")}
            </button>
          </form>
        )}
      </div>
    </Wrap>
  );
}

const legal = {
  terms: {
    en: [
      ["Using our store", "By placing an order you confirm that the details you give are correct and that you are at least 18 years old or ordering with a guardian’s consent."],
      ["Prices and availability", "Prices are shown in Indian rupees and may change without notice. An order is confirmed only when stock is available and, for UPI orders, your payment has been verified."],
      ["Payments", "We accept cash on delivery and UPI QR payments. For UPI orders you must upload a clear screenshot of the successful transaction. Orders with a rejected payment are cancelled."],
      ["Delivery", "Delivery times are estimates. Please make sure someone is available to receive the order at the address you provide."],
      ["Cancellations and returns", "You can cancel an order from My Orders until it is shipped. For damaged or wrong items, contact us within 48 hours of delivery."],
      ["Contact", `Questions about these terms? Write to ${SITE.email}.`],
    ],
    ta: [
      ["எங்கள் கடையைப் பயன்படுத்துதல்", "ஆர்டர் செய்வதன் மூலம் நீங்கள் வழங்கும் விவரங்கள் சரியானவை என்றும், உங்களுக்கு 18 வயது நிரம்பியுள்ளது அல்லது பாதுகாவலரின் ஒப்புதலுடன் ஆர்டர் செய்கிறீர்கள் என்றும் உறுதிப்படுத்துகிறீர்கள்."],
      ["விலை மற்றும் இருப்பு", "விலைகள் இந்திய ரூபாயில் காட்டப்படுகின்றன; முன்னறிவிப்பின்றி மாறலாம். இருப்பு இருந்தால் மட்டுமே ஆர்டர் உறுதி செய்யப்படும்; UPI ஆர்டர்களுக்கு கட்டணம் சரிபார்க்கப்பட்ட பின் உறுதியாகும்."],
      ["கட்டணங்கள்", "கேஷ் ஆன் டெலிவரி மற்றும் UPI QR கட்டணங்களை ஏற்கிறோம். UPI ஆர்டர்களுக்கு வெற்றிகரமான பரிவர்த்தனையின் தெளிவான ஸ்கிரீன்ஷாட்டை பதிவேற்ற வேண்டும். கட்டணம் நிராகரிக்கப்பட்டால் ஆர்டர் ரத்து செய்யப்படும்."],
      ["டெலிவரி", "டெலிவரி நேரங்கள் மதிப்பீடுகளே. நீங்கள் வழங்கும் முகவரியில் ஆர்டரைப் பெற ஒருவர் இருப்பதை உறுதிசெய்யுங்கள்."],
      ["ரத்து மற்றும் திரும்பப் பெறுதல்", "அனுப்பப்படும் வரை என் ஆர்டர்கள் பக்கத்தில் ஆர்டரை ரத்து செய்யலாம். சேதமடைந்த அல்லது தவறான பொருட்களுக்கு டெலிவரி ஆன 48 மணி நேரத்திற்குள் தொடர்பு கொள்ளுங்கள்."],
      ["தொடர்பு", `இந்த விதிமுறைகள் குறித்த கேள்விகளுக்கு ${SITE.email} க்கு எழுதுங்கள்.`],
    ],
  },
  privacy: {
    en: [
      ["What we collect", "Your name, phone number, email, delivery addresses, order history and, for UPI payments, the payment screenshot you upload."],
      ["How we use it", "To create your account, deliver your orders, verify payments, provide support and send order updates."],
      ["Sharing", "We do not sell your data. Delivery details are shared only with the people who pack and deliver your order. Images are stored with our cloud image provider."],
      ["Security", "Passwords are stored encrypted and sessions use secure tokens. Keep your password private and log out on shared devices."],
      ["Your choices", "You can update your details from your profile at any time, or ask us to delete your account."],
      ["Contact", `Privacy questions? Write to ${SITE.email}.`],
    ],
    ta: [
      ["நாங்கள் சேகரிப்பவை", "உங்கள் பெயர், தொலைபேசி எண், மின்னஞ்சல், டெலிவரி முகவரிகள், ஆர்டர் வரலாறு மற்றும் UPI கட்டணங்களுக்கு நீங்கள் பதிவேற்றும் ஸ்கிரீன்ஷாட்."],
      ["எவ்வாறு பயன்படுத்துகிறோம்", "கணக்கை உருவாக்க, ஆர்டர்களை டெலிவரி செய்ய, கட்டணங்களைச் சரிபார்க்க, உதவி வழங்க மற்றும் ஆர்டர் தகவல்களை அனுப்ப."],
      ["பகிர்வு", "உங்கள் தரவை நாங்கள் விற்பதில்லை. உங்கள் ஆர்டரைப் பேக் செய்து டெலிவரி செய்பவர்களுடன் மட்டுமே டெலிவரி விவரங்கள் பகிரப்படும். படங்கள் எங்கள் கிளவுட் பட சேவையில் சேமிக்கப்படுகின்றன."],
      ["பாதுகாப்பு", "கடவுச்சொற்கள் குறியாக்கம் செய்யப்பட்டு சேமிக்கப்படும்; பாதுகாப்பான டோக்கன்கள் பயன்படுத்தப்படும். கடவுச்சொல்லை ரகசியமாக வைத்து, பொதுவான சாதனங்களில் வெளியேறுங்கள்."],
      ["உங்கள் தேர்வுகள்", "சுயவிவரப் பக்கத்தில் எப்போது வேண்டுமானாலும் விவரங்களைப் புதுப்பிக்கலாம் அல்லது கணக்கை நீக்கக் கோரலாம்."],
      ["தொடர்பு", `தனியுரிமை கேள்விகளுக்கு ${SITE.email} க்கு எழுதுங்கள்.`],
    ],
  },
};

function Legal({ kind, titleKey }) {
  const { t, lang } = useLang();
  return (
    <Wrap title={t(titleKey)}>
      <p className="mt-2 text-sm text-ink-faint">{t("legal.updated")}</p>
      <div className="mt-8 space-y-7">
        {legal[kind][lang].map(([h, p]) => (
          <section key={h}><h2 className="text-lg font-semibold">{h}</h2><p className="mt-2 leading-relaxed text-ink-soft">{p}</p></section>
        ))}
      </div>
    </Wrap>
  );
}
export const Terms = () => <Legal kind="terms" titleKey="terms.title" />;
export const Privacy = () => <Legal kind="privacy" titleKey="privacy.title" />;

export function NotFound() {
  const { t } = useLang();
  return (
    <div className="container-x py-16 text-center sm:py-24">
      <p className="text-6xl font-extrabold text-primary-600">404</p>
      <h1 className="mt-4 font-display text-3xl font-bold text-secondary-700">{t("err.404")}</h1>
      <p className="mt-2 text-ink-soft">{t("err.404d")}</p>
      <Link to="/" className="btn-primary mt-6">{t("err.home")}</Link>
    </div>
  );
}
