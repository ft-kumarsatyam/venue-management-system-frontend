"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Eye, Edit, Trash } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import StatsCard from "../../../components/Cards/StatsCards/StatsCard";
import { MdOutlineLocationOn } from "react-icons/md";
import Pagination from "../../../components/ui/pagination";
import { BreadcrumbNav } from "../../../components/ui/breadcrumb-nav";
import FacilityDetailsModal from "../../../components/modals/facility-details-modal";
import CreateButton from "../../../components/ui/createbutton";
import { GenericTable } from "../../../components/Table/TableComp";
import FacilityFormModal, {
  type FacilityData,
} from "../../../components/modals/facility-form-modal";
import DeleteConfirmationModal from "../../../components/modals/delete-confirmation-modal";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllFacilities,
  getSingleFacility,
  deleteFacility,
  // resetFacilityError,
  getZonesByFacility,
} from "../../../redux/reducer/facilities/action";
import { fetchFacilitiesByVenue } from "../../../redux/reducer/venue/action";
import Swal from "sweetalert2";

// Updated Types based on the API response
interface Facility {
  id: number;
  facility_name?: string;
  facility_code: string;
  facility_radius: number;
  facility_capacity: number;
  geofencing_type: string;
  coordinates: { latitude: string | number; longitude: string | number };
  facility_amenities?: string | string[];
  image_url: string | null;
  supervisor_name?: string;
  supervisor_contact: string;
  supervisor_email: string;
  supervisor_id?: number;
  venue_id: number;
  zone_id?: number;
  zone_ids?: number[] | null;
  facility_type?: string;
  sport_name?: string;
  zones?: Array<{
    id: number;
    venue_id: number;
    zone_code: string;
    zone_name: string;
    zone_capacity: number;
  }>;
  sports?: {
    id: number;
    sport_name: string;
  };
}

// Helper function to convert Facility to FacilityData
const convertFacilityToFacilityData = (facility: Facility): FacilityData => {
  const amenities = Array.isArray(facility.facility_amenities)
    ? facility.facility_amenities
    : typeof facility.facility_amenities === "string"
    ? [facility.facility_amenities]
    : [];

  return {
    id: facility.id,
    facilityName: facility.facility_name || facility.sport_name || "",
    facilityCode: facility.facility_code || "",
    radius: facility.facility_radius?.toString() || "",
    capacity: facility.facility_capacity?.toString() || "",
    geofencing_type: facility.geofencing_type || "",
    latitude: facility.coordinates?.latitude?.toString() || "",
    longitude: facility.coordinates?.longitude?.toString() || "",
    coordinates: {
      latitude: facility.coordinates?.latitude?.toString() || "",
      longitude: facility.coordinates?.longitude?.toString() || "",
    },
    amenities,
    facility_amenities: amenities,
    image: facility.image_url || undefined,
    facility_image_url: facility.image_url || undefined,
    image_url: facility.image_url || undefined,
    supervisorName: facility.supervisor_name || "",
    supervisorContact: facility.supervisor_contact || "",
    supervisorEmail: facility.supervisor_email || "",
    venueId: facility.venue_id,
    zoneId: facility.zone_ids?.toString() || facility.zone_id?.toString(),
    sport_id: facility.facility_type || "",
    facilityType: facility.facility_type || "",
    facility_capacity: facility.facility_capacity?.toString() || "",
    facility_radius: facility.facility_radius?.toString() || "",
    data: facility,
  };
};

export default function VenueFacilitiesPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const venueId = searchParams.get("venue");

  // Get facilities data from venue reducer
  const {
    facilitiesData,
    loading: venueLoading,
    facilitiesLoading,
    facilitiesError,
    facilitiesPagination, // Use facilitiesPagination from reducer
  } = useSelector((state: any) => state.venue);

  const {
    loading: facilityLoading,
    error,
    facility,
  } = useSelector((state: any) => state.facility);

  // Use venue loading state for facilities
  const loading = venueLoading || facilityLoading || facilitiesLoading;

  const [venueName, setVenueName] = useState("Loading...");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Venues", href: "/venues" },
    { label: `${venueName} Facilities`, active: true },
  ];

  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(
    null
  );
  const [selectedViewFacility, setSelectedViewFacility] =
    useState<FacilityData | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [facilities, setFacilities] = useState<Facility[]>([]);

  // Remove local pagination state - use reducer's facilitiesPagination instead
  const [filteredData, setFilteredData] = useState<Facility[]>([]);

  useEffect(() => {
    if (venueId) {
      handleFetchFacilities(currentPage, itemsPerPage);
      fetchVenueName(venueId);
    } else {
      router.push("/venues");
    }
  }, [venueId, currentPage]);

  const fetchVenueName = async (id: string) => {
    try {
      setVenueName(`Venue ${id}`);
    } catch (error) {
      console.error("Error fetching venue name:", error);
      setVenueName(`Venue ${id}`);
    }
  };

  useEffect(() => {
    if (error || facilitiesError) {
      const errorMessage = error || facilitiesError;
      Swal.fire({
        title: "Error",
        text: errorMessage,
        icon: "error",
        confirmButtonColor: "#7942d1",
      });
      dispatch(resetFacilityError());
    }
  }, [error, facilitiesError, dispatch]);

  // Listen for single facility data update (for view modal)
  useEffect(() => {
    if (facility?.data) {
      const facilityData = convertFacilityToFacilityData(facility.data);
      setSelectedViewFacility(facilityData);
      setIsViewModalOpen(true);
    }
  }, [facility]);

  // Updated: Listen for venue facilities data update
  useEffect(() => {
    if (facilitiesData) {
      // Handle the API response structure directly
      const facilitiesArray = facilitiesData.data || [];
      setFacilities(facilitiesArray);

      // Set venue name from the response
      if (facilitiesData.venue_name) {
        setVenueName(facilitiesData.venue_name);
      } else if (facilitiesArray.length > 0) {
        // Fallback to venue name from first facility if available
        const firstFacility = facilitiesArray[0];
        if (firstFacility.venue_name) {
          setVenueName(firstFacility.venue_name);
        }
      }
    }
  }, [facilitiesData]);

  // Apply search filter to facilities (client-side filtering for now)
  useEffect(() => {
    if (facilities && facilities.length > 0) {
      const filtered = facilities.filter(
        (facility: Facility) =>
          facility.facility_name
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          facility.sport_name
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          facility.supervisor_name
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
      setFilteredData(filtered);
    } else {
      setFilteredData([]);
    }
  }, [facilities, searchQuery]);

  // Updated to use venue-specific API call with proper parameters
  const handleFetchFacilities = (page: number = 1, limit: number = 10) => {
    if (venueId) {
      const params = {
        venueId: Number(venueId),
        page,
        limit,
        search: searchQuery,
      };

      dispatch(
        fetchFacilitiesByVenue(
          Number(venueId),
          page,
          limit,
          searchQuery,
          params
        ) as any
      );
    }
  };

  const handleViewClick = (id: number) => {
    // Try to find the facility in filteredData first for quicker response
    const foundFacility = filteredData.find((f) => f.id === id);
    if (foundFacility) {
      const facilityData = convertFacilityToFacilityData(foundFacility);
      setSelectedViewFacility(facilityData);
      setIsViewModalOpen(true);
    } else {
      // If not found in filteredData, fetch from API
      dispatch(getSingleFacility(id) as any);
    }
  };

  const handleEditClick = (facility: Facility) => {
    const facilityData = convertFacilityToFacilityData(facility);
    setSelectedFacility(facility);
    setTimeout(() => {
      setIsEditModalOpen(true);
    }, 100);
  };

  const handleDeleteClick = (facility: Facility) => {
    setSelectedFacility(facility);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedFacility) return;

    setIsDeleting(true);

    try {
      await dispatch(deleteFacility(selectedFacility.id) as any);

      Swal.fire({
        title: "Success",
        text: `Facility "${
          selectedFacility.facility_name || selectedFacility.sport_name
        }" deleted successfully.`,
        icon: "success",
        confirmButtonColor: "#7942d1",
      });

      handleFetchFacilities(currentPage, itemsPerPage);
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedFacility(null);
      setIsDeleting(false);
    }
  };

  const handleCreateFacility = () => {
    setIsCreateModalOpen(true);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchQuery = e.target.value;
    setSearchQuery(newSearchQuery);
    setCurrentPage(1); // Reset to first page when searching

    // Clear the previous timeout
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    // Set a new timeout
    debounceTimeout.current = setTimeout(() => {
      if (venueId) {
        const params = {
          venueId: Number(venueId),
          page: 1,
          limit: itemsPerPage,
          search: newSearchQuery,
        };

        dispatch(
          fetchFacilitiesByVenue(
            Number(venueId),
            1,
            itemsPerPage,
            newSearchQuery,
            params
          ) as any
        );
      }
    }, 500);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleZoneClick = (facilityId: number) => {
    dispatch(getZonesByFacility(facilityId) as any)
      .then(() => {
        router.push(`/zones?facility=${facilityId}&venue=${venueId}`);
      })
      .catch((error: any) => {
        Swal.fire({
          title: "Error",
          text: `Failed to fetch zones for facility ID: ${facilityId}`,
          icon: "error",
          confirmButtonColor: "#7942d1",
        });
      });
  };

  // Use facilitiesPagination from reducer instead of local state
  const {
    totalItems = 0,
    totalPages = 0,
    hasNextPage = false,
    hasPrevPage = false,
    currentPage: paginationCurrentPage = 1,
    itemsPerPage: paginationItemsPerPage = 10,
  } = facilitiesPagination || {};

  // Use filtered data for display - but for server-side pagination, use facilities directly
  const currentItems = searchQuery ? filteredData : facilities;

  // Updated columns to match the API response structure
  const columns = [
    { key: "facility_code", label: "Facility ID" },
    {
      key: "facility_name",
      label: "Facility Type",
      render: (row: any) => row.facility_name || row.sport_name || "N/A",
    },
    { key: "supervisor_name", label: "Facility Supervisor" },
    { key: "facility_capacity", label: "Capacity" },
    {
      key: "zone",
      label: "Zone",
      render: (row: any) => (
        <Button
          variant="link"
          className="p-0 text-blue-600 hover:text-blue-800 flex items-center gap-1"
          onClick={() => handleZoneClick(row.id)}
        >
          <div>
            {row.zones && row.zones.length > 0
              ? `${row.zones.length} Zone(s)`
              : "Zones"}
          </div>
        </Button>
      ),
    },
  ];

  // Define Actions for Table
  const actionItems = [
    {
      icon: Edit,
      title: "Edit",
      onClick: (id: number | string) => {
        const facility = currentItems?.find((item) => item.id === Number(id));
        if (facility) handleEditClick(facility);
      },
    },
    {
      icon: Trash,
      title: "Delete",
      onClick: (id: number | string) => {
        const facility = currentItems?.find((item) => item.id === Number(id));
        if (facility) handleDeleteClick(facility);
      },
    },
    {
      icon: Eye,
      title: "View",
      onClick: (id: number | string) => {
        handleViewClick(Number(id));
      },
    },
  ];

  return (
    <>
      <div className="space-y-6 bg-[var(--white)] rounded-lg px-5 py-7 mb-5">
        <BreadcrumbNav items={breadcrumbItems} />

        <div className="mb-4">
          <h1 className="font-[Poppins] text-2xl font-semibold tracking-tight text-[#2A1647]">
            {venueName} Facilities
          </h1>
          <p className="py-2 font-[Poppins] text-[14px] leading-[100%] tracking-[5%] text-[#A0AEC0]">
            View and Manage all Facilities.
          </p>
        </div>

        <div className="grid gap-6 grid-cols-2 md:grid-cols-3">
          <StatsCard
            title="Total Facilities"
            value={totalItems.toString()}
            link={"/"}
            lastMonthValue="0"
            icon={<MdOutlineLocationOn className="text-[var(--purple-dark)]" />}
          />
          <CreateButton
            label="Add Facility"
            onClick={() => setIsCreateModalOpen(true)}
          />
        </div>

        <div className="mb-4">
          <Input
            placeholder="Search facilities by Name or Supervisor"
            value={searchQuery}
            onChange={handleSearchChange}
            className="max-w-sm"
          />
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <GenericTable
            columns={columns}
            data={currentItems}
            actions={actionItems}
            loading={loading}
            keyField="id"
          />
        </div>

        {totalItems > 0 && (
          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={paginationItemsPerPage}
            onPageChange={handlePageChange}
            totalPages={totalPages}
            hasNextPage={hasNextPage}
            hasPrevPage={hasPrevPage}
          />
        )}

        {/* Modals */}
        {isViewModalOpen && selectedViewFacility && (
          <FacilityDetailsModal
            facility={selectedViewFacility}
            onClose={() => {
              setIsViewModalOpen(false);
              setSelectedViewFacility(null);
            }}
            isOpen={isViewModalOpen}
          />
        )}

        {isCreateModalOpen && (
          <FacilityFormModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSuccess={() => {
              setIsCreateModalOpen(false);
              handleFetchFacilities(currentPage, itemsPerPage);
            }}
            venueId={Number(venueId)}
            isEditing={false}
          />
        )}

        {isEditModalOpen && selectedFacility && (
          <FacilityFormModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedFacility(null);
            }}
            onSuccess={() => {
              setIsEditModalOpen(false);
              setSelectedFacility(null);
              handleFetchFacilities(currentPage, itemsPerPage);
            }}
            initialData={convertFacilityToFacilityData(selectedFacility)}
            facilityData={convertFacilityToFacilityData(selectedFacility)}
            venueId={Number(venueId)}
            isEditing={true}
          />
        )}

        {isDeleteModalOpen && selectedFacility && (
          <DeleteConfirmationModal
            isOpen={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(false);
              setSelectedFacility(null);
            }}
            onConfirm={handleDeleteConfirm}
            title="Delete Facility"
            message={`Are you sure you want to delete facility "${
              selectedFacility.facility_name || selectedFacility.sport_name
            }"? This action cannot be undone.`}
            isLoading={isDeleting}
          />
        )}
      </div>
    </>
  );
}

function resetFacilityError(): any {
  throw new Error("Function not implemented.");
}
