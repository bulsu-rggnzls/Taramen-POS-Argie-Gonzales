import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ChevronDown,
  LayoutGrid,
  List,
  Menu as MenuIcon,
  ShoppingBag,
  Tag,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";
import IButton from "@/components/custom/Button";
import {
  DASHBOARD,
  MENU_CATEGORIES,
  MENU_ITEMS,
  STAFF,
  TAKE_ORDER,
} from "@/shared/constants/routes";

const NAV_ITEMS = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutGrid,
    path: DASHBOARD.path,
    match: (pathname) => pathname === DASHBOARD.path,
  },
  {
    id: "order",
    label: "Take Order",
    icon: ShoppingBag,
    path: TAKE_ORDER.path,
    match: (pathname) => pathname === TAKE_ORDER.path,
  },
  {
    id: "menu",
    label: "Menu",
    icon: MenuIcon,
    children: [
      {
        id: "menu-items",
        label: "Menu Items",
        icon: List,
        path: MENU_ITEMS.path,
      },
      {
        id: "categories",
        label: "Categories",
        icon: Tag,
        path: MENU_CATEGORIES.path,
      },
    ],
    match: (pathname) =>
      pathname.startsWith(MENU_ITEMS.path) ||
      pathname.startsWith(MENU_CATEGORIES.path),
  },
  {
    id: "staff",
    label: "Staff",
    icon: Users,
    path: STAFF.path,
    match: (pathname) => pathname === STAFF.path,
  },
];

export default function PosSidebar({
  isCollapsed: isCollapsedProp = false,
  onToggleCollapse,
}) {
  const location = useLocation();
  const isCollapsed = Boolean(isCollapsedProp);
  const menuItem = NAV_ITEMS.find((item) => item.children);
  const isMenuActive = menuItem?.match(location.pathname) ?? false;
  const [isMenuManuallyOpen, setIsMenuManuallyOpen] = useState(false);
  const isMenuOpen = !isCollapsed && (isMenuActive || isMenuManuallyOpen);

  return (
    <aside
      className={cn(
        "flex min-h-screen shrink-0 flex-col bg-sidebar-red px-5 py-7 text-black transition-[width] duration-300 ease-out",
        isCollapsed ? "w-[6rem]" : "w-[14rem]",
      )}
    >
      <div className="flex justify-center">
        <IButton
          type="button"
          variant="ghost"
          showLoading={false}
          onClick={() => onToggleCollapse?.()}
          className="size-14 rounded-full bg-transparent p-0 text-black shadow-none hover:bg-white/70"
          aria-label={isCollapsed ? "Open sidebar" : "Close sidebar"}
        >
          <img
            src="/taramen.svg"
            alt=""
            className="h-16 w-16 object-contain"
            draggable={false}
          />
        </IButton>
      </div>

      <nav className="mt-9 flex flex-col gap-5" aria-label="POS navigation">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = item.match(location.pathname);

          if (item.children) {
            return (
              <div key={item.id} className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (isCollapsed) {
                      onToggleCollapse?.();
                      setIsMenuManuallyOpen(true);
                      return;
                    }
                    setIsMenuManuallyOpen((open) => !open);
                  }}
                  className={cn(
                    "group flex h-12 w-full items-center rounded-md text-sm font-semibold transition-colors",
                    isCollapsed ? "justify-center px-0" : "gap-4 px-4",
                    isActive
                      ? "bg-taramen-red text-white"
                      : "text-black hover:bg-white hover:text-taramen-red",
                  )}
                  aria-expanded={!isCollapsed && isMenuOpen}
                  title={isCollapsed ? item.label : undefined}
                >
                  <span className="flex size-5 shrink-0 items-center justify-center">
                    <Icon className="size-5" strokeWidth={1.8} />
                  </span>
                  <span
                    className={cn(
                      "min-w-0 flex-1 overflow-hidden whitespace-nowrap text-left transition-[opacity,width] duration-200",
                      isCollapsed ? "hidden" : "w-auto opacity-100",
                    )}
                  >
                    {item.label}
                  </span>
                  <ChevronDown
                    className={cn(
                      "size-4 shrink-0 transition-all duration-200",
                      isMenuOpen && "rotate-180",
                      isCollapsed ? "hidden" : "opacity-100",
                    )}
                    strokeWidth={1.8}
                  />
                </button>

                {!isCollapsed && isMenuOpen ? (
                  <div className="flex flex-col gap-2 pl-4">
                    {item.children.map((child) => {
                      const ChildIcon = child.icon;
                      const isChildActive = location.pathname.startsWith(child.path);

                      return (
                        <Link
                          key={child.id}
                          to={child.path}
                          className={cn(
                            "flex h-12 items-center gap-4 rounded-md px-4 text-sm font-semibold transition-colors",
                            isChildActive
                              ? "bg-taramen-red text-white"
                              : "text-black hover:bg-white hover:text-taramen-red",
                          )}
                        >
                          <span className="flex size-5 shrink-0 items-center justify-center">
                            <ChildIcon className="size-5" strokeWidth={1.8} />
                          </span>
                          <span className="truncate">{child.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          }

          return (
            <Link
              key={item.id}
              to={item.path}
              className={cn(
                "group flex h-12 w-full items-center rounded-md text-sm font-semibold transition-colors",
                isCollapsed ? "justify-center px-0" : "gap-4 px-4",
                isActive
                  ? "bg-taramen-red text-white"
                  : "text-black hover:bg-white hover:text-taramen-red",
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <span className="flex size-5 shrink-0 items-center justify-center">
                <Icon className="size-5" strokeWidth={1.8} />
              </span>
              <span
                className={cn(
                  "overflow-hidden whitespace-nowrap transition-[opacity,width] duration-200",
                  isCollapsed ? "hidden" : "w-auto opacity-100",
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
