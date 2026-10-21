import { Languages } from "lucide-react";
import { useLang } from "../../context/LangContext";

export default function LangToggle({ className = "" }) {
  const { toggle, t } = useLang();
  return (
    <button onClick={toggle} className={`btn-outline btn-sm ${className}`} aria-label="Switch language">
      <Languages className="h-4 w-4" /> {t("common.langSwitch")}
    </button>
  );
}
