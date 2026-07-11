import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  PortalAlertDialogContent,
  portalAlertCancelClass,
  portalAlertDestructiveClass,
  portalButtonDanger,
} from "@/components/portal/PortalUI";

interface AdminConfirmDeleteProps {
  label: string;
  onConfirm: () => void | Promise<void>;
}

export default function AdminConfirmDelete({ label, onConfirm }: AdminConfirmDeleteProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="icon" variant="ghost" className={portalButtonDanger} aria-label={`Delete ${label}`}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <PortalAlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">Delete {label}?</AlertDialogTitle>
          <AlertDialogDescription className="text-white/55">
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className={portalAlertCancelClass}>Cancel</AlertDialogCancel>
          <AlertDialogAction className={portalAlertDestructiveClass} onClick={() => void onConfirm()}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </PortalAlertDialogContent>
    </AlertDialog>
  );
}
