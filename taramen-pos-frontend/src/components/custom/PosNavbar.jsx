import { ChevronsLeft, ChevronsRight } from "lucide-react";

import IButton from "@/components/custom/Button";
import Paragraph from "@/components/custom/Paragraph";
import Title from "@/components/custom/Title";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import PosNotificationBar from "@/components/custom/PosNotificationBar";
import { confirmAction } from "@/shared/helpers/confirmAction";
import { useLogout } from "@/shared/hooks/useAuth";

const getInitials = (name = "") =>
  name
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "TA";

export default function PosNavbar({
  isSidebarCollapsed,
  onToggleSidebar,
  title,
  description,
  profileName,
  profileAvatar,
  showToggle = true,
}) {
  const logout = useLogout();

  const handleLogout = () => {
    confirmAction(
      "Sign out",
      "Are you sure you want to log out?",
      () => logout(),
    );
  };

  return (
    <nav className="flex h-[5.25rem] shrink-0 items-center bg-[#e9e9e9]">
      <div className="flex h-full w-full items-center gap-4 px-4 sm:px-5 lg:px-6">
        {showToggle ? (
          <IButton
            type="button"
            variant="outline"
            showLoading={false}
            onClick={onToggleSidebar}
            className="size-10 rounded-full border-gray-200 bg-white text-gray-700 hover:border-orange/30 hover:text-orange"
            aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isSidebarCollapsed ? (
              <ChevronsRight className="size-4" />
            ) : (
              <ChevronsLeft className="size-5" />
            )}
          </IButton>
        ) : null}

        <header className="min-w-0">
          {title ? (
            <Title
              size="2xl"
              className="truncate text-[1.55rem] font-bold leading-tight text-gray-950"
            >
              {title}
            </Title>
          ) : null}
          {description ? (
            <Paragraph
              size="sm"
              className="mt-0.5 truncate text-[0.78rem] leading-tight text-gray-700"
            >
              {description}
            </Paragraph>
          ) : null}
        </header>

        <section className="ml-auto flex items-center gap-3">
          <PosNotificationBar />

          <button
            type="button"
            className="flex size-9 items-center justify-center rounded-full bg-[#dc7777] text-white shadow-sm transition-colors hover:bg-[#c85f5f]"
            aria-label="Logout"
            onClick={handleLogout}
          >
            <Avatar className="size-9">
              {profileAvatar ? (
                <AvatarImage src={profileAvatar} alt={profileName} />
              ) : null}
              <AvatarFallback className="bg-transparent text-xs font-semibold text-white">
                {getInitials(profileName)}
              </AvatarFallback>
            </Avatar>
          </button>
        </section>
      </div>
    </nav>
  );
}
