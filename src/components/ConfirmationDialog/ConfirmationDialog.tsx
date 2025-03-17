import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";

interface GenericModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmationDialog: React.FC<GenericModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  onConfirm,
  confirmText = "Yes",
  cancelText = "No",
}) => {
  return (
<Dialog open={isOpen} onOpenChange={onClose}>
  <DialogContent className="sm:max-w-md bg-[var(--white)] text-center p-6">
    <DialogHeader>
      <DialogTitle className="font-bold mx-auto text-center text-sm text-[var(--black)]">
        {title || "Confirmation"}
      </DialogTitle>
    </DialogHeader>

    {/* Centered Message */}
    <p className="text-sm text-[var(--black)] mt-2">{message}</p>

    {/* Centered Buttons Below */}
    <DialogFooter className="flex justify-center space-x-4 mt-4">
      <Button
        variant="default"
        className="bg-gradient-to-r from-[var(--purple-dark-1)] to-[var(--purple-dark-2)] text-white hover-opacity-[50%]"
        onClick={onConfirm}
      >
        {confirmText}
      </Button>
      <Button
        variant="outline"
        className="bg-[var(--foreground)] text-[var(--white)]"
        onClick={onClose}
      >
        {cancelText}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
  );
};

export default ConfirmationDialog;
