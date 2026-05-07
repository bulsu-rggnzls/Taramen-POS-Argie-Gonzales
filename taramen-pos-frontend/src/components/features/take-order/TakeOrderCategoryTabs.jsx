import IButton from "@/components/custom/Button";
import { cn } from "@/lib/utils";
import { useCategoryTabsQuery } from "@/queries/useTakeOrderQueries";
import useTakeOrderStore from "@/stores/useTakeOrderStore";

export default function TakeOrderCategoryTabs() {
  const { data: categoryTabs = [] } = useCategoryTabsQuery();
  const activeCategory = useTakeOrderStore((state) => state.activeCategory);
  const setField = useTakeOrderStore((state) => state.setField);

  return (
    <ul className="mt-6 flex flex-nowrap gap-5 overflow-x-auto pb-2">
      {categoryTabs.map((tab) => {
        const isActive = activeCategory === tab.id;

        return (
          <li key={tab.id} className="w-[8.5rem] flex-none">
            <IButton
              type="button"
              variant="outline"
              showLoading={false}
              className={cn(
                "h-12 w-[8.5rem] whitespace-normal rounded-2xl border px-3 py-2 text-center font-bold leading-tight shadow-none",
                isActive
                  ? "border-black bg-taramen-red text-white hover:bg-taramen-red/90"
                  : "border-gray-950 bg-transparent text-gray-950 hover:border-taramen-red hover:text-taramen-red",
              )}
              onClick={() => setField("activeCategory", tab.id)}
            >
              <span
                className={cn(
                  "line-clamp-2 break-words",
                  tab.label.length > 18 ? "text-[0.65rem]" : "text-xs",
                )}
              >
                {tab.label}
              </span>
            </IButton>
          </li>
        );
      })}
    </ul>
  );
}
