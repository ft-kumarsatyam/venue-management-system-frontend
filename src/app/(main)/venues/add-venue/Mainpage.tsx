"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../../components/ui/dialog";
import MapComp from "../../../../components/Map/Map";
import VenueForm from "../../../../app/(main)/venues/add-venue/_add-venue_comps/AddVenueForm";
import VenueZoneManager from "../../../../app/(main)/venues/add-venue/_add-venue_comps/VenueZonesManager";
import FacilityForm from "../../../../app/(main)/venues/add-venue/_add-venue_comps/FacilityForm";
import { Dispatch, SetStateAction } from "react"

// Fixed interface - removed duplicate and combined all props
interface AddVenuePageProps {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  onSuccess?: () => void; 
  defaultClusterId?: number 
  presetClusterId?: number; // Add this new prop for locking cluster selection
}

export default function AddVenuePage({ 
  open, 
  setOpen, 
  onSuccess, 
  defaultClusterId, 
  presetClusterId 
}: AddVenuePageProps) {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1)
  const [selectedMode, setSelectedMode] = useState<"polygon" | "radius">("radius")
  const [venueData, setVenueData] = useState<{
    id?: string | number
    name?: string
  }>({})

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) {
      setTimeout(() => {
        setCurrentStep(1)
        setVenueData({})
        setSelectedMode("radius")
      }, 300)
    }
  }

  const handleVenueSaved = (venueId: string | number, venueName: string) => {
    setVenueData({ id: venueId, name: venueName })
    setCurrentStep(2)
    // Call onSuccess callback if provided
    if (onSuccess) {
      onSuccess()
    }
  }

  const handleModeChange = (mode: "polygon" | "radius") => {
    setSelectedMode(mode)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-full max-w-[90%] sm:max-w-6xl p-6 rounded-xl text-black bg-[var(--white)] overflow-y-auto max-h-[90vh] scrollbar-none">
        <DialogHeader>
          <DialogTitle className="text-center text-black font-semibold text-2xl">
            {currentStep === 1 && (presetClusterId ? `Create Venue in Cluster ${presetClusterId}` : "Create Venue")}
            {currentStep === 2 && "Configure Venue Zones"}
            {currentStep === 3 && "Add Facilities"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {currentStep === 1 && (
            <>
              {/* Show cluster context notification */}
              {presetClusterId && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-blue-800">
                        Creating venue for Cluster {presetClusterId}
                      </p>
                      <p className="text-sm text-blue-600">
                        The cluster will be automatically selected and cannot be changed.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-center mb-6">
                <span className="p-2 rounded-full bg-[var(--purple-bg-shadow)]">
                  <button
                    className={`px-6 py-2 rounded-full cursor-pointer ${
                      selectedMode === "polygon"
                        ? "bg-gradient-to-r from-[var(--purple-dark-1)] to-[var(--purple-dark-2)] text-[var(--white)]"
                        : "bg-purple-100 text-purple-700"
                    }`}
                    onClick={() => handleModeChange("polygon")}
                  >
                    Polygon
                  </button>
                  <button
                    className={`px-6 py-2 rounded-full cursor-pointer ${
                      selectedMode === "radius"
                        ? "bg-gradient-to-r from-[var(--purple-dark-1)] to-[var(--purple-dark-2)] text-white"
                        : "bg-purple-100 text-purple-700"
                    }`}
                    onClick={() => handleModeChange("radius")}
                  >
                    Radius
                  </button>
                </span>
              </div>

              <MapComp />
              <VenueForm
                setIsModalOpen={setOpen}
                onVenueSaved={handleVenueSaved}
                initialGeofencingType={selectedMode === "radius" ? "1" : "2"}
                presetClusterId={presetClusterId} // Pass preset cluster ID to form
                defaultClusterId={defaultClusterId} // Pass default cluster ID to form
              />
            </>
          )}

          {currentStep === 2 && venueData.id && (
            <VenueZoneManager
              venueId={venueData.id}
              venueName={venueData.name}
              setShowFacility={() => setCurrentStep(3)}
            />
          )}

          {currentStep === 3 && venueData.id && (
            <FacilityForm
              venueId={venueData.id}
              venueName={venueData.name}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}