import SimpleCrud from "../../components/admin/SimpleCrud";
import { BrandAPI } from "../../api/services";

export default function Brands() {
  return <SimpleCrud api={BrandAPI} singular="Brand" plural="Brands" withDescription />;
}
