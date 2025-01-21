"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ImageComponent } from "./ImageComponent";
import { Button } from "../../../../../components/ui/button";
import EditZoneSelectionModal from "../../../../../components/modals/edit-zone-selection-modal";
import EditZoneFormModal from "../../../../../components/modals/edit-zone-form-modal";
import EditFacilitySelectionModal from "../../../../../components/modals/edit-facility-selection-modal";
import EditFacilityFormModal from "../../../../../components/modals/edit-facility-form-modal";
import EditAmenityModal from "../../../../../components/modals/edit-amenity-modal";
import EditVenueModal from "../../edit-venue/edit_venue";
import ZoneEditModal from "../../../../../components/modals/zone-edit-modal";
import axiosInstance from "../../../../../api/axiosInstance";

interface SupervisorDetails {
  name: string;
  email: string;
  contact: string;
}

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface ZoneData {
  id: number;
  zone_code: string;
  zone_name: string;
  zone_capacity: number;
  common_zone_status?: number;
}

interface FacilityData {
  id: number;
  sports_name: string | null;
  facility_code: string;
  facility_name: string;
  facility_type: string | null;
  facility_radius: number;
  facility_capacity: number;
  facility_amenities: string[];
  facility_zones?: ZoneData[];
}

interface StadiumDetailsProps {
  name: string;
  capacity: number | undefined;
  supervisor: SupervisorDetails;
  facilities: string[];
  zones: string[];
  amenities: string[];
  image: string;
  venueCode?: string;
  geofencingType?: string;
  coordinates?: Coordinates;
  radius?: number;
  description?: string;
  facilityData?: FacilityData[];
  venueId?: number | string;
  venue_address: string;
  allZonesData?: ZoneData[];
  // Add these new props for data fetching
  onDataRefresh?: () => Promise<void>;
  refreshKey?: string | number;
}

export default function StadiumDetails(props: StadiumDetailsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const {
    name = "",
    capacity,
    supervisor = { name: "", email: "", contact: "" },
    facilities = [],
    zones = [],
    venue_address = "",
    amenities = [],
    image = "",
    venueCode = "",
    geofencingType = "",
    coordinates,
    radius,
    description = "",
    venueId,
    allZonesData = [],
    onDataRefresh,
    refreshKey,
  } = props;

  // State for loading and data refresh
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(Date.now());

  // Existing state variables
  const [isZoneSelectionModalOpen, setIsZoneSelectionModalOpen] = useState(false);
  const [isZoneEditFormModalOpen, setIsZoneEditFormModalOpen] = useState(false);
  const [selectedZoneForEdit, setSelectedZoneForEdit] = useState<string | null>(null);
  const [selectedFacility, setSelectedFacility] = useState("");

  const [isEditVenueModalOpen, setIsEditVenueModalOpen] = useState(false);
  const [isAddZoneModalOpen, setIsAddZoneModalOpen] = useState(false);
  const [isSavingZone, setIsSavingZone] = useState(false);
  const [shouldRefreshZones, setShouldRefreshZones] = useState(false);

  const [isFacilitySelectionModalOpen, setIsFacilitySelectionModalOpen] = useState(false);
  const [isFacilityEditFormModalOpen, setIsFacilityEditFormModalOpen] = useState(false);
  const [selectedFacilityForEdit, setSelectedFacilityForEdit] = useState<string | null>(null);

  const [isAmenityModalOpen, setIsAmenityModalOpen] = useState(false);
  const [currentFacilityAmenities, setCurrentFacilityAmenities] = useState<string[]>([]);
  const [selectedFacilityData, setSelectedFacilityData] = useState<FacilityData | null>(null);

  const facilityData = Array.isArray(props.facilityData) ? props.facilityData : [];

  // Auto-refresh function
  const refreshData = useCallback(async () => {
    if (!onDataRefresh) return;
    
    try {
      setIsRefreshing(true);
      await onDataRefresh();
      setLastRefreshTime(Date.now());
      console.log("Data refreshed successfully at:", new Date().toLocaleTimeString());
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [onDataRefresh]);

  // Auto-refresh on component mount and when navigating to this page
  useEffect(() => {
    // Check if this is a fresh navigation (not a re-render)
    const navigationId = searchParams.get('nav_id') || Date.now().toString();
    const storedNavId = sessionStorage.getItem('stadium_details_nav_id');
    
    if (navigationId !== storedNavId) {
      // This is a fresh navigation, trigger refresh
      sessionStorage.setItem('stadium_details_nav_id', navigationId);
      refreshData();
    }
  }, [refreshData, searchParams]);

  // Refresh when refreshKey changes (if provided by parent)
  useEffect(() => {
    if (refreshKey && refreshKey !== lastRefreshTime) {
      refreshData();
    }
  }, [refreshKey, refreshData, lastRefreshTime]);

  // Auto-refresh on window focus (optional - good UX)
  useEffect(() => {
    const handleFocus = () => {
      const timeSinceLastRefresh = Date.now() - lastRefreshTime;
      // Only refresh if it's been more than 30 seconds since last refresh
      if (timeSinceLastRefresh > 30000) {
        refreshData();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refreshData, lastRefreshTime]);

  // Debug logging with refresh status
  useEffect(() => {
    console.log("StadiumDetails - Props received:", {
      name,
      capacity,
      supervisor,
      facilities,
      zones,
      venue_address,
      amenities,
      facilityData: props.facilityData,
      allZonesData,
      venueId,
      isRefreshing,
      lastRefreshTime: new Date(lastRefreshTime).toLocaleTimeString()
    });
  }, [props, isRefreshing, lastRefreshTime]);

  // Enhanced common zones filtering with better error handling
  const getCommonZones = () => {
    if (Array.isArray(allZonesData) && allZonesData.length > 0) {
      const commonZones = allZonesData.filter(zone => zone.common_zone_status === 1);
      console.log("Common zones found:", commonZones);
      return commonZones;
    }
    // Fallback to the original logic if allZonesData is not available
    const fallbackCommonZones = zones.filter((zone) =>
      zone.toLowerCase().includes("common zone")
    );
    console.log("Fallback common zones:", fallbackCommonZones);
    return fallbackCommonZones;
  };

  const commonZones = getCommonZones();
  const facilityZones = zones.filter(
    (zone) => !zone.toLowerCase().includes("common zone")
  );

  useEffect(() => {
    if (facilityData && facilityData.length > 0) {
      const firstFacility = facilityData[0];
      setSelectedFacility(firstFacility.facility_name);
      setSelectedFacilityData(firstFacility);
      setCurrentFacilityAmenities(Array.isArray(firstFacility.facility_amenities) 
        ? firstFacility.facility_amenities 
        : []);
      console.log("Selected first facility:", firstFacility);
    }
  }, [facilityData]);

  useEffect(() => {
    if (shouldRefreshZones) {
      console.log("Refreshing zones for venue:", venueId);
      refreshData(); // Use the centralized refresh function
      setShouldRefreshZones(false);
    }
  }, [shouldRefreshZones, venueId, refreshData]);

  const handleEditZoneClick = () => {
    setIsZoneSelectionModalOpen(true);
  };

  const handleZoneSelection = (zoneId: number, zoneName: string) => {
    setSelectedZoneForEdit(zoneName);
    setIsZoneSelectionModalOpen(false);
    setIsZoneEditFormModalOpen(true);
  };

  const handleEditFacilityClick = () => {
    setIsFacilitySelectionModalOpen(true);
  };

  const handleFacilitySelection = (facilityName: string) => {
    setSelectedFacilityForEdit(facilityName);
    setIsFacilitySelectionModalOpen(false);
    setIsFacilityEditFormModalOpen(true);
  };

  const handleRemoveAmenity = (name: string) => {
    setCurrentFacilityAmenities(
      currentFacilityAmenities.filter((amenity) => amenity !== name)
    );
  };

  const handleEditVenueClick = () => {
    setIsEditVenueModalOpen(true);
  };

  const handleAddZoneClick = () => {
    if (venueId) {
      // Add navigation ID to ensure refresh on return
      const navId = Date.now().toString();
      router.push(`/zones?venue=${venueId}&nav_id=${navId}`);
    } else {
      console.error("Venue ID is required to navigate to zones");
    }
  };

  const handleAddFacilityClick = () => {
    if (venueId) {
      // Add navigation ID to ensure refresh on return
      const navId = Date.now().toString();
      router.push(`/facilities?venue=${venueId}&nav_id=${navId}`);
    } else {
      console.error("Venue ID is required to navigate to facilities");
    }
  };

  const handleSaveZone = async (formData: FormData) => {
    try {
      setIsSavingZone(true);

      if (venueId) {
        formData.set("venue_id", venueId.toString());
        const venueIdsArray = [Number(venueId)];
        formData.set("venue_ids", JSON.stringify(venueIdsArray));
        formData.set("common_zone_status", "1");
      }

      const response = await axiosInstance.post("/zone", formData);

      if (response.data && response.data.success) {
        console.log("Zone created successfully:", response.data);
        setIsAddZoneModalOpen(false);
        // Trigger data refresh after successful save
        await refreshData();
      } else {
        console.error("Error creating zone:", response.data?.error || "Unknown error");
      }
    } catch (error) {
      console.error("Error saving zone:", error);
    } finally {
      setIsSavingZone(false);
    }
  };

  // Enhanced zone retrieval for selected facility
  const getZonesForSelectedFacility = () => {
    if (!selectedFacilityData) return [];

    const facility = facilityData.find((f) => f.id === selectedFacilityData.id);
    if (!facility || !Array.isArray(facility.facility_zones)) return [];

    return facility.facility_zones.map((zone) => zone.zone_name);
  };

  // Enhanced rendering with better error handling
  if (!name && !venueId) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        <div className="text-gray-500">
          <p>Unable to load venue details. Please try refreshing the page.</p>
          {onDataRefresh && (
            <button 
              onClick={refreshData}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              disabled={isRefreshing}
            >
              {isRefreshing ? "Refreshing..." : "Refresh Data"}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Loading indicator */}
      {isRefreshing && (
        <div className="fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Refreshing data...
          </div>
        </div>
      )}

      {/* Fixed height image container */}
      <div className="relative rounded-lg overflow-hidden h-64 md:h-80">
        <ImageComponent
          src={image || "/assets/stadium.png"}
          alt={`${name || "Venue"} view`}
          width={800}
          height={320}
          className="w-full h-full object-cover"
        />
        
        {/* Manual refresh button */}
        {onDataRefresh && (
          <button
            onClick={refreshData}
            disabled={isRefreshing}
            className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all duration-200 disabled:opacity-50"
            title="Refresh data"
          >
            <svg 
              className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-[var(--black)]">{name || "Venue Name"}</h1>
            {venueCode && (
              <p className="text-sm text-[var(--foreground)]">
                Venue Code:{" "}
                <span className="text-[var(--black)] font-bold">
                  {venueCode}
                </span>
              </p>
            )}
            <p className="text-sm text-[var(--foreground)]">
              Capacity:{" "}
              <span className="text-[var(--black)] font-bold">
                {capacity || "N/A"}
              </span>
            </p>
            {coordinates && (
              <p className="text-sm text-[var(--foreground)]">
                Coordinates:{" "}
                <span className="text-[var(--black)] font-bold">
                  {coordinates.latitude}, {coordinates.longitude}
                </span>
              </p>
            )}
            {radius && (
              <p className="text-sm text-[var(--foreground)]">
                Radius:{" "}
                <span className="text-[var(--black)] font-bold">
                  {radius} Mts.
                </span>
              </p>
            )}
            {venue_address && (
              <p className="text-sm text-[var(--foreground)]">
                Venue Address:{" "}
                <span className="text-[var(--black)] font-bold">
                  {venue_address}
                </span>
              </p>
            )}
          </div>
          <div className="text-left shadow-md p-8 rounded-xl w-full max-w-lg min-h-[220px]">
            <h3 className="text-lg font-semibold text-[var(--black)] mb-4">
              Supervisor Details
            </h3>
            <p className="text-base text-[var(--foreground)] mb-2">
              Name: {supervisor.name || "Not Assigned"}
            </p>
            <p className="text-base text-[var(--foreground)] mb-2">
              Email: {supervisor.email || "Not Assigned"}
            </p>
            <p className="text-base text-[var(--foreground)]">
              Contact: {supervisor.contact || "Not Assigned"}
            </p>
          </div>
        </div>
      </div>

      <div className="pl-4 pr-4 pt-4 border border-gray-300 rounded-2xl">
        <div className="flex justify-between items-center">
          <h2 className="text-gray-600 font-medium text-lg">Common Zones</h2>
          <div className="flex gap-2">
            <Button
              className="bg-gradient-to-r from-[var(--purple-dark-1)] to-[var(--purple-dark-2)] py-2 px-8 rounded-md text-white font-medium"
              onClick={handleAddZoneClick}
            >
              Add Zone/ Edit Zone
            </Button>
          </div>
        </div>
        <span className="text-gray-300 font-medium text-sm">
          Common zones mapped with venue.
        </span>

        <div className="flex flex-wrap gap-2 py-3">
          {commonZones.length > 0 ? (
            commonZones.map((zone, index) => (
              <span
                key={index}
                className="bg-gradient-to-r from-yellow-300 to-yellow-500 text-[#653400] px-6 py-2 rounded-full font-semibold text-sm"
              >
                {typeof zone === 'string' ? zone : (zone as ZoneData).zone_name}
              </span>
            ))
          ) : (
            <p className="text-gray-400 italic">No common zones available</p>
          )}
        </div>
      </div>

      <div className="p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h2 className="font-bold text-lg text-gray-800">Facilities</h2>
            <p className="text-sm text-gray-400 mt-1">
              Select Facility to view zones that are mapped with each facility.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              className="bg-gradient-to-r from-[var(--purple-dark-1)] to-[var(--purple-dark-2)] py-2 px-8 rounded-md text-white font-medium"
              onClick={handleAddFacilityClick}
            >
              Add Facility/ Edit facility
            </Button>
          </div>
        </div>

        <div className="flex gap-6 mt-4 border-b border-gray-200 pb-2 overflow-x-auto">
          {facilityData && facilityData.length > 0 ? (
            facilityData.map((facility) => (
              <button
                key={facility.id}
                onClick={() => {
                  setSelectedFacility(facility.facility_name);
                  setSelectedFacilityData(facility);
                  setCurrentFacilityAmenities(
                    Array.isArray(facility.facility_amenities) 
                      ? facility.facility_amenities 
                      : []
                  );
                }}
                className={`text-sm font-medium pb-1 whitespace-nowrap ${
                  selectedFacility === facility.facility_name
                    ? "text-purple-600 border-b-2 border-purple-600"
                    : "text-gray-400"
                } focus:outline-none`}
              >
                {facility.sports_name || facility.facility_name}
              </button>
            ))
          ) : (
            <p className="text-gray-400 italic py-2">No facilities available</p>
          )}
        </div>

        <div className="flex flex-wrap gap-4 mt-6">
          {selectedFacilityData &&
          Array.isArray(selectedFacilityData.facility_zones) &&
          selectedFacilityData.facility_zones.length > 0 ? (
            selectedFacilityData.facility_zones.map((zone, index) => (
              <span
                key={index}
                className="bg-gradient-to-r from-yellow-300 to-yellow-500 text-[#653400] px-6 py-2 rounded-full font-semibold text-sm"
              >
                {zone.zone_name}
              </span>
            ))
          ) : (
            <p className="text-gray-400 italic">
              No zones mapped to this facility
            </p>
          )}
        </div>
      </div>

      <div className="p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="bg-gradient-to-r from-purple-500 to-purple-900 text-white text-xs px-4 py-1 rounded-full font-semibold inline-block cursor-default select-none mb-2">
              Sport Amenities
            </div>
            <h2 className="font-bold text-lg text-gray-800">
              {selectedFacilityData?.sports_name ||
                selectedFacilityData?.facility_name ||
                "Facility"}{" "}
              Amenities
            </h2>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mt-2">
          {currentFacilityAmenities.length > 0 ? (
            currentFacilityAmenities.map((amenity, index) => (
              <div
                key={index}
                className="bg-gradient-to-r from-yellow-300 to-yellow-500 text-[#653400] px-4 py-2 rounded-full font-medium text-sm flex items-center gap-2"
              >
                {amenity}
              </div>
            ))
          ) : (
            <p className="text-gray-400 italic">
              No amenities available for this facility
            </p>
          )}
        </div>
      </div>

      {/* All the existing modals remain the same */}
      <EditZoneSelectionModal
        isOpen={isZoneSelectionModalOpen}
        onClose={() => setIsZoneSelectionModalOpen(false)}
        onEdit={handleZoneSelection}
        venueData={undefined}
        isLoading={false}
      />

      {selectedZoneForEdit && (
        <EditZoneFormModal
          isOpen={isZoneEditFormModalOpen}
          onClose={() => setIsZoneEditFormModalOpen(false)}
          zoneName={selectedZoneForEdit}
        />
      )}

      <EditFacilitySelectionModal
        isOpen={isFacilitySelectionModalOpen}
        onClose={() => setIsFacilitySelectionModalOpen(false)}
        onEdit={handleFacilitySelection}
        facilities={facilities}
      />

      {selectedFacilityForEdit && (
        <EditFacilityFormModal
          isOpen={isFacilityEditFormModalOpen}
          onClose={() => setIsFacilityEditFormModalOpen(false)}
          facilityName={selectedFacilityForEdit}
          zones={[]}
        />
      )}

      <EditAmenityModal
        isOpen={isAmenityModalOpen}
        onClose={() => setIsAmenityModalOpen(false)}
        amenities={currentFacilityAmenities}
        onSave={setCurrentFacilityAmenities}
      />

      <EditVenueModal
        venueId={venueId?.toString() || null}
        isOpen={isEditVenueModalOpen}
        onClose={() => setIsEditVenueModalOpen(false)}
      />

      <ZoneEditModal
        isOpen={isAddZoneModalOpen}
        onClose={() => setIsAddZoneModalOpen(false)}
        onSave={handleSaveZone}
        zone={undefined}
        setIsEditModalOpen={setIsAddZoneModalOpen}
        isEdit={false}
        venueId={venueId?.toString()}
        facilityId={undefined}
        initialData={{
          ids: venueId ? [Number(venueId)] : [],
        }}
      />
    </div>
  );
}