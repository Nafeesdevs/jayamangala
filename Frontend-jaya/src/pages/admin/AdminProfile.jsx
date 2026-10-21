import ProfileForm from "../../components/common/ProfileForm";
import { PageHeader } from "../../components/admin/AdminKit";

export default function AdminProfile() {
  return (
    <div className="max-w-3xl">
      <PageHeader title="My profile" subtitle="Update your admin details and password" />
      <ProfileForm showAddresses={false} />
    </div>
  );
}
