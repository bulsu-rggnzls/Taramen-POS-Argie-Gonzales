import MenuCategoriesManager from "@/components/features/menu/MenuCategoriesManager";
import PosLayout from "@/layout/PosLayout";

export default function MenuCategories() {
  return (
    <PosLayout title="Menu Categories" description="Organize your menu by category.">
      <MenuCategoriesManager />
    </PosLayout>
  );
}
