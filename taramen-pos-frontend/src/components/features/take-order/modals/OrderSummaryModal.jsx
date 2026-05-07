import { Printer, ReceiptText } from "lucide-react";
import { toast } from "sonner";

import IButton from "@/components/custom/Button";
import Paragraph from "@/components/custom/Paragraph";
import Title from "@/components/custom/Title";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/shared/helpers/takeOrder";

export default function OrderSummaryModal({ summary, onClose, onPrint }) {
  const isOpen = Boolean(summary);

  const handlePrint = () => {
    toast.success("Receipt printed.");
    onPrint?.();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose?.()}>
      <DialogContent className="max-h-[90vh] overflow-hidden rounded-xl border-orange-100 bg-[#fffafa] p-0 sm:max-w-2xl">
        {summary ? (
          <div className="flex max-h-[90vh] flex-col">
            <DialogHeader className="border-b border-orange-100 px-5 py-4">
              <div className="flex items-start justify-between gap-3 pr-8">
                <div>
                  <DialogTitle asChild>
                    <Title size="lg" className="text-[1.45rem] font-bold text-gray-950">
                      Order Summary
                    </Title>
                  </DialogTitle>
                  <Paragraph size="xs" className="mt-1 text-gray-500">
                    Review the completed order before printing.
                  </Paragraph>
                </div>
                <Badge className="rounded-lg bg-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600">
                  {summary.id}
                </Badge>
              </div>
            </DialogHeader>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              <div className="rounded-xl border border-orange-200 bg-white p-4">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-full bg-taramen-red/10 text-taramen-red">
                    <ReceiptText className="size-5" />
                  </span>
                  <div>
                    <Title size="sm" className="text-gray-950">
                      {summary.dineType === "takeout" ? "Take out" : "Dine In"}
                    </Title>
                    <Paragraph size="xs" className="text-gray-500">
                      Table: {summary.tableNumber}
                    </Paragraph>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-lg bg-[#fffafa] p-3">
                    <Paragraph size="xs" className="font-semibold uppercase text-gray-500">
                      Employee
                    </Paragraph>
                    <Paragraph size="sm" className="mt-1 font-semibold text-gray-950">
                      {summary.employeeLabel}
                    </Paragraph>
                  </div>
                  <div className="rounded-lg bg-[#fffafa] p-3">
                    <Paragraph size="xs" className="font-semibold uppercase text-gray-500">
                      Items
                    </Paragraph>
                    <Paragraph size="sm" className="mt-1 font-semibold text-gray-950">
                      {summary.items.length}
                    </Paragraph>
                  </div>
                </div>
              </div>

              <ul className="mt-4 space-y-3">
                {summary.items.map((item) => (
                  <li
                    key={item.id}
                    className="rounded-lg border border-orange-200 bg-white p-3 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Title size="sm" className="truncate text-gray-950">
                          {item.name}
                        </Title>
                        <Paragraph size="xs" className="mt-1 text-gray-500">
                          Qty {item.qty} x {formatCurrency(item.price)}
                        </Paragraph>
                        {item.addons?.length ? (
                          <Paragraph size="xs" className="mt-1 text-gray-400">
                            Add-ons: {item.addons.map((addon) => addon.label).join(", ")}
                          </Paragraph>
                        ) : null}
                        {item.removals?.length ? (
                          <Paragraph size="xs" className="mt-1 text-gray-400">
                            Remove: {item.removals.map((removal) => removal.label).join(", ")}
                          </Paragraph>
                        ) : null}
                        {item.note ? (
                          <Paragraph size="xs" className="mt-1 text-gray-400">
                            Note: {item.note}
                          </Paragraph>
                        ) : null}
                      </div>
                      <Paragraph size="sm" className="shrink-0 font-semibold text-gray-950">
                        {formatCurrency(item.lineTotal)}
                      </Paragraph>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-5 space-y-2 border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between">
                  <Paragraph size="sm" className="text-gray-500">
                    Subtotal
                  </Paragraph>
                  <Paragraph size="sm" className="font-semibold text-gray-900">
                    {formatCurrency(summary.totals.subtotal)}
                  </Paragraph>
                </div>
                <div className="flex items-center justify-between">
                  <Paragraph size="xs" className="text-orange">
                    {summary.discountLabel}
                  </Paragraph>
                  <Paragraph size="xs" className="text-orange">
                    - {formatCurrency(summary.totals.discountAmount)}
                  </Paragraph>
                </div>
                <div className="flex items-center justify-between">
                  <Paragraph size="xs" className="text-orange">
                    {summary.promoLabel}
                  </Paragraph>
                  <Paragraph size="xs" className="text-orange">
                    - {formatCurrency(summary.totals.promoAmount)}
                  </Paragraph>
                </div>
                <div className="flex items-center justify-between">
                  <Paragraph size="sm" className="text-gray-500">
                    Tax (10%)
                  </Paragraph>
                  <Paragraph size="sm" className="font-semibold text-gray-900">
                    {formatCurrency(summary.totals.taxAmount)}
                  </Paragraph>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <Paragraph size="sm" className="text-gray-500">
                    Total Amount
                  </Paragraph>
                  <Title size="2xl" className="text-gray-950">
                    {formatCurrency(summary.totals.total)}
                  </Title>
                </div>
              </div>
            </div>

            <div className="border-t border-orange-100 px-5 py-4">
              <IButton
                type="button"
                variant="taramenRed"
                showLoading={false}
                className="h-12 w-full rounded-lg text-sm font-semibold"
                onClick={handlePrint}
              >
                <Printer className="size-4" />
                Print Receipt
              </IButton>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
