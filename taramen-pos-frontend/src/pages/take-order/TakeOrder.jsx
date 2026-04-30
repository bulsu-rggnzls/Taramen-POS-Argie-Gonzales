import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

import CustomizeModal from "@/components/features/take-order/CustomizeModal";
import OrderSidebar from "@/components/features/take-order/OrderSidebar";
import TakeOrderCategoryTabs from "@/components/features/take-order/TakeOrderCategoryTabs";
import TakeOrderHeader from "@/components/features/take-order/TakeOrderHeader";
import TakeOrderLoadStatus from "@/components/features/take-order/TakeOrderLoadStatus";
import MenuGrid from "@/components/features/take-order/MenuGrid";
import { DASHBOARD } from "@/shared/constants/routes";

const TAKE_ORDER_GRID_CLASS =
  "grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_20rem] md:gap-5 xl:grid-cols-[minmax(0,1fr)_23.75rem] xl:gap-6";

export default function TakeOrder() {
  const navigate = useNavigate();

  const onBackToDashboard = useCallback(() => {
    navigate(DASHBOARD.path);
  }, [navigate]);

  return (
    <div className="min-h-screen p-3 sm:p-4 lg:p-6">
      <main className={TAKE_ORDER_GRID_CLASS}>
        <section className="rounded-3xl border border-gray-100 bg-white p-4 shadow-xs sm:p-5 lg:p-6">
          <TakeOrderHeader onBack={onBackToDashboard} />
          <TakeOrderLoadStatus />
          <TakeOrderCategoryTabs />
          <MenuGrid />
        </section>

        <OrderSidebar />
        <CustomizeModal />
      </main>
    </div>
  );
}
