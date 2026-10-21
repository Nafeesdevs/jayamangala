import SimpleCrud from "../../components/admin/SimpleCrud";
import { CategoryAPI } from "../../api/services";

export default function Categories() {
  return <SimpleCrud api={CategoryAPI} singular="Category" plural="Categories" />;
}
