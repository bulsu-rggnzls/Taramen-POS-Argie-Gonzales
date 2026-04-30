import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  LayoutGrid,
  List,
  PanelLeftClose,
  PanelLeftOpen,
  ShoppingBag,
  Tag,
  UtensilsCrossed,
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
    id: "order",
    label: "Take Order",
    icon: ShoppingBag,
    path: TAKE_ORDER.path,
  },
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutGrid,
    path: DASHBOARD.path,
  },
  {
    id: "menu",
    label: "Menu",
    icon: UtensilsCrossed,
    children: [
      {
        id: "category",
        label: "Category",
        icon: Tag,
        path: MENU_CATEGORIES.path,
      },
      {
        id: "menu-items",
        label: "Menu Items",
        icon: List,
        path: MENU_ITEMS.path,
      },
    ],
  },
  {
    id: "staff",
    label: "Staff",
    icon: Users,
    path: STAFF.path,
  },
];

const baseItemClasses =
  "group flex min-h-[3.25rem] w-full items-center gap-3 rounded-lg text-left text-base font-semibold text-gray-600 transition-colors p-0 h-auto xl:min-h-[3.5rem] xl:text-lg";
const hoverClasses = "hover:bg-taramen-red/10 hover:text-taramen-red";
const activeClasses = "bg-taramen-red text-white";

export default function PosSidebar({
  isCollapsed: isCollapsedProp = false,
  onRequestExpand,
  onToggleCollapse,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const isCollapsed = Boolean(isCollapsedProp);
  const menuItem = NAV_ITEMS.find((item) => item.children);
  const menuChildren = menuItem?.children ?? [];
  const isMenuActive = menuChildren.some((child) =>
    location.pathname.startsWith(child.path),
  );
  const [isMenuOpen, setIsMenuOpen] = useState(isMenuActive);
  const [enableWidthTransition, setEnableWidthTransition] = useState(false);

  useEffect(() => {
    if (isMenuActive && !isCollapsed) setIsMenuOpen(true);
  }, [isMenuActive, isCollapsed]);

  useEffect(() => {
    if (isCollapsed) setIsMenuOpen(false);
  }, [isCollapsed]);

  useEffect(() => {
    const id = setTimeout(() => setEnableWidthTransition(true), 0);
    return () => clearTimeout(id);
  }, []);

  const itemLayoutClasses = isCollapsed
    ? "justify-center gap-0 px-4"
    : "justify-start px-4 xl:px-6";
  const menuButtonSizeClasses = isCollapsed
    ? "!h-auto !py-0 !px-4"
    : "!h-auto !py-0 !px-4 xl:!px-6";
  const labelClasses = cn(
    "min-w-0 overflow-hidden whitespace-nowrap transition-opacity duration-200",
    isCollapsed ? "w-0 opacity-0" : "flex-1 opacity-100",
  );
  const iconWrapClass = "flex size-6 shrink-0 items-center justify-center";
  const activeItemClass = activeClasses;

  const handleCollapsedNavigate = (path) => {
    onRequestExpand?.();
    navigate(path);
  };

  return (
    <aside
      className={cn(
        "relative flex h-[calc(100vh-4.5rem)] shrink-0 flex-col overflow-hidden border-r border-gray-100 bg-white text-gray-800",
        isCollapsed ? "w-[5.25rem] lg:w-[5.75rem]" : "w-[14.25rem] xl:w-[17.5rem]",
        enableWidthTransition &&
          "transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[width]",
      )}
    >
      <div className={cn("flex flex-1 flex-col py-5", isCollapsed ? "px-4" : "px-5")}>
        <div className={cn("flex items-center pb-3", isCollapsed ? "justify-center" : "justify-end")}>
          <IButton
            type="button"
            variant="ghost"
            showLoading={false}
            onClick={() => onToggleCollapse?.()}
            className="size-9 rounded-none border-none bg-transparent text-black shadow-none hover:bg-transparent hover:text-black"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="size-6 text-gray-700" />
            ) : (
              <PanelLeftClose className="size-6 text-gray-700" />
            )}
          </IButton>
        </div>
        <div className="flex flex-col gap-3 border-t border-gray-100 pt-4">
          {NAV_ITEMS.map((item) => {
            if (item.children) {
              const Icon = item.icon;
              return (
                <div key={item.id} className="flex w-full flex-col">
                  <IButton
                    type="button"
                    variant="ghost"
                    showLoading={false}
                    aria-expanded={!isCollapsed && isMenuOpen}
                    aria-controls="pos-menu-group"
                    onClick={() => {
                      if (isCollapsed) {
                        onRequestExpand?.();
                        setIsMenuOpen(true);
                        return;
                      }
                      setIsMenuOpen((open) => !open);
                    }}
                    className={cn(
                      "relative",
                      baseItemClasses,
                      itemLayoutClasses,
                      menuButtonSizeClasses,
                      isMenuActive
                        ? activeItemClass
                        : isCollapsed
                          ? ""
                          : hoverClasses,
                    )}
                  >
                    <span className={iconWrapClass}>
                      <Icon className="size-6" />
                    </span>
                    <span className={labelClasses}>{item.label}</span>
                    <ChevronDown
                      className={cn(
                        "min-w-0 overflow-hidden size-4 transition-all duration-300",
                        isMenuOpen && "rotate-180",
                        isMenuActive ? "text-white" : "text-gray-400",
                        !isCollapsed && "group-hover:text-taramen-red",
                        isCollapsed ? "opacity-0 w-0" : "opacity-100",
                      )}
                    />
                  </IButton>
                  <AnimatePresence initial={false}>
                    {!isCollapsed && isMenuOpen ? (
                      <motion.div
                        id="pos-menu-group"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="overflow-hidden"
                      >
                        <div className="mt-2 flex flex-col gap-1 pl-6">
                          {item.children.map((child) => {
                            const isChildActive = location.pathname.startsWith(child.path);
                            const ChildIcon = child.icon;
                            return (
                              <Link
                                key={child.id}
                                to={child.path}
                                className={cn(
                                  baseItemClasses,
                                  itemLayoutClasses,
                                  "min-h-[2.875rem] text-sm font-medium xl:min-h-[3rem] xl:text-base",
                                  isChildActive
                                    ? activeClasses
                                    : hoverClasses,
                                )}
                              >
                                <span className="flex size-4 shrink-0 items-center justify-center">
                                  <ChildIcon className="size-5" />
                                </span>
                                <span className={labelClasses}>
                                  {child.label}
                                </span>
                              </Link>
                            );
                          })}
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              );
            }

            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <div key={item.id} className="flex">
                <Link
                  to={item.path}
                  className={cn(
                    "relative",
                    baseItemClasses,
                    itemLayoutClasses,
                    isActive
                      ? activeItemClass
                      : isCollapsed
                        ? ""
                        : hoverClasses,
                  )}
                  onClick={(event) => {
                    if (!isCollapsed) return;
                    event.preventDefault();
                    handleCollapsedNavigate(item.path);
                  }}
                >
                  <span className={iconWrapClass}>
                    <Icon className="size-6" />
                  </span>
                  <span className={labelClasses}>{item.label}</span>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
