import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

import CustomizeModal from "@/components/features/take-order/modals/CustomizeModal";
import OrderSidebar from "@/components/features/take-order/OrderSidebar";
import TakeOrderCategoryTabs from "@/components/features/take-order/TakeOrderCategoryTabs";
import TakeOrderHeader from "@/components/features/take-order/TakeOrderHeader";
import TakeOrderLoadStatus from "@/components/features/take-order/TakeOrderLoadStatus";
import MenuGrid from "@/components/features/take-order/MenuGrid";
import { DASHBOARD } from "@/shared/constants/routes";

const TAKE_ORDER_GRID_CLASS =
  "grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_24rem] xl:grid-cols-[minmax(0,1fr)_27rem]";

export default function TakeOrder() {
  const navigate = useNavigate();

  const onBackToDashboard = useCallback(() => {
    navigate(DASHBOARD.path);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#eeeeee] px-4 py-6 text-gray-950 sm:px-6 lg:px-8">
      <main className={`${TAKE_ORDER_GRID_CLASS} mx-auto max-w-[76rem]`}>
        <section className="min-w-0">
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
