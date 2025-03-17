"use client"

import { useState } from "react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../components/ui/dialog"
import { X } from 'lucide-react'

interface EditAmenityModalProps {
  isOpen: boolean
  onClose: () => void
  amenities: string[]
  onSave: (amenities: string[]) => void
}

export default function EditAmenityModal({
  isOpen,
  onClose,
  amenities: initialAmenities,
  onSave,
}: EditAmenityModalProps) {
  const [amenities, setAmenities] = useState<string[]>(initialAmenities)
  const [newAmenity, setNewAmenity] = useState("")

  const handleAddAmenity = () => {
    if (newAmenity.trim() !== "" && !amenities.includes(newAmenity.trim())) {
      setAmenities([...amenities, newAmenity.trim()])
      setNewAmenity("")
    }
  }

  const handleRemoveAmenity = (amenity: string) => {
    setAmenities(amenities.filter((a) => a !== amenity))
  }

  const handleSave = () => {
    onSave(amenities)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-xl bg-white">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            Edit Amenities
          </DialogTitle>
          <DialogDescription className="text-center text-gray-400">
            Add or remove venue amenities.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 my-4">
          <div className="flex gap-2">
            <Input 
              placeholder="Enter amenity" 
              value={newAmenity}
              onChange={(e) => setNewAmenity(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleAddAmenity()
                }
              }}
            />
            <Button 
              className="bg-purple-600 hover:bg-purple-700"
              onClick={handleAddAmenity}
            >
              Add
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-4">
            {amenities.map((amenity, index) => (
              <div 
                key={index} 
                className="bg-yellow-100 text-yellow-800 border border-yellow-400 px-3 py-1 rounded-full flex items-center gap-1"
              >
                {amenity}
                <button 
                  onClick={() => handleRemoveAmenity(amenity)}
                  className="ml-1 text-yellow-800 hover:text-yellow-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
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
            onClick={handleSave}
          >
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
