"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { MapIcon, Trash, Edit, Eye, RefreshCw } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import StatsCard from "../../../components/Cards/StatsCards/StatsCard";
import { useRouter, useSearchParams } from "next/navigation";
import { BreadcrumbNav } from "../../../components/ui/breadcrumb-nav";
import ZoneDetailsModal from "../../../components/modals/zone-details-modal";
import ZoneEditModal, {
  type Zone,
} from "../../../components/modals/zone-edit-modal";
import TableComp from "../../../components/Table/TableComp";
import CreateButton from "../../../components/ui/createbutton";
import DeleteConfirmationModal from "../../../components/modals/delete-confirmation-modal";
import {
  fetchZones,
  createZone,
  updateZone,
  deleteZone,
} from "../../../redux/reducer/zones/action";
import type { AppDispatch } from "../../../redux/store";
import { getZonesByFacility } from "../../../redux/reducer/facilities/action";
import Pagination from "../../../components/ui/pagination";
import Swal from "sweetalert2";

interface ZoneDetailsType {
  id: string;
  zone_name: string;
  zone_supervisor: string;
  capacity: number;
  coordinates?: {
    latitude?: string;
    longitude?: string;
  };
  email?: string;
  contact?: string;
  facility?: string;
  facility_id?: number;
  image?: string;
  venue_id?: number;
  zone_code?: string;
  zone_capacity?: number;
  supervisor_name?: string;
  supervisor_email?: string;
  supervisor_contact?: string;
  image_url?: string;
  geofencing_type?: number;
  zone_radius?: string;
}

interface ZoneEditType {
  zone_radius: any;
  id?: string | number;
  zone_code?: string;
  zone_name?: string;
  zone_capacity?: number;
  geofencing_type?: number | string;
  coordinates?: {
    latitude?: number;
    longitude?: number;
  };
  image_url?: File | null;
  supervisor_name?: string;
  supervisor_email?: string;
  supervisor_contact?: string;
  supervisor_id?: number | null;
  venue_ids?: (string | number)[] | string;
  facility_id?: number | string | null;
}

const columns = [
  { key: "serial", label: "S.No" },
  { key: "zone_code", label: "Zone Code" },
  { key: "zone_name", label: "Zone Name" },
  { key: "supervisor_name", label: "Zone Supervisor" },
  { key: "zone_capacity", label: "Capacity" },
];

export default function ZonesPage() {
  const dispatch: AppDispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();

  const facilityId = searchParams.get("facility");
  const venueId = searchParams.get("venue");

  const {
    zones: apiZones,
    loading,
    error,
    pagination,
  } = useSelector((state: any) => state.zone);
  const { zonesByFacility } = useSelector((state: any) => state.facility);

  const [selectedDetailsZone, setSelectedDetailsZone] =
    useState<ZoneDetailsType | null>(null);
  const [selectedEditZone, setSelectedEditZone] = useState<ZoneEditType | null>(
    null
  );
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [facilityName, setFacilityName] = useState("");
  const [venueName, setVenueName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Get zones data and pagination info based on context
  const getZonesData = () => {
    if (facilityId) {
      // For facility-specific zones
      const facilityZones = zonesByFacility?.data || [];
      const facilityPagination = zonesByFacility?.pagination || {
        totalItems: 0,
        totalPages: 1,
        currentPage: 1,
        itemsPerPage: 10,
        hasNextPage: false,
        hasPrevPage: false,
      };
      
      // Get facility name from API response with proper fallback
      let facilityDisplayName = zonesByFacility?.facilityName;
      
      // Check if it's a meaningful name (not "Unknown Facility" or empty)
      if (!facilityDisplayName || facilityDisplayName === "Unknown Facility" || facilityDisplayName.trim() === "") {
        // Try to get from first zone's facility_name
        if (facilityZones.length > 0 && facilityZones[0].facility_name && facilityZones[0].facility_name !== "Unknown Facility") {
          facilityDisplayName = facilityZones[0].facility_name;
        } else {
          // Use generic fallback only as last resort
          facilityDisplayName = `Facility ${facilityId}`;
        }
      }
      
      return {
        zones: facilityZones,
        pagination: facilityPagination,
        facilityType: facilityDisplayName,
      };
    } else {
      // For all zones or venue zones
      return {
        zones: apiZones || [],
        pagination: pagination || {
          totalItems: 0,
          totalPages: 1,
          currentPage: 1,
          itemsPerPage: 10,
          hasNextPage: false,
          hasPrevPage: false,
        },
        facilityType: "",
      };
    }
  };

  const { zones: zonesData, pagination: paginationData, facilityType } = getZonesData();

  // Ensure zones is always an array with proper id formatting
  const zones = Array.isArray(zonesData)
    ? zonesData.map((zone: any) => ({
        ...zone,
        id: zone.id?.toString() || "",
      }))
    : [];

  const breadcrumbItems = facilityId
    ? [
        { label: "Home", href: "/" },
        { label: "Venues", href: "/venues" },
        // { label: , href: `/venues?venue` },
        { label: "Facilities", href: `/facilities?venue` },
        { label: facilityName || facilityType || `Facility ${facilityId}`, href: "#" },
        { label: "Zones", active: true },
      ]
    : venueId
    ? [
        { label: "Home", href: "/" },
        { label: "Venues", href: "/venues" },
        {
          label: venueName || `Venue ${venueId}`,
          href: `/venues?venue=${venueId}`,
        },
        { label: "Zones", active: true },
      ]
    : [
        { label: "Dashboard", href: "/" },
        { label: "Zones", href: "/zones", active: true },
      ];

  // Load zone data when component mounts or dependencies change
  useEffect(() => {
    loadZoneData();
  }, [dispatch, facilityId, venueId, currentPage]);

  // Reload data when search term changes but reset to page 1
  useEffect(() => {
    if (searchTerm) {
      setCurrentPage(1);
    }
  }, [searchTerm]);

  const loadZoneData = async () => {
    try {
      if (facilityId) {
        // For facility zones, use pagination
        await dispatch(getZonesByFacility(Number(facilityId), currentPage, itemsPerPage));
        
        if (venueId) {
          fetchVenueName(venueId);
        }
      } else if (venueId) {
        // For venue zones, use pagination
        await dispatch(fetchZones(venueId, true, currentPage, itemsPerPage));
        fetchVenueName(venueId);
      } else {
        // For all zones, use pagination
        await dispatch(fetchZones(null, true, currentPage, itemsPerPage));
      }
    } catch (error) {
      console.error("Error loading zone data:", error);
      // Don't clear the zones data on error - keep showing what we have
    }
  };

  const fetchFacilityName = async (id: string) => {
    try {
      setFacilityName(`Facility ${id}`);
    } catch (error) {
      console.error("Error fetching facility name:", error);
      setFacilityName(`Facility ${id}`);
    }
  };

  const fetchVenueName = async (id: string) => {
    try {
      setVenueName(`Venue ${id}`);
    } catch (error) {
      console.error("Error fetching venue name:", error);
      setVenueName(`Venue ${id}`);
    }
  };

  const convertToDetailsFormat = (zone: any): ZoneDetailsType => {
    return {
      id: zone.id.toString(),
      zone_name: zone.zone_name,
      zone_supervisor: zone.supervisor_name || zone.zone_supervisor,
      capacity: zone.zone_capacity || zone.capacity,
      coordinates:
        zone.coordinates && typeof zone.coordinates === "object"
          ? {
              latitude: zone.coordinates.latitude || "",
              longitude: zone.coordinates.longitude || "",
            }
          : zone.coordinates,
      email: zone.supervisor_email || zone.email,
      contact: zone.supervisor_contact || zone.contact,
      facility: facilityName || facilityType || zone.facility,
      facility_id: facilityId ? Number(facilityId) : zone.facility_id,
      image: zone.image_url || zone.image,
      image_url: zone.image_url || zone.image,
      venue_id: venueId ? Number(venueId) : zone.venue_id,
      zone_code: zone.zone_code,
      zone_capacity: zone.zone_capacity || zone.capacity,
      supervisor_name: zone.supervisor_name || zone.zone_supervisor,
      supervisor_email: zone.supervisor_email || zone.email,
      supervisor_contact: zone.supervisor_contact || zone.contact,
      geofencing_type: zone.geofencing_type,
      zone_radius: zone.zone_radius,
    };
  };

  const convertToEditFormat = (zone: any): ZoneEditType => {
    let coordinates;
    if (typeof zone.coordinates === "string") {
      const [lat, lng] = zone.coordinates
        .split(",")
        .map((c: string) => Number.parseFloat(c.trim()));
      coordinates = {
        latitude: isNaN(lat) ? undefined : lat,
        longitude: isNaN(lng) ? undefined : lng,
      };
    } else if (typeof zone.coordinates === "object") {
      coordinates = zone.coordinates;
    }

    let venueIdsList;
    if (venueId) {
      venueIdsList = [Number(venueId)];
    } else if (zone.venue_ids && Array.isArray(zone.venue_ids)) {
      venueIdsList = zone.venue_ids;
    } else if (zone.venue_id) {
      venueIdsList = [Number(zone.venue_id)];
    } else {
      venueIdsList = [];
    }

    return {
      id: zone.id.toString(),
      zone_code: zone.zone_code || "",
      zone_name: zone.zone_name,
      supervisor_name: zone.supervisor_name || zone.zone_supervisor,
      zone_capacity: zone.zone_capacity || zone.capacity,
      coordinates,
      supervisor_email: zone.supervisor_email || zone.email,
      supervisor_contact: zone.supervisor_contact || zone.contact,
      facility_id: facilityId ? Number(facilityId) : zone.facility_id,
      image_url: zone.image_url || zone.image,
      venue_ids: venueIdsList,
      geofencing_type: zone.geofencing_type || 1,
      zone_radius: zone.zone_radius,
    };
  };

  const handleViewClick = (zone: any) => {
    setSelectedDetailsZone(convertToDetailsFormat(zone));
    setIsDetailsModalOpen(true);
  };

  const handleEditClick = (zone: any) => {
    setSelectedEditZone(convertToEditFormat(zone));
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (zone: any) => {
    setSelectedDetailsZone(convertToDetailsFormat(zone));
    setIsDeleteModalOpen(true);
  };

  const handleRefresh = async () => {
    try {
      setCurrentPage(1);
      setSearchTerm("");
      await loadZoneData();
    } catch (error) {
      console.error("Error refreshing zones:", error);
      console.warn("Failed to refresh zones. Please try again.");
    }
  };

  const handlePageChange = (page: number) => {
    console.log("Changing to page:", page);
    setCurrentPage(page);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedDetailsZone) return;

    setIsDeleting(true);

    try {
      await dispatch(deleteZone(Number.parseInt(selectedDetailsZone.id, 10)));

      Swal.fire({
        title: "Success",
        text: `Zone "${selectedDetailsZone.zone_name}" deleted successfully.`,
        icon: "success",
        confirmButtonColor: "#7942d1",
      });

      // Reload data after deletion
      await loadZoneData();

      setIsDeleteModalOpen(false);
      setSelectedDetailsZone(null);
    } catch (error) {
      console.error("Error deleting zone:", error);

      Swal.fire({
        title: "Error",
        text: "Failed to delete zone.",
        icon: "error",
        confirmButtonColor: "#7942d1",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveZone = async (formData: FormData) => {
    try {
      console.log("In Page.tsx - handleSaveZone");

      for (const pair of formData.entries()) {
        console.log(
          pair[0],
          pair[1] instanceof File ? `File: ${pair[1].name}` : pair[1]
        );
      }

      if (selectedEditZone?.id) {
        await dispatch(
          updateZone(
            Number.parseInt(selectedEditZone.id.toString(), 10),
            formData
          )
        );

        Swal.fire({
          title: "Success",
          text: "Zone updated successfully.",
          icon: "success",
          confirmButtonColor: "#7942d1",
        });
      } else {
        await dispatch(createZone(formData));

        Swal.fire({
          title: "Success",
          text: "Zone created successfully.",
          icon: "success",
          confirmButtonColor: "#7942d1",
        });
      }

      // Always reload data after successful operation
      try {
        await loadZoneData();
      } catch (refreshError) {
        console.error("Error refreshing zone list:", refreshError);
      }

      setIsEditModalOpen(false);
      setSelectedEditZone(null);
    } catch (error) {
      console.error("Error saving zone:", error);
      
      // Even on error, try to reload the data to show current state
      try {
        await loadZoneData();
      } catch (refreshError) {
        console.error("Error refreshing zone list after error:", refreshError);
      }
      
      // Show error message but don't reload page
      Swal.fire({
        title: "Error",
        text: "Failed to save zone. Please try again.",
        icon: "error",
        confirmButtonColor: "#7942d1",
      });
    }
  };

  // Server-side filtering for large datasets, client-side for smaller ones
  const getFilteredZones = () => {
    // If we have pagination from server, assume server handles filtering
    if (paginationData.totalPages > 1 && !searchTerm) {
      return zones;
    }
    
    // Otherwise, filter client-side
    return zones.filter((zone: any) => {
      if (!searchTerm) return true;
      
      const zoneName = zone.zone_name || "";
      const zoneSupervisor = zone.supervisor_name || zone.zone_supervisor || "";
      const zoneId = zone.id ? zone.id.toString() : "";
      const zoneCode = zone.zone_code || "";

      return (
        zoneName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        zoneSupervisor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        zoneId.includes(searchTerm) ||
        zoneCode.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  };

  const filteredZones = getFilteredZones();

  // Get current page items with serial numbers
  const getCurrentPageItems = () => {
    // If server handles pagination, use zones as-is
    if (paginationData.totalPages > 1 && !searchTerm) {
      return zones.map((item, index) => ({
        ...item,
        serial: (paginationData.currentPage - 1) * itemsPerPage + index + 1,
      }));
    }
    
    // Otherwise, handle pagination client-side
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    return filteredZones.slice(startIndex, endIndex).map((item, index) => ({
      ...item,
      serial: startIndex + index + 1,
    }));
  };

  const currentItems = getCurrentPageItems();

  const ActionObj = [
    {
      icon: Edit,
      title: "Edit",
      onClick: (id: string) => {
        const zone = zones.find((item: any) => item.id.toString() === id);
        if (zone) handleEditClick(zone);
      },
    },
    {
      icon: Trash,
      title: "Delete",
      onClick: (id: string) => {
        const zone = zones.find((item: any) => item.id.toString() === id);
        if (zone) handleDeleteClick(zone);
      },
    },
    {
      icon: Eye,
      title: "View",
      onClick: (id: string) => {
        const zone = zones.find((item: any) => item.id.toString() === id);
        if (zone) handleViewClick(zone);
      },
    },
  ];

  function mapToZoneFormat(
    selectedEditZone: ZoneEditType | null
  ): Zone | undefined {
    if (!selectedEditZone) return undefined;

    let coordinates = undefined;
    if (selectedEditZone.coordinates) {
      if (
        typeof selectedEditZone.coordinates.latitude === "number" &&
        typeof selectedEditZone.coordinates.longitude === "number"
      ) {
        coordinates = {
          latitude: selectedEditZone.coordinates.latitude,
          longitude: selectedEditZone.coordinates.longitude,
        };
      }
    }

    return {
      id: selectedEditZone.id,
      zone_code: selectedEditZone.zone_code || "",
      zone_name: selectedEditZone.zone_name || "",
      zone_capacity: selectedEditZone.zone_capacity || 0,
      supervisor_name: selectedEditZone.supervisor_name || "",
      supervisor_email: selectedEditZone.supervisor_email || "",
      supervisor_contact: selectedEditZone.supervisor_contact || "",
      coordinates: coordinates,
      zone_radius: selectedEditZone.zone_radius,
      geofencing_type: (selectedEditZone.geofencing_type as number) || 1,
      image_url: selectedEditZone.image_url ?? null,
      common_zone_status: selectedEditZone.facility_id ? "0" : "1",
    };
  }

  // Get proper page title
  const getPageTitle = () => {
    if (facilityId) {
      // Don't show "unknown" - use actual facility name or generic fallback
      const displayName = facilityType && facilityType !== "Unknown Facility" 
        ? facilityType 
        : `Facility ${facilityId}`;
      return `Zones for ${displayName}`;
    }
    return "All Zones";
  };

  const getPageDescription = () => {
    if (facilityId) {
      const displayName = facilityType && facilityType !== "Unknown Facility" 
        ? facilityType 
        : "this facility";
      return `View and manage zones for ${displayName}`;
    }
    return "View and manage all zones across facilities";
  };

  console.log("Current Page:", currentPage);
  console.log("Pagination Data:", paginationData);
  console.log("Facility Type:", facilityType);
  console.log("Zones By Facility:", zonesByFacility);
  console.log("Zones Data:", zones);
  console.log("Filtered Zones:", filteredZones);

  return (
    <div className="space-y-6 bg-[var(--white)] rounded-lg px-5 py-7 mr-5 mb-5">
      <BreadcrumbNav items={breadcrumbItems} /> 

      <div className="mb-4">
        <h1 className="font-[Poppins] text-2xl font-semibold tracking-tight text-[#2A1647]">
          {getPageTitle()}
        </h1>
        <p className="py-2 font-[Poppins] text-[14px] leading-[100%] tracking-[5%] text-[#A0AEC0]">
          {getPageDescription()}
        </p>
      </div>

      <div className="grid gap-6 grid-cols-2 md:grid-cols-3">
        <StatsCard
          title="Total Zones"
          value={searchTerm ? filteredZones.length : paginationData.totalItems}
          link={"/"}
          icon={<MapIcon className="h-5 w-5 text-[#7942d1]" />}
          lastMonthValue={""}
        />
        <CreateButton
          label="Add Zone"
          onClick={() => {
            setSelectedEditZone(null);
            setIsEditModalOpen(true);
          }}
        />
        <div className="ml-auto">
          {/* <RefreshCw
            size={20}
            className="text-muted-foreground cursor-pointer hover:text-purple-600"
            onClick={handleRefresh}
          /> */}
        </div>
      </div>

      <div className="bg-white rounded-lg overflow-hidden">
        <div className="pb-8">
          <h1 className="font-bold tracking-tight text-[#2A1647] all-venues-text">
            All Zones
          </h1>
        </div>

        <div className="pb-6 px-1 flex justify-between gap-2">
          <Input
            className="border-[var(--background)] p-2 placeholder-[var(--foreground)] w-100 pt-[1.1vw] pb-[1.1vw]"
            placeholder="Search Zones by Name, Code or Supervisor"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>

        <div>
          {loading && zones.length === 0 ? (
            <div className="flex justify-center py-8">Loading zones...</div>
          ) : error && zones.length === 0 ? (
            <div className="flex justify-center py-8 text-red-500">
              Error loading zones: {error}
            </div>
          ) : currentItems.length === 0 ? (
            <div className="flex justify-center py-8 text-gray-500">
              {searchTerm ? "No zones match your search" : "No zones found"}
            </div>
          ) : (
            <TableComp
              columns={columns}
              data={currentItems}
              actions={ActionObj}
              keyField="id"
            />
          )}

          {/* Show pagination for server-side pagination or client-side when needed */}
          {(() => {
            const shouldShowPagination = searchTerm 
              ? Math.ceil(filteredZones.length / itemsPerPage) > 1
              : paginationData.totalPages > 1;
              
            const totalPages = searchTerm 
              ? Math.ceil(filteredZones.length / itemsPerPage)
              : paginationData.totalPages;
              
            const totalItems = searchTerm 
              ? filteredZones.length
              : paginationData.totalItems;

            return shouldShowPagination && (
              <div className="mt-4">
                <Pagination
                  currentPage={searchTerm ? currentPage : paginationData.currentPage}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                  onPageChange={handlePageChange}
                  totalPages={totalPages}
                  hasNextPage={searchTerm ? currentPage < totalPages : paginationData.hasNextPage}
                  hasPrevPage={searchTerm ? currentPage > 1 : paginationData.hasPrevPage}
                />
              </div>
            );
          })()}
        </div>
      </div>

      {isDetailsModalOpen && selectedDetailsZone && (
        <ZoneDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedDetailsZone(null);
          }}
          zone={selectedDetailsZone}
        />
      )}

      <ZoneEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedEditZone(null);
        }}
        onSave={handleSaveZone}
        zone={mapToZoneFormat(selectedEditZone)}
        setIsEditModalOpen={setIsEditModalOpen}
        isEdit={!!selectedEditZone}
        venueId={venueId || undefined}
        facilityId={facilityId ? Number(facilityId) : undefined}
        initialData={{
          ids: selectedEditZone?.venue_ids
            ? Array.isArray(selectedEditZone.venue_ids)
              ? selectedEditZone.venue_ids.map((id) => Number(id))
              : [Number(selectedEditZone.venue_ids)]
            : venueId
            ? [Number(venueId)]
            : [],
        }}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedDetailsZone(null);
        }}
        onConfirm={handleDeleteConfirm}
        title={`Delete Zone: ${selectedDetailsZone?.zone_name}`}
        message={`Are you sure you want to delete the zone "${selectedDetailsZone?.zone_name}"? This action cannot be undone.`}
        isDeleting={isDeleting}
      />
    </div>
  );
}