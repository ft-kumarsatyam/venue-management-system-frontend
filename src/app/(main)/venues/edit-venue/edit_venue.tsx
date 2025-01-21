"use client"

import type { FC } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../../components/ui/dialog";
import VenueForm from "../add-venue/_add-venue_comps/AddVenueForm";
import MapComp from "../../../../components/Map/Map";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../../../redux/store";
import { fetchVenue } from "../../../../redux/reducer/venue/action";
import { Venue } from "@/redux/reducer/venue/reducer";

interface EditVenueModalProps {
  venueId: string | number | null
  isOpen: boolean
  onClose: () => void
  venueData?: Venue;
  onSuccess?: () => void; 
}

const EditVenueModal: FC<EditVenueModalProps> = ({ venueId, isOpen, onClose, venueData, onSuccess }) => {
  const dispatch = useDispatch<AppDispatch>()
  const [selectedMode, setSelectedMode] = useState<"polygon" | "radius">("radius")
  const { selectedVenue } = useSelector((state: RootState) => state.venue)
  
  console.log("EditVenueModal - Props:", { venueId, isOpen, venueData: !!venueData });

  // ✅ FIXED: Only fetch if modal is open, venueId exists, no venueData provided, and no selectedVenue
  useEffect(() => {
    if (isOpen && venueId && !venueData) {
      console.log("Calling Fetch Venue from edit Venue");
      console.log("Venue ID:", Number(venueId));
      dispatch(fetchVenue(Number(venueId)))
    }
  }, [isOpen, venueId, dispatch, venueData]) // ✅ Removed selectedVenue from dependencies

  // ✅ Set geofencing mode based on venue data
  useEffect(() => {
    const effectiveVenueData = venueData || selectedVenue
    if (effectiveVenueData?.geofencing_type) {
      setSelectedMode(effectiveVenueData.geofencing_type === "1" ? "radius" : "polygon")
    }
  }, [selectedVenue, venueData])

  const handleVenueSaved = (venueId: string | number, venueName: string) => {
    console.log("Venue saved successfully:", { venueId, venueName });
    // Call the success callback if provided
    if (onSuccess) {
      onSuccess()
    }
    onClose()
  }

  const effectiveVenueData = venueData || selectedVenue

  // ✅ Always render the dialog when isOpen is true
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-full max-w-[90%] sm:max-w-6xl p-6 rounded-xl text-black bg-[var(--white)] overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-center text-black font-semibold text-2xl">Edit Venue</DialogTitle>
        </DialogHeader>
        
        {/* ✅ Show content when we have venue data */}
        {venueId && effectiveVenueData && (
          <div className="space-y-6">
            <div className="flex justify-center mb-6">
              {/* Add any additional controls here if needed */}
            </div>
            
            <MapComp />
            
            <VenueForm 
              setIsModalOpen={onClose} 
              venueId={venueId} 
              mode="edit" 
              onVenueSaved={handleVenueSaved}
              initialGeofencingType={selectedMode === "radius" ? "1" : "2"}
            />
          </div>
        )}
        
        {/* ✅ Show loading state when waiting for venue data */}
        {venueId && !effectiveVenueData && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-pulse text-purple-600">
              Loading venue data...
            </div>
          </div>
        )}
        
        {/* ✅ Show error state if no venue ID */}
        {!venueId && (
          <div className="flex justify-center items-center py-8">
            <div className="text-red-500">
              No venue ID provided
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default EditVenueModal