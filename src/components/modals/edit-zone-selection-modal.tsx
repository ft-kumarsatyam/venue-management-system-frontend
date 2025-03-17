"use client"

import { useState, useEffect } from "react"
import { Button } from "../../components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../components/ui/dialog"
import { Loader2, AlertCircle } from "lucide-react"
import axiosInstance from "../../api/axiosInstance"

interface Zone {
  id: number
  venue_id: number
  zone_code: string
  zone_name: string
  zone_capacity: number
  supervisor_name?: string
}

interface EditZoneSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onEdit: (zoneId: number, zoneName: string) => void
  venueData?: any
  isLoading?: boolean
  venueId?: string | number
}

export default function EditZoneSelectionModal({
  isOpen,
  onClose,
  onEdit,
  venueData,
  isLoading: externalLoading = false,
  venueId
}: EditZoneSelectionModalProps) {
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null)
  const [zones, setZones] = useState<Zone[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch zones when the modal opens or venueId changes
  useEffect(() => {
    if (isOpen && venueId) {
      fetchZonesData()
    }
  }, [isOpen, venueId])

  // Also use zones from venueData if provided
  useEffect(() => {
    if (venueData && venueData.zones) {
      setZones(venueData.zones)
    }
  }, [venueData])

  // Reset selection when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedZone(null)
      setError(null)
    }
  }, [isOpen])

  const fetchZonesData = async () => {
    if (!venueId) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await axiosInstance.get(`/venues/${venueId}`)
      if (response.data && response.data.success) {
        setZones(response.data.data.zones || [])
      } else {
        setError(response.data?.error || "Failed to fetch zones")
        setZones([])
      }
    } catch (err) {
      console.error("Error fetching zones:", err)
      setError("An error occurred while fetching zones")
      setZones([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = () => {
    if (selectedZone) {
      onEdit(selectedZone.id, selectedZone.zone_name)
    }
  }

  // Determine if loading state should be shown
  const showLoading = isLoading || externalLoading

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-xl bg-white">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-gray-800">
            Select Zone
          </DialogTitle>
          <DialogDescription className="text-center text-gray-500">
            Choose a zone to edit its details
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2 mb-4">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {showLoading ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            <p className="text-gray-500">Loading zones...</p>
          </div>
        ) : zones.length === 0 ? (
          <div className="text-center py-8 flex flex-col items-center">
            <div className="bg-gray-100 rounded-full p-3 mb-3">
              <AlertCircle className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-gray-600 mb-2">No zones found for this venue</p>
            <p className="text-gray-400 text-sm max-w-xs">
              You can add new zones using the Add Zone button on the venue details page
            </p>
          </div>
        ) : (
          <>
            {/* Zone Selection */}
            <div className="flex flex-wrap justify-center gap-3 py-4 max-h-64 overflow-y-auto">
              {zones.map((zone) => (
                <Button
                  key={zone.id}
                  variant="outline"
                  className={`rounded-full border px-4 py-2 transition-all ${
                    selectedZone?.id === zone.id
                      ? "bg-gradient-to-r from-yellow-300 to-yellow-500 text-[#653400] border-yellow-400"
                      : "border-gray-300 text-gray-700 hover:bg-yellow-50 hover:border-yellow-300"
                  }`}
                  onClick={() => setSelectedZone(zone)}
                >
                  {zone.zone_name}
                </Button>
              ))}
            </div>

            {/* Selected Zone Info */}
            {selectedZone && (
              <div className="bg-gray-50 p-4 rounded-lg mb-2 border border-gray-200">
                <h4 className="font-medium text-sm text-gray-800 mb-2">Zone Details</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p className="text-gray-600">Zone Code:</p>
                  <p className="font-medium text-gray-800">{selectedZone.zone_code}</p>
                  
                  <p className="text-gray-600">Capacity:</p>
                  <p className="font-medium text-gray-800">{selectedZone.zone_capacity}</p>
                  
                  {selectedZone.supervisor_name && (
                    <>
                      <p className="text-gray-600">Supervisor:</p>
                      <p className="font-medium text-gray-800">{selectedZone.supervisor_name}</p>
                    </>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center gap-3 mt-4">
          <Button
            variant="outline"
            className="px-8 bg-white text-gray-700 hover:bg-gray-100 border-gray-300"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className="px-8 bg-gradient-to-r from-purple-600 to-purple-800 text-white hover:opacity-90 transition-all"
            onClick={handleEdit}
            disabled={!selectedZone || showLoading}
          >
            {showLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> 
                Loading...
              </>
            ) : (
              "Edit Zone"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}