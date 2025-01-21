"use client";
import { Suspense, useEffect, useState } from "react";
import type React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, useSearchParams } from "next/navigation";
import StatsCard from "../../../components/Cards/StatsCards/StatsCard";
import { Button } from "../../../components/ui/button";
import { MdOutlineLocationOn } from "react-icons/md";
import { Input } from "../../../components/ui/input";
import TableComp from "../../../components/Table/TableComp";
import EditVenueModal from "./edit-venue/edit_venue";
import DeleteConfirmationModal from "../../../components/modals/delete-confirmation-modal";
import { Eye, Edit, Trash } from "lucide-react";
import CreateButton from "../../../components/ui/createbutton";
import { BreadcrumbNav } from "../../../components/ui/breadcrumb-nav";
import {
  fetchVenues,
  fetchFacilitiesByVenue,
} from "../../../redux/reducer/venue/action";
import { fetchClusters } from "../../../redux/reducer/cluster/action";
import type { AppDispatch, RootState } from "../../../redux/store";
import Pagination from "../../../components/ui/pagination";
import type { Venue } from "../../../redux/reducer/venue/reducer";
import axiosInstance from "../../../api/axiosInstance";
import { DELETE_VENUE } from "../../../api/api_endpoints";
import {
  DELETE_VENUE_REQUEST,
  DELETE_VENUE_SUCCESS,
  DELETE_VENUE_FAILURE,
} from "../../../redux/reducer/venue/actionTypes";
import AddVenuePage from "./add-venue/Mainpage";

// Define pagination interface
interface PaginationState {
  totalItems?: number;
  totalPages?: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
  currentPage?: number;
  limit?: number;
}

// Default pagination object
const defaultPagination: PaginationState = {
  totalItems: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPrevPage: false,
  currentPage: 1,
  limit: 10,
};

function VenueContent({
  openAddVenueModal,
}: {
  openAddVenueModal: () => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();

  const {
    loading,
    venues = [],
    pagination = defaultPagination,
  } = useSelector((store: RootState) => store?.venue);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const clusterId = searchParams.get("cluster");

  const getClusterName = () => {
    if (venues && venues.length > 0 && venues[0].parent_cluster) {
      return venues[0].parent_cluster.cluster_name;
    }
    return clusterId ? `Cluster ${clusterId}` : "";
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    dispatch(
      fetchVenues({
        clusterId: clusterId ?? undefined,
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearchTerm,
      })
    );
  }, [dispatch, clusterId, currentPage, debouncedSearchTerm]);

  const handleEditClick = (id: string) => {
    setSelectedVenueId(id);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    const venue = venues.find((venue: Venue) => venue.id === Number(id));
    if (venue) {
      setSelectedVenue(venue);
      setSelectedVenueId(id);
      setIsDeleteModalOpen(true);
    }
  };

  const handleViewFacilities = (venueId: number) => {
    dispatch(fetchFacilitiesByVenue(venueId));
    const url = clusterId
      ? `/facilities?venue=${venueId}&cluster=${clusterId}`
      : `/facilities?venue=${venueId}`;
    router.push(url);
  };

  const handleViewZones = (venueId: number) => {
    const url = clusterId
      ? `/zones?venue=${venueId}&cluster=${clusterId}`
      : `/zones?venue=${venueId}`;
    router.push(url);
  };

  const deleteVenueHandler = async (id: number) => {
    try {
      setIsDeleting(true);
      dispatch({ type: DELETE_VENUE_REQUEST });
      await axiosInstance.delete(DELETE_VENUE(id));
      dispatch({ type: DELETE_VENUE_SUCCESS, payload: id });

      // Refetch data after deletion to maintain pagination integrity
      dispatch(
        fetchVenues({
          clusterId: clusterId ?? undefined,
          page: currentPage,
          limit: itemsPerPage,
          search: debouncedSearchTerm,
        })
      );

      return true;
    } catch (error) {
      dispatch({ type: DELETE_VENUE_FAILURE, payload: error });
      console.error("Error deleting venue:", error);
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedVenueId) return;
    const success = await deleteVenueHandler(Number(selectedVenueId));
    if (success) {
      setIsDeleteModalOpen(false);
      setSelectedVenue(null);
      setSelectedVenueId(null);
    }
  };

  const handlePageChange = (page: number) => {
    console.log("Changing to page:", page);
    setCurrentPage(page);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Extract pagination data from redux store with proper defaults
  const {
    totalItems = 0,
    totalPages = 0,
    hasNextPage = false,
    hasPrevPage = false,
  } = pagination;

  const ActionObj = [
    {
      icon: Eye,
      title: "View",
      onClick: (id?: string) => {
        if (id) {
          const url = clusterId
            ? `/venues/view-venue/${id}?cluster=${clusterId}`
            : `/venues/view-venue/${id}`;
          router.push(url);
          router.refresh(); 
        }
      },
    }, 
    {
      icon: Edit,
      title: "Edit",
      onClick: handleEditClick,
    },
    {
      icon: Trash,
      title: "Delete",
      onClick: handleDeleteClick,
    },
  ];

  const columns = [
    {
      key: "serialNo",
      label: "Serial No",
      render: (_row: any, index?: number) =>
        (currentPage - 1) * itemsPerPage + (index ?? 0) + 1,
    },
    {
      key: "venue_code",
      label: "Venue Code",
      render: (row: any) => row.venue_code || "N/A",
    },
    {
      key: "venue_name",
      label: "Venue Name",
      render: (row: any) => row.venue_name || "N/A",
    },
    {
      key: "supervisor_name",
      label: "Venue Supervisor",
      render: (row: any) => {
        return row.supervisor_name && row.supervisor_name.trim() !== ""
          ? row.supervisor_name
          : "Not Assigned";
      },
    },
    {
      key: "venue_capacity",
      label: "Capacity",
      render: (row: any) => {
        if (
          row.venue_capacity === null ||
          row.venue_capacity === undefined ||
          isNaN(Number(row.venue_capacity))
        ) {
          return "N/A";
        }
        return Number(row.venue_capacity).toLocaleString();
      },
    },
    {
      key: "facilities",
      label: "Facilities",
      render: (row: any) => (
        <button
          onClick={() => handleViewFacilities(row.id)}
          className="text-purple-600 underline decoration-solid hover:text-purple-800"
        >
          View
        </button>
      ),
    },
    {
      key: "zones",
      label: "Zones",
      render: (row: any) => (
        <button
          onClick={() => handleViewZones(row.id)}
          className="text-purple-600 underline decoration-solid hover:text-purple-800"
        >
          View
        </button>
      ),
    },
  ];

  const clusterName = getClusterName();

  return (
    <>
      <div className="flex flex-col gap-4">
        {/* Show cluster context if filtering by cluster */}
        {clusterId && clusterName && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-purple-800">
                  Viewing venues for: {clusterName}
                </h2>
                <p className="text-sm text-purple-600">
                  Showing venues that belong to this cluster
                </p>
              </div>
              <Button
                onClick={() => router.push("/venues")}
                variant="outline"
                className="border-purple-300 text-purple-700 hover:bg-purple-100"
              >
                View All Venues
              </Button>
            </div>
          </div>
        )}

        <div className="flex justify-between">
          <h1 className="font-bold tracking-tight text-[#2A1647] all-venues-text">
            {clusterId ? `${clusterName} Venues (${totalItems})` : "All Venues"}
          </h1>
        </div>

        <div className="flex flex-col justify-between md:flex-row md:items-center gap-2">
          <Input
            className="border-[var(--background)] p-2 placeholder-[var(--foreground)] w-full md:w-[300px] lg:w-[350px] border-gray-200"
            placeholder="Search Venue by Name"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">Loading venues...</div>
      ) : (
        <>
          {venues.length > 0 ? (
            <TableComp columns={columns} data={venues} actions={ActionObj} />
          ) : (
            <div className="flex justify-center py-8 text-gray-500">
              {searchTerm || debouncedSearchTerm
                ? "No venues found matching your search."
                : clusterId
                ? "No venues found for this cluster."
                : "No venues found."}
            </div>
          )}
        </>
      )}

      {totalItems > 0 && (
        <div className="mt-4">
          <Pagination
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            totalPages={totalPages}
            hasNextPage={hasNextPage}
            hasPrevPage={hasPrevPage}
          />
        </div>
      )}

      <EditVenueModal
        venueId={selectedVenueId}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={() => {
          // Refetch data after editing venue
          return dispatch(
            fetchVenues({
              clusterId: clusterId ?? undefined,
              page: currentPage,
              limit: itemsPerPage,
              search: debouncedSearchTerm,
            })
          );
        }}
      />

      {selectedVenue && (
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
          itemType="Venue"
          itemName={selectedVenue.venue_name}
          isDeleting={isDeleting}
        />
      )}
    </>
  );
}

const VenuePageContent = () => {
  const searchParams = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const clusterId = searchParams.get("cluster");
  const shouldCreateVenue = searchParams.get("create");

  // Define these variables in this component scope
  const itemsPerPage = 10;
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Updated to match cluster structure with proper typing
  const { venues = [], pagination = defaultPagination } = useSelector(
    (store: RootState) => store?.venue
  );

  // Get cluster name from venue data
  const getClusterName = () => {
    if (venues && venues.length > 0 && venues[0].parent_cluster) {
      return venues[0].parent_cluster.cluster_name;
    }
    return clusterId ? `Cluster ${clusterId}` : "";
  };

  useEffect(() => {
    if (shouldCreateVenue === "true" && clusterId) {
      setIsAddVenueModalOpen(true);
      // Clean up URL by removing the create parameter
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("create");
      window.history.replaceState({}, "", newUrl.toString());
    }
  }, [shouldCreateVenue, clusterId]);

  const clusterName = getClusterName();

  // Generate dynamic breadcrumb based on cluster context
  const breadcrumbItems = clusterId
    ? [
        { label: "Home", href: "/" },
        { label: "Clusters", href: "/clusters" },
        {
          label: clusterName || `Cluster ${clusterId}`,
          href: `/cluster/${clusterId}`,
        },
        { label: "Venues", active: true },
      ]
    : [
        { label: "Home", href: "/" },
        { label: "Venues", active: true },
      ];

  const [isAddVenueModalOpen, setIsAddVenueModalOpen] = useState(false);

  // Use pagination totalItems with proper fallback
  const totalItemsCount = pagination.totalItems || 0;

  const openAddVenueModal = () => {
    setIsAddVenueModalOpen(true);
  };

  return (
    <>
      <div className="space-y-6 bg-[var(--white)] rounded-lg px-5 py-7 mb-5">
        <BreadcrumbNav items={breadcrumbItems} />
        <div className="mb-4">
          <h1 className="font-[Poppins] text-2xl font-semibold tracking-tight text-[#2A1647]">
            {clusterId ? `${clusterName} Venues` : "Venues"}
          </h1>
          <p className="py-2 font-[Poppins] text-[14px] leading-[100%] tracking-[5%] text-[#A0AEC0]">
            {clusterId
              ? `View and Manage venues for ${
                  clusterName || `Cluster ${clusterId}`
                }.`
              : "View and Manage all Venues."}
          </p>
        </div>
        <div className="grid gap-6 grid-cols-2 md:grid-cols-3">
          <StatsCard
            title={clusterId ? `${clusterName} Venues` : "Total Venues"}
            value={totalItemsCount}
            link={"/"}
            lastMonthValue="+4"
            icon={<MdOutlineLocationOn className="text-[var(--purple-dark)]" />}
          />
          <CreateButton
            label={clusterId ? "Create Venue in Cluster" : "Create Venues"}
            onClick={openAddVenueModal}
          />
        </div>
        <Suspense fallback={<div>Loading venue data...</div>}>
          <VenueContent openAddVenueModal={openAddVenueModal} />
        </Suspense>

        {/* Pass cluster context to the add venue modal */}
        <AddVenuePage
          open={isAddVenueModalOpen}
          setOpen={setIsAddVenueModalOpen}
          defaultClusterId={clusterId ? Number(clusterId) : undefined}
          presetClusterId={clusterId ? Number(clusterId) : undefined}
          onSuccess={() => {
            dispatch(
              fetchVenues({
                clusterId: clusterId ?? undefined,
                page: currentPage,
                limit: itemsPerPage,
                search: debouncedSearchTerm,
              })
            );
          }}
        />
      </div>
    </>
  );
};

export default function Venue() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VenuePageContent />
    </Suspense>
  );
}
