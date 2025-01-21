"use client";

import React, { useEffect, useState } from "react";
import { PageHeader } from "../../../../../components/pageheader/PageHeader";
import StadiumDetails from "./StadiumDetails";
import { Button } from "../../../../../components/ui/button";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { fetchVenue } from "../../../../../redux/reducer/venue/action";
import { RootState, AppDispatch } from "../../../../../redux/store";
import EditVenueModal from "../../edit-venue/edit_venue";

export default function ViewVenueComp() {
  const params = useParams();
  const dispatch = useDispatch<AppDispatch>();

  const venueState = useSelector((state: RootState) => state.venue);
  const { selectedVenue: venueData, loading, error } = venueState;
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const rawVenueID = params?.venueID || params?.id;
  const venueID = Array.isArray(rawVenueID) ? rawVenueID[0] : rawVenueID;

  // Debug logging - Fixed dependencies
  useEffect(() => {
    console.log("ViewVenueComp - Debug Info:", {
      venueID,
      rawVenueID,
      params,
      venueData,
      loading,
      error,
      venueState,
    });
  }, [venueID, rawVenueID, venueData, loading, error]); 

  // ✅ FIXED: Only fetch once when component mounts or venueID changes
  useEffect(() => {
    if (venueID && !venueData) {
      console.log("Dispatching fetchVenue for ID:", venueID);
      dispatch(fetchVenue(Number(venueID)));
    }
  }, [dispatch, venueID]); // ✅ Removed loading and venueData from dependencies

  const handleOpenEditModal = () => {
    console.log("Opening edit modal");
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    console.log("Closing edit modal");
    setIsEditModalOpen(false);
  };

  // ✅ Added onSuccess handler to refresh data after edit
  const handleEditSuccess = () => {
    console.log("Edit successful, refreshing venue data");
    if (venueID) {
      dispatch(fetchVenue(Number(venueID)));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-pulse text-purple-600">
          Loading venue details...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-red-500">
          Error loading venue: {error.message || "Unknown error"}
        </div>
      </div>
    );
  }

  if (!venueData || Object.keys(venueData).length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-gray-500">
          <div className="text-center">
            <p className="text-lg mb-2">Venue not found.</p>
            <button
              onClick={() => {
                console.log("Retrying fetch for venue ID:", venueID);
                if (venueID) {
                  dispatch(fetchVenue(Number(venueID)));
                }
              }}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              Retry
            </button>
          </div>
          {process.env.NODE_ENV === "development" && (
            <div className="mt-4 text-xs bg-gray-100 p-4 rounded">
              <p>
                <strong>Debug Info:</strong>
              </p>
              <p>VenueID: {venueID || "undefined"}</p>
              <p>Raw VenueID: {JSON.stringify(rawVenueID)}</p>
              <p>Params: {JSON.stringify(params)}</p>
              <p>Redux loading state: {loading ? "true" : "false"}</p>
              <p>VenueData exists: {venueData ? "true" : "false"}</p>
              <p>
                VenueData keys: {venueData ? Object.keys(venueData).length : 0}
              </p>
              <p>Error: {error ? JSON.stringify(error) : "none"}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Enhanced facility data processing with better error handling
  const facilityData = Array.isArray(venueData.facilities)
    ? venueData.facilities.map((facility: any) => ({
        id: facility.id,
        sports_name: facility.sports_name || null,
        facility_code: facility.facility_code || "",
        facility_name: facility.facility_name || "",
        facility_type: facility.facility_type || null,
        facility_radius: facility.facility_radius || 0,
        facility_capacity: facility.facility_capacity || 0,
        facility_amenities: Array.isArray(facility.facility_amenities)
          ? facility.facility_amenities
          : facility.facility_amenities
          ? [facility.facility_amenities]
          : [],
        facility_zones: Array.isArray(facility.facility_zones)
          ? facility.facility_zones
          : [],
      }))
    : [];

  // Enhanced zone data processing
  const zoneNames = Array.isArray(venueData.zones)
    ? venueData.zones.map((zone: any) => zone.zone_name || zone.name || "")
    : [];

  const venueAmenities = (
    Array.isArray(venueData.amenities) ? venueData.amenities : []
  ) as string[];

  // Enhanced zones data for common zones filtering
  const allZonesData = Array.isArray(venueData.zones) ? venueData.zones : [];

  return (
    <main className="space-y-6 bg-[var(--white)] rounded-lg px-5 py-7 mb-5">
      <PageHeader
        title1="Home"
        title2="Venues"
        description="View Venue Details."
      />
      <div className="max-w-full px-4 mx-auto">
        <div className="flex justify-end mb-4 px-6">
          <div className="flex gap-2">
            <Button
              onClick={handleOpenEditModal}
              className="bg-[linear-gradient(to_right,#7942d1,#2a1647)] hover:bg-purple-700 text-white"
            >
              Edit Venue
            </Button>
          </div>
        </div>

        {/* ✅ FIXED: Modal should always render when isEditModalOpen is true */}
        {isEditModalOpen && venueID && (
          <EditVenueModal
            venueId={venueID}
            isOpen={isEditModalOpen}
            onClose={handleCloseEditModal}
            venueData={venueData}
            onSuccess={handleEditSuccess}
          />
        )}

        <StadiumDetails
          name={venueData.venue_name || ""}
          capacity={venueData.venue_capacity}
          supervisor={{
            name: venueData.supervisor_name || "",
            email: venueData.supervisor_email || "",
            contact: venueData.supervisor_contact || "",
          }}
          facilities={facilityData.map((f: any) => f.facility_name)}
          zones={zoneNames}
          amenities={venueAmenities}
          image={venueData.image_url || ""}
          venue_address={venueData.venue_address || ""}
          venueCode={venueData.venue_code || ""}
          description={venueData.venue_description || ""}
          geofencingType={venueData.geofencing_type || ""}
          coordinates={
            typeof venueData.coordinates === "object" &&
            venueData.coordinates !== null &&
            "latitude" in venueData.coordinates &&
            "longitude" in venueData.coordinates
              ? venueData.coordinates
              : undefined
          }
          radius={venueData.venue_radius}
          facilityData={facilityData}
          venueId={venueID}
          allZonesData={allZonesData}
        />
      </div>
    </main>
  );
}