import PosNavbar from "@/components/custom/PosNavbar";
import PosSidebar from "@/components/custom/PosSidebar";
import { usePosLayoutState } from "@/shared/hooks/use-pos-layout-state";
import Title from "@/components/custom/Title";
import Paragraph from "@/components/custom/Paragraph";

export default function PosLayout({ title, description, children }) {
  const { isCollapsed, toggleSidebar, breadcrumbs } = usePosLayoutState(title);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <PosNavbar
        breadcrumbs={breadcrumbs}
        isSidebarCollapsed={isCollapsed}
        onToggleSidebar={() => toggleSidebar((prev) => !prev)}
        profileName="Superadmin"
        profileRole="Super Admin"
        profileAvatar=""
        showToggle={false}
      />

      <div className="flex flex-1 overflow-hidden pt-18">
        <PosSidebar
          isCollapsed={isCollapsed}
          onRequestExpand={() => toggleSidebar(false)}
          onToggleCollapse={() => toggleSidebar((prev) => !prev)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {title && (
              <header className="mb-6">
                <Title size="2xl" className="font-bold text-gray-900 md:text-3xl">
                  {title}
                </Title>
                {description && (
                  <Paragraph size="sm" className="mt-2 text-gray-500">
                    {description}
                  </Paragraph>
                )}
              </header>
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
