import { Search } from "lucide-react";

import Title from "@/components/custom/Title";
import useStaffStore from "@/stores/useStaffStore";
import Paragraph from "@/components/custom/Paragraph";

export default function StaffHeader() {
  const searchTerm = useStaffStore((state) => state.searchTerm);
  const setField = useStaffStore((state) => state.setField);

  return (
    <header className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex-col items-center gap-4 mb-4">
          <Title size="2xl" className="text-gray-900">
            Staff Management
          </Title>
          <Paragraph className="text-gray-600">
            Manage kitchen and front of the house personnel.
          </Paragraph>
        </div>
      </div>
{/* 
      <label className="relative flex w-full items-center mb-12">
        <Search className="absolute left-3 size-4 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(event) => setField("searchTerm", event.target.value)}
          placeholder="Search employee name..."
          className="h-11 w-full rounded-full border border-gray-200 bg-white pl-10 pr-4 text-sm text-gray-700 outline-none focus:border-orange/60 focus:ring-2 focus:ring-orange/20"
        />
      </label> */}
    </header>
  );
}
