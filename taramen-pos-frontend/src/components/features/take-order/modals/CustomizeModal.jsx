import { useCallback, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import IButton from "@/components/custom/Button";
import Modal from "@/components/custom/Modal";
import Paragraph from "@/components/custom/Paragraph";
import Title from "@/components/custom/Title";
import { Checkbox } from "@/components/ui/checkbox";
import { ADD_ONS, REMOVALS } from "@/config/take-order-config";
import { formatCurrency } from "@/shared/helpers/takeOrder";
import useTakeOrderStore, { getCustomizeItem } from "@/stores/useTakeOrderStore";

const createDraft = (item) => ({
  selectedAddons: item?.addons?.map((addon) => addon.id) ?? [],
  selectedRemovals: item?.removals?.map((removal) => removal.id) ?? [],
  note: item?.note ?? "",
  newAddonLabel: "",
  newAddonPrice: "",
  newRemovalLabel: "",
  customData: {
    addons: item?.addons?.filter((addon) => String(addon.id).startsWith("custom-addon-")) ?? [],
    removals:
      item?.removals?.filter((removal) => String(removal.id).startsWith("custom-removal-")) ?? [],
  },
});

const selectCustomizeModalState = (state) => ({
  isOpen: state.isCustomizeModalOpen,
  customizeItem: getCustomizeItem(state),
  closeCustomizeModal: state.closeCustomizeModal,
  updateItemCustomization: state.updateItemCustomization,
});

function CustomizeDraft({ closeCustomizeModal, customizeItem, updateItemCustomization }) {
  const [draft, setDraft] = useState(() => createDraft(customizeItem));
  const addons = useMemo(
    () => [...ADD_ONS, ...draft.customData.addons],
    [draft.customData.addons],
  );
  const removals = useMemo(
    () => [...REMOVALS, ...draft.customData.removals],
    [draft.customData.removals],
  );

  const setDraftField = useCallback((key, value) => {
    setDraft((current) => ({ ...current, [key]: value }));
  }, []);

  const toggleAddon = useCallback((addonId, checked) => {
    setDraft((current) => ({
      ...current,
      selectedAddons: checked
        ? Array.from(new Set([...current.selectedAddons, addonId]))
        : current.selectedAddons.filter((id) => id !== addonId),
    }));
  }, []);

  const toggleRemoval = useCallback((removalId, checked) => {
    setDraft((current) => ({
      ...current,
      selectedRemovals: checked
        ? Array.from(new Set([...current.selectedRemovals, removalId]))
        : current.selectedRemovals.filter((id) => id !== removalId),
    }));
  }, []);

  const addCustomAddon = useCallback(() => {
    setDraft((current) => {
      const label = current.newAddonLabel.trim();
      if (!label) return current;

      const addon = {
        id: `custom-addon-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        label,
        price: Number(current.newAddonPrice) || 0,
      };

      return {
        ...current,
        customData: {
          ...current.customData,
          addons: [...current.customData.addons, addon],
        },
        selectedAddons: [...current.selectedAddons, addon.id],
        newAddonLabel: "",
        newAddonPrice: "",
      };
    });
  }, []);

  const addCustomRemoval = useCallback(() => {
    setDraft((current) => {
      const label = current.newRemovalLabel.trim();
      if (!label) return current;

      const removal = {
        id: `custom-removal-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        label,
      };

      return {
        ...current,
        customData: {
          ...current.customData,
          removals: [...current.customData.removals, removal],
        },
        selectedRemovals: [...current.selectedRemovals, removal.id],
        newRemovalLabel: "",
      };
    });
  }, []);

  const onApply = useCallback(() => {
    if (!customizeItem) return;

    updateItemCustomization(customizeItem.id, {
      addons: addons.filter((addon) => draft.selectedAddons.includes(addon.id)),
      removals: removals.filter((removal) => draft.selectedRemovals.includes(removal.id)),
      note: draft.note.trim(),
    });
    closeCustomizeModal();
  }, [
    addons,
    closeCustomizeModal,
    customizeItem,
    draft.note,
    draft.selectedAddons,
    draft.selectedRemovals,
    removals,
    updateItemCustomization,
  ]);

  return (
    <Modal
      isOpen
      onClose={closeCustomizeModal}
      size="xl"
      showFooter={false}
      className="gap-0 rounded-2xl border border-gray-200 bg-white p-0 shadow-2xl"
      headerClassName="gap-1 border-b-0 px-5 pt-5 sm:px-6 sm:pt-6"
      contentClassName="my-0 px-5 pb-5 sm:px-6 sm:pb-6"
      title={
        <Title size="lg" className="text-[2rem] font-bold leading-none text-gray-900">
          Customize{" "}
          <span className="text-taramen-red">{customizeItem?.name ?? "Item"}</span>
        </Title>
      }
      description={
        <Paragraph size="sm" className="text-[0.95rem] text-gray-500">
          Select add-ons, removals, or special requests.
        </Paragraph>
      }
    >
      <div className="space-y-7">
        <div className="space-y-4">
          <Title size="sm" className="text-sm font-semibold text-gray-900">
            Add-ons
          </Title>
          {addons.map((addon) => {
            const checked = draft.selectedAddons.includes(addon.id);
            const priceLabel =
              addon.price === 0
                ? "Free"
                : `${addon.price > 0 ? "+" : "-"}${formatCurrency(Math.abs(addon.price))}`;

            return (
              <label
                key={addon.id}
                className="flex min-h-[3.125rem] items-center rounded-lg border border-gray-300 bg-white px-3 py-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(value) => toggleAddon(addon.id, value)}
                    className="size-4 rounded-[3px] border-gray-300 data-[state=checked]:border-taramen-red data-[state=checked]:bg-taramen-red"
                  />
                  <div className="space-y-0.5">
                    <Paragraph size="sm" className="font-semibold text-gray-800">
                      {addon.label}
                    </Paragraph>
                    <Paragraph size="xs" className="font-medium text-gray-500">
                      {priceLabel}
                    </Paragraph>
                  </div>
                </div>
              </label>
            );
          })}
          <div className="grid grid-cols-[minmax(0,1fr)_5rem_3.625rem] gap-3">
            <input
              value={draft.newAddonLabel}
              onChange={(event) => setDraftField("newAddonLabel", event.target.value)}
              placeholder="Custom add-on"
              className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-taramen-red focus:outline-none"
            />
            <input
              value={draft.newAddonPrice}
              onChange={(event) => setDraftField("newAddonPrice", event.target.value)}
              placeholder="Price"
              className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-taramen-red focus:outline-none"
            />
            <IButton
              type="button"
              variant="taramenRed"
              showLoading={false}
              className="h-10 rounded-md px-0 text-sm font-semibold"
              onClick={addCustomAddon}
            >
              Add
            </IButton>
          </div>
        </div>

        <div className="space-y-4">
          <Title size="sm" className="text-sm font-semibold text-gray-900">
            Remove / Less
          </Title>
          {removals.map((removal) => {
            const checked = draft.selectedRemovals.includes(removal.id);

            return (
              <label
                key={removal.id}
                className="flex min-h-[3.125rem] items-center rounded-lg border border-gray-300 bg-white px-3 py-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(value) => toggleRemoval(removal.id, value)}
                    className="size-4 rounded-[3px] border-gray-300 data-[state=checked]:border-taramen-red data-[state=checked]:bg-taramen-red"
                  />
                  <Paragraph size="sm" className="font-semibold text-gray-800">
                    {removal.label}
                  </Paragraph>
                </div>
              </label>
            );
          })}
          <div className="grid grid-cols-[minmax(0,1fr)_3.625rem] gap-3">
            <input
              value={draft.newRemovalLabel}
              onChange={(event) => setDraftField("newRemovalLabel", event.target.value)}
              placeholder="Custom removal"
              className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-taramen-red focus:outline-none"
            />
            <IButton
              type="button"
              variant="taramenRed"
              showLoading={false}
              className="h-10 rounded-md px-0 text-sm font-semibold"
              onClick={addCustomRemoval}
            >
              Add
            </IButton>
          </div>
        </div>

        <div className="space-y-3">
          <Title size="sm" className="text-sm font-semibold text-gray-900">
            Special Instruction
          </Title>
          <textarea
            value={draft.note}
            onChange={(event) => setDraftField("note", event.target.value)}
            placeholder="Type any request..."
            className="min-h-[6.75rem] w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-taramen-red focus:outline-none"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <IButton
            type="button"
            variant="outline"
            showLoading={false}
            className="h-10 rounded-md border-gray-400 bg-white px-4 text-sm font-semibold text-gray-900 hover:bg-gray-50"
            onClick={closeCustomizeModal}
          >
            Cancel
          </IButton>
          <IButton
            type="button"
            variant="taramenRed"
            showLoading={false}
            className="h-10 rounded-md px-4 text-sm font-semibold"
            onClick={onApply}
          >
            Apply
          </IButton>
        </div>
      </div>
    </Modal>
  );
}

export default function CustomizeModal() {
  const {
    isOpen,
    customizeItem,
    closeCustomizeModal,
    updateItemCustomization,
  } = useTakeOrderStore(useShallow(selectCustomizeModalState));

  if (!isOpen) return null;

  return (
    <CustomizeDraft
      key={customizeItem?.id ?? "customize"}
      closeCustomizeModal={closeCustomizeModal}
      customizeItem={customizeItem}
      updateItemCustomization={updateItemCustomization}
    />
  );
}
