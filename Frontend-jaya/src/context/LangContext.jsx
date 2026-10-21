import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { en, ta } from "../i18n/translations";

const LangContext = createContext(null);
const dict = { en, ta };

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem("lang") || "en");

  useEffect(() => {
    localStorage.setItem("lang", lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const t = useCallback(
    (key, vars) => {
      let s = dict[lang][key] ?? en[key] ?? key;
      if (vars) Object.entries(vars).forEach(([k, v]) => (s = s.replace(`{${k}}`, v)));
      return s;
    },
    [lang]
  );

  // pick the right language from { en, ta } objects
  const tx = useCallback((obj) => (obj ? obj[lang] ?? obj.en : ""), [lang]);

  const value = useMemo(
    () => ({ lang, t, tx, toggle: () => setLang((l) => (l === "en" ? "ta" : "en")) }),
    [lang, t, tx]
  );
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);
