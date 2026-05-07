import { ArrowLeft, Search } from "lucide-react";

import IButton from "@/components/custom/Button";
import Paragraph from "@/components/custom/Paragraph";
import Title from "@/components/custom/Title";
import useTakeOrderStore from "@/stores/useTakeOrderStore";

export default function TakeOrderHeader({ onBack }) {
  const searchTerm = useTakeOrderStore((state) => state.searchTerm);
  const setField = useTakeOrderStore((state) => state.setField);

  return (
    <header className="flex flex-col gap-5">
      <div className="flex items-start gap-3">
        <IButton
          type="button"
          variant="outline"
          showLoading={false}
          className="mt-0.5 size-9 rounded-full border-gray-300 bg-white p-0 text-gray-700 shadow-sm hover:border-taramen-red hover:text-taramen-red"
          onClick={onBack}
          aria-label="Back to dashboard"
        >
          <ArrowLeft className="size-4" />
        </IButton>

        <div>
          <Title size="2xl" className="text-[1.45rem] font-bold leading-tight text-gray-950">
            Take Order
          </Title>
          <Paragraph size="xs" className="mt-1 text-gray-600">
            Process and record customer orders efficiently
          </Paragraph>
        </div>
      </div>

      <label className="relative w-full">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(event) => setField("searchTerm", event.target.value)}
          placeholder="Search menu items..."
          className="h-9 w-full rounded-full border-0 bg-white pl-10 pr-4 text-xs text-gray-700 shadow-sm outline-none ring-1 ring-transparent transition placeholder:text-gray-400 focus:ring-taramen-red/25"
        />
      </label>
    </header>
  );
}
