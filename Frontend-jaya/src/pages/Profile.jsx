import ProfileForm from "../components/common/ProfileForm";
import { useLang } from "../context/LangContext";

export default function Profile() {
  const { t } = useLang();
  return (
    <div className="container-x max-w-3xl py-6 sm:py-12">
      <h1 className="mb-6 font-display text-3xl font-bold text-secondary-700 sm:text-4xl">{t("pf.title")}</h1>
      <ProfileForm />
    </div>
  );
}
