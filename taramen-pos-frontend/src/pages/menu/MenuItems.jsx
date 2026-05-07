import MenuItemsManager from "@/components/features/menu/MenuItemsManager";
import PosLayout from "@/layout/PosLayout";

export default function MenuItems() {
  return (
    <PosLayout title="Menu Items" description="Manage items, pricing, and availability.">
      <MenuItemsManager />
    </PosLayout>
  );
}
