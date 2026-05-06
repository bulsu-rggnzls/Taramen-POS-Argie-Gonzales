import { useEffect, useMemo, useState } from "react";

import MenuGridSkeleton from "@/components/custom/MenuGridSkeleton";
import Paragraph from "@/components/custom/Paragraph";
import Title from "@/components/custom/Title";
import { cn } from "@/lib/utils";
import {
  ITEM_ACCENTS,
  ITEM_IMAGE_POSITIONS,
} from "@/pages/take-order/take-order-config";
import { formatCurrency } from "@/shared/helpers/takeOrder";
import { useAvailableMenuItemsQuery } from "@/queries/useTakeOrderQueries";
import { useDebounce } from "@/shared/hooks/useDebounce";
import useTakeOrderStore from "@/stores/useTakeOrderStore";

export default function MenuGrid() {
  const menuItemsQuery = useAvailableMenuItemsQuery();
  const activeCategory = useTakeOrderStore((state) => state.activeCategory);
  const addItem = useTakeOrderStore((state) => state.addItem);
  const searchTerm = useTakeOrderStore((state) => state.searchTerm);
  const orderItems = useTakeOrderStore((state) => state.orderItems);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [showInitialSkeleton, setShowInitialSkeleton] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowInitialSkeleton(false);
    }, 450);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  const items = useMemo(() => {
    const term = debouncedSearchTerm.trim().toLowerCase();

    return (menuItemsQuery.data ?? [])
      .filter((item) => item.available)
      .map((item, index) => ({
        ...item,
        accent: ITEM_ACCENTS[index % ITEM_ACCENTS.length],
        imagePosition: ITEM_IMAGE_POSITIONS[index % ITEM_IMAGE_POSITIONS.length],
      }))
      .filter((item) => {
        const matchesCategory =
          activeCategory === "all" ||
          String(item.category_id) === String(activeCategory);
        if (!matchesCategory) return false;
        if (!term) return true;

        return (
          item.name.toLowerCase().includes(term) ||
          String(item.description ?? "").toLowerCase().includes(term)
        );
      });
  }, [activeCategory, debouncedSearchTerm, menuItemsQuery.data]);

  const isItemSelected = (itemId) => {
    return orderItems.some((orderItem) => orderItem.id === itemId);
  };

  return (
    <div className="mt-5">
      {showInitialSkeleton || menuItemsQuery.isLoading ? (
        <MenuGridSkeleton />
      ) : (
        <ul className="grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <li
              key={item.id}
              className={cn(
                "overflow-hidden rounded-md bg-white shadow-[0_3px_9px_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5 hover:shadow-[0_5px_14px_rgba(0,0,0,0.22)]",
                isItemSelected(item.id) && "border-2 border-taramen-red"
              )}
            >
              <button
                type="button"
                className="w-full text-left"
                onClick={() => addItem(item)}
              >
                <div className="relative h-[6.8rem] w-full overflow-hidden bg-gray-200">
                  <img
                    src="/taramen-bg.jpg"
                    alt=""
                    className={cn("h-full w-full object-cover", item.imagePosition)}
                  />
                  <div
                    className={cn(
                      "absolute inset-0 bg-gradient-to-br opacity-20",
                      item.accent,
                    )}
                  />
                </div>
                <div className="min-h-[3.8rem] space-y-1 px-3 py-2.5">
                  <div>
                    <Title size="sm" className="truncate text-[0.78rem] font-medium text-gray-950">
                      {item.name}
                    </Title>
                    <Paragraph size="xs" className="mt-1 text-gray-500">
                      {formatCurrency(item.price)}
                    </Paragraph>
                  </div>
                </div>
              </button>
            </li>
          ))}
          {!menuItemsQuery.isLoading && !menuItemsQuery.isError && items.length === 0 ? (
            <li className="col-span-full rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">
              No available menu items match this filter.
            </li>
          ) : null}
        </ul>
      )}
    </div>
  );
}
