import { useCallback, useEffect, useMemo } from "react";
import { AlertCircle, Settings, Table2, Trash2, User } from "lucide-react";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";

import IButton from "@/components/custom/Button";
import Paragraph from "@/components/custom/Paragraph";
import Title from "@/components/custom/Title";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  DEFAULT_DISCOUNT_OPTIONS,
  NONE_DISCOUNT_OPTION,
  TAX_RATE,
} from "@/pages/take-order/take-order-config";
import {
  buildOrderPayload,
  calculateDiscountAmount,
  formatCurrency,
} from "@/shared/helpers/takeOrder";
import {
  useCreateOrderMutation,
  useDiscountGroupsQuery,
  useEmployeeOptionsQuery,
} from "@/queries/useTakeOrderQueries";
import { extractErrorMessage } from "@/shared/helpers/extractErrorMessage";
import useTakeOrderStore from "@/stores/useTakeOrderStore";

const selectOrderSidebarState = (state) => ({
  dineType: state.dineType,
  discountValue: state.discountValue,
  employeeId: state.employeeId,
  orderItems: state.orderItems,
  promoDiscountValue: state.promoDiscountValue,
  tableNumber: state.tableNumber,
});

const selectOrderSidebarActions = (state) => ({
  changeItemQty: state.changeItemQty,
  openCustomizeModal: state.openCustomizeModal,
  removeItem: state.removeItem,
  setField: state.setField,
});

export default function OrderSidebar() {
  const {
    dineType,
    discountValue,
    employeeId,
    orderItems,
    promoDiscountValue,
    tableNumber,
  } = useTakeOrderStore(useShallow(selectOrderSidebarState));
  const actions = useTakeOrderStore(useShallow(selectOrderSidebarActions));
  const clearSubmittedOrder = useTakeOrderStore((state) => state.clearSubmittedOrder);
  const createOrder = useCreateOrderMutation();
  const {
    data: employeeOptions = [],
    isLoading: isEmployeesLoading,
    isError: isEmployeesError,
  } = useEmployeeOptionsQuery();
  const { data: discountGroups } = useDiscountGroupsQuery();
  const regularDiscountOptions =
    discountGroups?.regularDiscountOptions ?? DEFAULT_DISCOUNT_OPTIONS;
  const promoDiscountOptions =
    discountGroups?.promoDiscountOptions ?? DEFAULT_DISCOUNT_OPTIONS;

  useEffect(() => {
    const firstEmployeeId = employeeOptions[0]?.value;
    const hasSelectedEmployee = employeeOptions.some(
      (option) => option.value === employeeId,
    );

    if (!firstEmployeeId) {
      if (employeeId) {
        actions.setField("employeeId", "");
      }
      return;
    }

    if (!employeeId || !hasSelectedEmployee) {
      actions.setField("employeeId", firstEmployeeId);
    }
  }, [actions, employeeId, employeeOptions]);

  const totals = useMemo(() => {
    const subtotal = orderItems.reduce((sum, item) => {
      const addonsPrice = (item.addons ?? []).reduce(
        (addonSum, addon) => addonSum + addon.price,
        0,
      );

      return sum + (item.price + addonsPrice) * item.qty;
    }, 0);
    const regularDiscount =
      regularDiscountOptions.find((option) => option.value === discountValue) ??
      NONE_DISCOUNT_OPTION;
    const promoDiscount =
      promoDiscountOptions.find((option) => option.value === promoDiscountValue) ??
      NONE_DISCOUNT_OPTION;
    const discountAmount = calculateDiscountAmount(subtotal, regularDiscount);
    const promoAmount = calculateDiscountAmount(subtotal, promoDiscount);
    const taxableAmount = Math.max(subtotal - discountAmount - promoAmount, 0);
    const taxAmount = taxableAmount * TAX_RATE;

    return {
      subtotal,
      discountAmount,
      promoAmount,
      taxAmount,
      total: taxableAmount + taxAmount,
    };
  }, [
    discountValue,
    orderItems,
    promoDiscountOptions,
    promoDiscountValue,
    regularDiscountOptions,
  ]);

  const onSubmit = useCallback(async () => {
    if (orderItems.length === 0) {
      toast.error("Add at least one item before submitting the order.");
      return;
    }

    if (!employeeId) {
      toast.error("Select an employee before submitting the order.");
      return;
    }

    const payload = buildOrderPayload({
      dineType,
      discountValue,
      employeeId,
      orderItems,
      promoDiscountOptions,
      promoDiscountValue,
      regularDiscountOptions,
      tableNumber,
      noneDiscountOption: NONE_DISCOUNT_OPTION,
    });

    try {
      await createOrder.mutateAsync(payload);
      clearSubmittedOrder();
      toast.success("Order submitted.");
    } catch (requestError) {
      toast.error(extractErrorMessage(requestError, "Unable to submit order."));
    }
  }, [
    clearSubmittedOrder,
    createOrder,
    dineType,
    discountValue,
    employeeId,
    orderItems,
    promoDiscountOptions,
    promoDiscountValue,
    regularDiscountOptions,
    tableNumber,
  ]);

  const orderId = "#ORD-9082";
  const hasItems = orderItems.length > 0;
  const hasEmployees = employeeOptions.length > 0;
  const isSubmitDisabled =
    createOrder.isPending || isEmployeesLoading || !hasEmployees || !employeeId;
  const discountLabel =
    regularDiscountOptions.find((option) => option.value === discountValue)?.label ??
    "Regulatory";
  const promoLabel =
    promoDiscountOptions.find((option) => option.value === promoDiscountValue)
      ?.label ?? "Promo";

  return (
    <aside className="sticky top-6 flex h-[calc(100vh-3rem)] min-h-[42rem] flex-col rounded-xl bg-[#fffafa] px-4 py-5 shadow-none">
      <header className="flex items-center justify-between">
        <Title size="lg" className="text-[1.45rem] font-bold text-gray-950">
          Current Order
        </Title>
        <Badge className="rounded-lg bg-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600">
          {orderId}
        </Badge>
      </header>

      <div className="mt-8">
        <div className="grid grid-cols-2 rounded-full bg-gray-200 p-2">
          <IButton
            type="button"
            variant={dineType === "dine-in" ? "taramenRed" : "ghost"}
            showLoading={false}
            className="h-9 rounded-full text-xs font-medium shadow-none"
            onClick={() => actions.setField("dineType", "dine-in")}
          >
            Dine In
          </IButton>
          <IButton
            type="button"
            variant={dineType === "takeout" ? "taramenRed" : "ghost"}
            showLoading={false}
            className="h-9 rounded-full text-xs font-medium shadow-none hover:bg-transparent"
            onClick={() => actions.setField("dineType", "takeout")}
          >
            Take out
          </IButton>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <label className="space-y-2">
          <Paragraph size="xs" className="font-semibold uppercase !text-black">
            Table
          </Paragraph>
          <div className="relative">
            <Table2 className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-taramen-red" />
            <Input
              value={tableNumber}
              onChange={(event) => actions.setField("tableNumber", event.target.value)}
              className="h-9 rounded-lg border-taramen-red bg-white pl-9 text-xs font-medium text-gray-950 focus-visible:ring-taramen-red/25"
              inputMode="numeric"
              disabled={dineType === "takeout"}
              placeholder={dineType === "takeout" ? "Takeout" : "Enter table no."}
            />
          </div>
        </label>
        <label className="space-y-2">
          <Paragraph size="xs" className="font-semibold uppercase !text-black">
            Employee
          </Paragraph>
          <Select
            value={employeeId}
            onValueChange={(value) => actions.setField("employeeId", value)}
            disabled={isEmployeesLoading || !hasEmployees}
          >
            <SelectTrigger className="h-9 w-full rounded-lg border-taramen-red bg-white text-xs font-medium text-gray-950 focus:ring-taramen-red/25">
              <User className="size-4 text-taramen-red" />
              <SelectValue
                placeholder={
                  isEmployeesLoading
                    ? "Loading employees..."
                    : hasEmployees
                      ? "Select employee"
                      : "No active employees"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {employeeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!isEmployeesLoading && !hasEmployees ? (
            <Paragraph size="xs" className="text-red-600">
              Add an active employee first before saving orders.
            </Paragraph>
          ) : null}
          {isEmployeesError && !hasEmployees ? (
            <Paragraph size="xs" className="text-red-600">
              Employee list could not be loaded.
            </Paragraph>
          ) : null}
        </label>
      </div>

      <div className="mt-6 flex min-h-0 flex-1 flex-col">
        {hasItems ? (
          <div className="flex-1 overflow-y-auto pr-1">
            <ul className="space-y-4">
              {orderItems.map((item) => (
                <li key={item.id} className="rounded-lg border border-orange-400 bg-white p-3 shadow-lg">
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "h-16 w-16 shrink-0 overflow-hidden rounded-md bg-gradient-to-br",
                        item.accent ?? "from-slate-200 via-slate-100 to-white",
                      )}
                    >
                      <img
                        src="/taramen-bg.jpg"
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <Title size="sm" className="text-gray-950">
                          {item.name}
                        </Title>
                        <Paragraph size="xs" className="text-gray-500">
                          {item.details}
                        </Paragraph>
                        {item.addons?.length ? (
                          <Paragraph size="xs" className="text-gray-400">
                            Add-ons: {item.addons.map((addon) => addon.label).join(", ")}
                          </Paragraph>
                        ) : null}
                        {item.removals?.length ? (
                          <Paragraph size="xs" className="text-gray-400">
                            Remove: {item.removals.map((removal) => removal.label).join(", ")}
                          </Paragraph>
                        ) : null}
                        {item.note ? (
                          <Paragraph size="xs" className="text-gray-400">
                            Note: {item.note}
                          </Paragraph>
                        ) : null}
                      </div>
                      <Paragraph size="sm" className="font-semibold text-gray-950">
                        {formatCurrency(
                          (item.price +
                            (item.addons?.reduce(
                              (sum, addon) => sum + addon.price,
                              0,
                            ) ?? 0)) *
                            item.qty,
                        )}
                      </Paragraph>
                    </div>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <div className="inline-flex items-center rounded-lg border border-gray-200 bg-transparent">
                          <IButton
                            type="button"
                            variant="ghost"
                            showLoading={false}
                            className="h-8 w-8 rounded-none p-0 text-gray-600 hover:bg-transparent"
                            onClick={() => actions.changeItemQty(item.id, -1)}
                          >
                            -
                          </IButton>
                          <Paragraph size="sm" className="px-3 font-semibold text-gray-900">
                            {item.qty}
                          </Paragraph>
                          <IButton
                            type="button"
                            variant="ghost"
                            showLoading={false}
                            className="h-8 w-8 rounded-none p-0 text-gray-600 hover:bg-transparent"
                            onClick={() => actions.changeItemQty(item.id, 1)}
                          >
                            +
                          </IButton>
                        </div>
                        <div className="flex items-center gap-1">
                          <IButton
                            type="button"
                            variant="ghost"
                            showLoading={false}
                            className="h-8 w-8 rounded-lg p-0 text-gray-400 hover:text-gray-700"
                            onClick={() => actions.openCustomizeModal(item.id)}
                            aria-label="Customize item"
                          >
                            <Settings className="size-4" />
                          </IButton>
                          <IButton
                            type="button"
                            variant="ghost"
                            showLoading={false}
                            className="h-8 w-8 rounded-lg p-0 text-gray-400 hover:text-orange"
                            onClick={() => actions.removeItem(item.id)}
                            aria-label="Remove item"
                          >
                            <Trash2 className="size-4" />
                          </IButton>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full text-center">
              <AlertCircle className="mx-auto mb-4 size-7 text-red-600" />
              <Title size="sm" className="text-[0.78rem] font-bold text-gray-950">
                No items yet
              </Title>
              <Paragraph size="xs" className="mx-auto mt-1 max-w-[17rem] text-gray-950">
                Add products from the <span className="text-taramen-red">Take Order</span> list to build this ticket.
              </Paragraph>
            </div>
          </div>
        )}
      </div>

      {hasItems ? (
        <>
          <div className="mt-6 space-y-4 border-t border-gray-200 pt-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Paragraph size="xs" className="font-semibold uppercase !text-black">
                  Regulatory Dsc.
                </Paragraph>
                <Select
                  value={discountValue}
                  onValueChange={(value) => actions.setField("discountValue", value)}
                >
                  <SelectTrigger className="h-9 w-full rounded-lg border border-taramen-red text-xs font-semibold text-gray-900">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {regularDiscountOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Paragraph size="xs" className="font-semibold uppercase !text-black">
                  Promo Dsc.
                </Paragraph>
                <Select
                  value={promoDiscountValue}
                  onValueChange={(value) => actions.setField("promoDiscountValue", value)}
                >
                  <SelectTrigger className="h-9 w-full rounded-lg border border-taramen-red text-xs font-semibold text-gray-900">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {promoDiscountOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center justify-between">
                <Paragraph size="sm" className="text-gray-500">
                  Subtotal
                </Paragraph>
                <Paragraph size="sm" className="text-gray-900 font-semibold">
                  {formatCurrency(totals.subtotal)}
                </Paragraph>
              </div>
              <div className="flex items-center justify-between text-orange">
                <Paragraph size="xs" className="text-orange">
                  {discountLabel}
                </Paragraph>
                <Paragraph size="xs" className="text-orange">
                  - {formatCurrency(totals.discountAmount)}
                </Paragraph>
              </div>
              <div className="flex items-center justify-between text-orange">
                <Paragraph size="xs" className="text-orange">
                  {promoLabel}
                </Paragraph>
                <Paragraph size="xs" className="text-orange">
                  - {formatCurrency(totals.promoAmount)}
                </Paragraph>
              </div>
              <div className="flex items-center justify-between">
                <Paragraph size="sm" className="text-gray-500">
                  Tax (10%)
                </Paragraph>
                <Paragraph size="sm" className="text-gray-900 font-semibold">
                  {formatCurrency(totals.taxAmount)}
                </Paragraph>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <Paragraph size="sm" className="text-gray-500">
              Total Amount
            </Paragraph>
            <Title size="2xl" className="text-gray-950">
              {formatCurrency(totals.total)}
            </Title>
          </div>

          <IButton
            type="button"
            variant="taramenRed"
            className="mt-6 w-full rounded-lg py-6 text-base font-semibold"
            showLoading={createOrder.isPending}
            onClick={onSubmit}
            disabled={isSubmitDisabled}
          >
            Save & Print Receipt
          </IButton>
        </>
      ) : null}
    </aside>
  );
}
