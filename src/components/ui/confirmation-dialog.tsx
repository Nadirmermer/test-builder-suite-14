import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, Trash2, Download, Upload } from "lucide-react";

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'destructive' | 'default' | 'warning';
  onConfirm: () => void;
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Onayla",
  cancelText = "İptal",
  variant = 'default',
  onConfirm,
}: ConfirmationDialogProps) {
  const getIcon = () => {
    switch (variant) {
      case 'destructive':
        return <Trash2 className="h-6 w-6 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="h-6 w-6 text-warning" />;
      default:
        return null;
    }
  };

  const getActionVariant = () => {
    switch (variant) {
      case 'destructive':
        return 'destructive' as const;
      case 'warning':
        return 'default' as const;
      default:
        return 'default' as const;
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="shadow-floating">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            {getIcon()}
            <AlertDialogTitle className="text-lg">{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base leading-relaxed">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-3">
          <AlertDialogCancel className="transition-colors">{cancelText}</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className={`transition-colors ${variant === 'destructive' ? 'bg-destructive hover:bg-destructive/90' : ''}`}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Specialized dialogs for common use cases
export function DeleteConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  itemName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  itemName: string;
}) {
  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Silme Onayı"
      description={`"${itemName}" kalıcı olarak silinecek. Bu işlem geri alınamaz. Devam etmek istiyor musunuz?`}
      confirmText="Sil"
      cancelText="İptal"
      variant="destructive"
      onConfirm={onConfirm}
    />
  );
}

export function DataClearConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      title="DİKKAT: Tüm Veriler Silinecek"
      description="Bu işlem tüm danışan ve test verilerini kalıcı olarak silecektir. Bu işlem geri alınamaz! Devam etmeden önce verilerinizi yedeklediğinizden emin olun."
      confirmText="Tüm Verileri Sil"
      cancelText="İptal"
      variant="destructive"
      onConfirm={onConfirm}
    />
  );
}

export function ImportDataConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Veri İçe Aktarma"
      description="İçe aktarma işlemi mevcut verileri silecek ve yerine yeni verileri yükleyecektir. Bu işlem geri alınamaz. Devam etmek istiyor musunuz?"
      confirmText="İçe Aktar"
      cancelText="İptal"
      variant="warning"
      onConfirm={onConfirm}
    />
  );
}