"use client"

import { Dialog, DialogContent } from "../../components/ui/dialog"
import { Button } from "../../components/ui/button"
import Swal from "sweetalert2"

interface DeleteConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void> // Make sure the parent sends an async handler
  itemType?: string
  itemName?: string
  isDeleting?: boolean
  title?: string
  message?: string
  isLoading?: boolean
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  isDeleting = false,
}: DeleteConfirmationModalProps) {
  const handleConfirm = async () => {
    try {
      await onConfirm()

      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Item has been successfully deleted.",
        confirmButtonColor: "#7942d1",
      })

      onClose()
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Something went wrong. Please try again.",
        confirmButtonColor: "#7942d1",
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 flex flex-col items-center">
          <h2 className="text-lg font-medium mb-6">You want to delete this?</h2>

          <div className="flex justify-center space-x-4 w-full">
            <Button
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-md"
              onClick={onClose}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-md"
              onClick={handleConfirm}
              disabled={isDeleting}
            >
              Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
