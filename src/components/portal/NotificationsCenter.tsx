import { useState } from "react";
import { Link } from "react-router-dom";
import { Bell, CheckCheck, Inbox, RefreshCw } from "lucide-react";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useUnreadNotificationCount,
} from "@/hooks/portal/useNotifications";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { PortalPopoverContent, portalButtonOutline } from "@/components/portal/PortalUI";
import { cn } from "@/lib/utils";
import { portalRoutes } from "@/routes/portal";
import { toast } from "sonner";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationsCenter() {
  const [open, setOpen] = useState(false);
  const { data: notifications, isLoading, error, refetch, isRefetching } = useNotifications();
  const unread = useUnreadNotificationCount();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const handleMarkRead = async (id: string) => {
    try {
      await markRead.mutateAsync(id);
    } catch {
      toast.error("Failed to mark as read");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllRead.mutateAsync();
    } catch {
      toast.error("Failed to mark all as read");
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="portal-focus-ring portal-interactive relative rounded-lg p-2 text-white/50 hover:bg-white/10 hover:text-white"
          aria-label={`Notifications${unread > 0 ? `, ${unread} unread` : ""}`}
        >
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-bold text-white">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PortalPopoverContent align="end" className="w-80 p-0 sm:w-96">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <p className="font-semibold">Notifications</p>
          {unread > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-white/50 hover:text-white"
              onClick={handleMarkAllRead}
              disabled={markAllRead.isPending}
            >
              <CheckCheck className="mr-1 h-3.5 w-3.5" />
              Mark all read
            </Button>
          )}
        </div>

        <div className="max-h-[320px] overflow-y-auto">
          {isLoading && (
            <p className="px-4 py-8 text-center text-sm text-white/40">Loading…</p>
          )}
          {error && !isLoading && (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-red-300">Could not load notifications</p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 text-xs text-white/60 hover:text-white"
                onClick={() => refetch()}
                disabled={isRefetching}
              >
                <RefreshCw className={`mr-1 h-3.5 w-3.5 ${isRefetching ? "animate-spin" : ""}`} />
                Retry
              </Button>
            </div>
          )}
          {!isLoading && !error && !notifications?.length && (
            <div className="px-4 py-8 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.04]">
                <Inbox className="h-5 w-5 text-white/30" />
              </div>
              <p className="text-sm text-white/40">
                No notifications yet — lab applications, connection requests, and studio or essay moderation updates will appear here.
              </p>
              <Link
                to={portalRoutes.debriefed}
                onClick={() => setOpen(false)}
                className="mt-2 inline-block text-xs text-emerald-400 hover:underline"
              >
                Read Debriefed →
              </Link>
            </div>
          )}
          {notifications?.map((n) => (
            <div
              key={n.id}
              className={cn(
                "border-b border-white/[0.06] px-4 py-3 transition last:border-0",
                !n.read && "bg-emerald-500/[0.04]",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white">{n.title}</p>
                  <p className="mt-0.5 text-xs text-white/50">{n.body}</p>
                  <p className="mt-1 text-[10px] text-white/30">{timeAgo(n.createdAt)}</p>
                </div>
                {!n.read && (
                  <button
                    type="button"
                    onClick={() => handleMarkRead(n.id)}
                    className="shrink-0 rounded-full bg-emerald-500/20 p-1 text-emerald-300 hover:bg-emerald-500/30"
                    aria-label="Mark as read"
                  >
                    <CheckCheck className="h-3 w-3" />
                  </button>
                )}
              </div>
              {n.link && (
                <Link
                  to={n.link}
                  onClick={() => {
                    if (!n.read) handleMarkRead(n.id);
                    setOpen(false);
                  }}
                  className="mt-2 inline-block text-xs text-emerald-400 hover:underline"
                >
                  View →
                </Link>
              )}
            </div>
          ))}
        </div>
      </PortalPopoverContent>
    </Popover>
  );
}
