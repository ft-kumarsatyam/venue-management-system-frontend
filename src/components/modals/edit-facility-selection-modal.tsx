"use client"

import { useState } from "react"
import { Button } from "../../components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../components/ui/dialog"

interface EditFacilitySelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onEdit: (facilityName: string) => void
  facilities: string[]
}

export default function EditFacilitySelectionModal({
  isOpen,
  onClose,
  onEdit,
  facilities,
}: EditFacilitySelectionModalProps) {
  const [selectedFacility, setSelectedFacility] = useState<string | null>(null)

  const handleEdit = () => {
    if (selectedFacility) {
      onEdit(selectedFacility)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-xl bg-white">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            Edit Facility
          </DialogTitle>
          <DialogDescription className="text-center text-gray-400">
            Select Facility to edit details.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-wrap justify-center gap-3 my-4">
          {facilities.map((facility, index) => (
            <Button
              key={`${facility}-${index}`}
              variant="outline"
              className={`rounded-full border-yellow-400 text-yellow-500 hover:bg-yellow-50 ${
                selectedFacility === facility ? "bg-yellow-400 text-white hover:bg-yellow-400" : ""
              }`}
              onClick={() => setSelectedFacility(facility)}
            >
              {facility}
            </Button>
          ))}
        </div>
        <div className="flex justify-center gap-3 mt-4">
          <Button
            variant="outline"
            className="px-8 bg-gray-400 text-white hover:bg-gray-500 border-none"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className="px-8 bg-purple-600 hover:bg-purple-700"
            onClick={handleEdit}
            disabled={!selectedFacility}
          >
            Edit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
