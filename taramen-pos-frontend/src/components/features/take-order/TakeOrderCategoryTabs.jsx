import IButton from "@/components/custom/Button";
import { cn } from "@/lib/utils";
import { useCategoryTabsQuery } from "@/queries/useTakeOrderQueries";
import useTakeOrderStore from "@/stores/useTakeOrderStore";

export default function TakeOrderCategoryTabs() {
  const { data: categoryTabs = [] } = useCategoryTabsQuery();
  const activeCategory = useTakeOrderStore((state) => state.activeCategory);
  const setField = useTakeOrderStore((state) => state.setField);

  return (
    <ul className="mt-5 flex flex-nowrap gap-2 overflow-x-auto pb-2">
      {categoryTabs.map((tab) => {
        const isActive = activeCategory === tab.id;
        const CategoryIcon = tab.icon;

        return (
          <li key={tab.id}>
            <IButton
              type="button"
              variant="outline"
              showLoading={false}
              className={cn(
                "h-9 rounded-full border px-4 text-sm font-semibold",
                isActive
                  ? "border-transparent bg-taramen-red text-white shadow-sm hover:bg-taramen-red/90"
                  : "border-gray-200 bg-white text-gray-700 hover:border-orange/40 hover:text-taramen-red",
              )}
              onClick={() => setField("activeCategory", tab.id)}
            >
              <CategoryIcon className="size-4" />
              <span>{tab.label}</span>
            </IButton>
          </li>
        );
      })}
    </ul>
  );
}
