import PosNavbar from "@/components/custom/PosNavbar";
import PosSidebar from "@/components/custom/PosSidebar";
import { usePosLayoutState } from "@/shared/hooks/use-pos-layout-state";

export default function PosLayout({ title, description, children }) {
  const { isCollapsed, toggleSidebar } = usePosLayoutState(title);

  return (
    <div className="flex min-h-screen bg-[#e9e9e9] text-gray-950">
      <PosSidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={() => toggleSidebar((prev) => !prev)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <PosNavbar
          isSidebarCollapsed={isCollapsed}
          onToggleSidebar={() => toggleSidebar((prev) => !prev)}
          title={title}
          description={description}
          profileName="Superadmin"
          profileAvatar=""
          showToggle={false}
        />

        <main className="min-h-0 flex-1 overflow-y-auto px-4 pb-6 pt-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
