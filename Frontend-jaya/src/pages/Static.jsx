import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Clock, Mail, MapPin, Phone, Target, Eye } from "lucide-react";
import { useLang } from "../context/LangContext";
import { SITE } from "../config/site";
import { Field } from "../components/common/ui";

const Wrap = ({ title, children, narrow = true }) => (
  <div className={`container-x py-8 sm:py-14 ${narrow ? "max-w-3xl" : ""}`}>
    <h1 className="font-display text-[2rem] font-semibold leading-tight sm:text-5xl">{title}</h1>
    {children}
  </div>
);

export function About() {
  const { t } = useLang();
  return (
    <Wrap title={t("about.title")}>
      <img src="/logo.png" alt="Jayamangala Agro Foods" className="mt-6 h-16 w-auto rounded-xl object-contain shadow-glow" />
      <p className="mt-6 text-ink-soft">{t("about.p1")}</p>
      <p className="mt-4 text-ink-soft">{t("about.p2")}</p>
      <div className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-2">
        <div className="card p-5 sm:p-6"><Target className="h-6 w-6 text-primary-600" /><h3 className="mt-3 font-semibold">{t("about.mission")}</h3><p className="mt-1 text-sm text-ink-soft">{t("about.missionD")}</p></div>
        <div className="card p-5 sm:p-6"><Eye className="h-6 w-6 text-secondary-600" /><h3 className="mt-3 font-semibold">{t("about.vision")}</h3><p className="mt-1 text-sm text-ink-soft">{t("about.visionD")}</p></div>
      </div>
    </Wrap>
  );
}

export function Contact() {
  const { t } = useLang();
  const [f, setF] = useState({ name: "", email: "", message: "" });
  const submit = (e) => { e.preventDefault(); toast.success(t("contact.sent")); setF({ name: "", email: "", message: "" }); };
  const rows = [
    [MapPin, t("contact.visit"), SITE.address], [Phone, t("contact.call"), SITE.phone],
    [Mail, t("contact.mail"), SITE.email], [Clock, t("contact.hours"), SITE.hours],
  ];
  return (
    <Wrap title={t("contact.title")} narrow={false}>
      <p className="mt-2 text-ink-soft">{t("contact.sub")}</p>
      <div className="mt-8 grid gap-6 sm:mt-10 lg:grid-cols-2 lg:gap-8">
        <div className="grid min-w-0 gap-4 md:grid-cols-2 lg:grid-cols-1">
          {rows.map(([Icon, l, v]) => (
            <div key={l} className="card flex min-w-0 gap-4 p-4 sm:p-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary-50 text-secondary-600"><Icon className="h-5 w-5" /></span>
              <div className="min-w-0"><p className="text-xs text-ink-soft">{l}</p><p className="wrap-anywhere font-medium">{v}</p></div>
            </div>
          ))}
        </div>
        <form onSubmit={submit} className="card min-w-0 space-y-4 p-5 sm:p-6">
          <h2 className="font-semibold">{t("contact.form")}</h2>
          <Field label={t("auth.name")}><input className="input" required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
          <Field label={t("auth.email")}><input className="input" type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
          <Field label={t("contact.msg")}><textarea className="input min-h-[120px]" required value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} /></Field>
          <button className="btn-primary">{t("contact.send")}</button>
        </form>
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
