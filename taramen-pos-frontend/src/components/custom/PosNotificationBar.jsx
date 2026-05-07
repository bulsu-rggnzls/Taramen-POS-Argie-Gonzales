import { useMemo, useState } from "react";
import { Bell } from "lucide-react";

import Paragraph from "@/components/custom/Paragraph";
import Title from "@/components/custom/Title";
import IButton from "@/components/custom/Button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export default function PosNotificationBar({
  notifications = [],
  count,
}) {
  const unreadCount = count ?? notifications.length;
  const [filter, setFilter] = useState("all");
  const filteredNotifications = useMemo(() => {
    if (filter === "unread") {
      return notifications.filter((item) => item?.unread);
    }
    return notifications;
  }, [filter, notifications]);
  const hasNotifications = filteredNotifications.length > 0;
  const markAllDisabled = unreadCount === 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <IButton
          type="button"
          variant="outline"
          size="icon"
          className="relative size-9 rounded-full border-0 bg-white text-gray-800 shadow-sm hover:bg-white hover:text-taramen-red"
          aria-label="Notifications"
        >
          <Bell className="size-4" />
          {unreadCount > 0 ? (
            <span className="absolute right-2 top-2 size-2 rounded-full bg-taramen-red" />
          ) : null}
        </IButton>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        side="bottom"
        sideOffset={10}
        className="w-[22.5rem] rounded-2xl border border-gray-100 bg-white p-0 shadow-xl"
      >
        <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-4">
          <Title size="sm" className="text-gray-900">
            All Notifications
          </Title>
          <IButton
            type="button"
            variant="outline"
            size="sm"
            showLoading={false}
            disabled={markAllDisabled}
            className="h-8 rounded-full border-orange/40 px-3 text-xs font-semibold text-orange hover:bg-orange/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Mark all as read
          </IButton>
        </div>
        <div className="px-4 pb-3 pt-3">
          <div className="inline-flex items-center gap-1 rounded-full bg-gray-100 p-1">
            <IButton
              type="button"
              variant="ghost"
              size="sm"
              showLoading={false}
              onClick={() => setFilter("all")}
              className={cn(
                "h-8 rounded-full px-3 text-xs font-semibold",
                filter === "all"
                  ? "bg-orange text-white shadow-sm hover:bg-orange"
                  : "text-gray-600 hover:bg-transparent hover:text-gray-900",
              )}
            >
              All
            </IButton>
            <IButton
              type="button"
              variant="ghost"
              size="sm"
              showLoading={false}
              onClick={() => setFilter("unread")}
              className={cn(
                "h-8 rounded-full px-3 text-xs font-semibold",
                filter === "unread"
                  ? "bg-orange text-white shadow-sm hover:bg-orange"
                  : "text-gray-600 hover:bg-transparent hover:text-gray-900",
              )}
            >
              Unread
            </IButton>
          </div>
        </div>
        <div className="max-h-[22.5rem] overflow-auto px-4 pb-4">
          {hasNotifications ? (
            <ul className="space-y-3">
              {filteredNotifications.map((item, index) => {
                const toneClass = item?.tone
                  ? item.tone
                  : item?.unread
                    ? "bg-blue-50 text-gray-900"
                    : "bg-gray-50 text-gray-900";
                return (
                  <li
                    key={`${item.title}-${index}`}
                    className={cn(
                      "rounded-xl border border-transparent px-4 py-3 shadow-sm",
                      toneClass,
                    )}
                  >
                    <Title size="xs" className="text-gray-900">
                      {item.title}
                    </Title>
                    {item.description ? (
                      <Paragraph
                        className="mt-1 text-gray-500"
                        size="xs"
                        variant="muted"
                      >
                        {item.description}
                      </Paragraph>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          ) : (
            <Paragraph className="py-6 text-center text-gray-500" size="sm" variant="muted">
              No new notifications.
            </Paragraph>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
