"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "../../../../components/pageheader/PageHeader";
import { Button } from "../../../../components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../../redux/store";
import { fetchSingleCluster } from "../../../../redux/reducer/cluster/action";
import VenueForm from "../../venues/add-venue/_add-venue_comps/AddVenueForm";
import { EditClusterModal } from "../edit/[id]/editcluster";

interface SportInfo {
  sport_name: string;
  facility_type: string;
}

interface Coordinates {
  latitude: number | null;
  longitude: number | null;
}

interface ClusterData {
  id: number;
  cluster_code: string;
  cluster_name: string;
  cluster_description: string;
  geofencing_type: string;
  coordinates: Coordinates | null;
  image_url: string | null;
  cluster_radius: number | null;
  supervisor_name: string;
  supervisor_contact: string;
  supervisor_email: string;
  supervisor_id: number | null;
  created_by: number;
  assigned_to: number | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  venues?: Venue[];
  location?: string;
}

interface Venue {
  id: number;
  venue_code: string;
  venue_name: string;
  venue_address: string | null;
  venue_rating: number | null;
  venue_gallery_url: string | null;
  geofencing_type: string | null;
  coordinates: Coordinates | null;
  venue_description: string;
  image_url: string | null;
  venue_capacity: string | null;
  venue_radius: number | null;
  supervisor_name: string;
  supervisor_contact: string;
  supervisor_email: string;
  supervisor_id: number | null;
  cluster_id: number;
  created_by: number;
  assigned_to: number | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  sports?: SportInfo[];
}

export default function ClusterDetailPage() {
  const dispatch = useDispatch<AppDispatch>();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditClusterOpen, setIsEditClusterOpen] = useState(false);

  const pathname = usePathname();
  const clusterId = pathname?.split("/").pop() || "";

  const {
    currentCluster,
    singleClusterLoading: loading,
    error,
  } = useSelector((state: RootState) => state.cluster);

  useEffect(() => {
    if (clusterId) {
      const numericId = Number.parseInt(clusterId, 10);
      if (!isNaN(numericId)) {
        dispatch(fetchSingleCluster(numericId));
      }
    }
  }, [clusterId, dispatch]);

  const handleVenueSaved = () => {
    if (clusterId) {
      const numericId = Number.parseInt(clusterId, 10);
      if (!isNaN(numericId)) {
        dispatch(fetchSingleCluster(numericId));
      }
      window.location.reload();
    }
    setIsAddModalOpen(false);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">Loading cluster details...</div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        Error: {error?.message || "Failed to fetch cluster data"}
      </div>
    );
  }

  const clusterData: ClusterData = currentCluster?.data || {
    id: 0,
    cluster_code: "",
    cluster_name: "",
    cluster_description: "",
    geofencing_type: "",
    coordinates: null,
    image_url: null,
    cluster_radius: null,
    supervisor_name: "",
    supervisor_contact: "",
    supervisor_email: "",
    supervisor_id: null,
    created_by: 0,
    assigned_to: null,
    is_deleted: false,
    created_at: "",
    updated_at: "",
    venues: [],
    location: "Dehradun, Uttrakhand",
  };

  if (!clusterData) {
    return <div className="container mx-auto p-4">Cluster not found</div>;
  }

  // Filter out venues that don't have proper data or are deleted
  const validVenues =
    clusterData.venues?.filter(
      (venue) =>
        venue &&
        venue.id &&
        venue.venue_name &&
        venue.venue_name.trim() !== "" &&
        !venue.is_deleted
    ) || [];

  return (
    <div className="space-y-6 bg-[var(--white)] rounded-lg px-5 py-7 mb-5">
      <PageHeader
        title1="Home"
        title2="Cluster"
        description="View Cluster Details."
      />

      <div className="flex justify-end mb-4 px-6">
        <div className="flex gap-2">
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[linear-gradient(to_right,#7942d1,#2a1647)] hover:bg-purple-700 text-white"
          >
            Add Venue
          </Button>
          <Button
            variant="outline"
            className="text-[var(--purple-dark-2)]"
            onClick={() => setIsEditClusterOpen(true)}
          >
            Edit Cluster
          </Button>
        </div>
      </div>

      <div className="px-6 mb-6 flex justify-center">
        <div className="w-full ">
          <div className="rounded-t-lg overflow-hidden w-full h-[372px] pb-4">
            <div className="relative w-full h-full">
              <Image
                src={clusterData.image_url || "/assets/stadium.png"}
                alt={clusterData.cluster_name || "Cluster image"}
                fill
                className="object-cover"
                sizes="(max-width: 1115px) 100vw, 1115px"
              />
            </div>
          </div>

          <div className="bg-white ">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div>
                <p className="inline-block text-sm  font-semibold mb-4 px-3 py-1 bg-[linear-gradient(to_right,#7942d1,#2a1647)] text-[var(--white)] rounded-full w-fit">
                  Cluster
                </p>

                <h2 className="text-2xl font-bold text-black">
                  {clusterData.cluster_name ||
                    clusterData.location ||
                    "Dehradun, Uttarakhand"}
                </h2>
                <p className="text-gray-600">
                  Venues:{" "}
                  <span className="font-medium text-black">
                    {validVenues.length}
                  </span>
                </p>
              </div>

              <div className="bg-white p-3 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-md text-black mb-2">
                  Cluster Supervisor Details
                </h3>
                <p className="text-sm">
                  <span className="text-gray-400">Name:</span>&nbsp;{" "}
                  <span className="text-gray-600 ">
                    {clusterData.supervisor_name || ""}
                  </span>
                </p>
                <p className="text-sm">
                  <span className="text-gray-400">Email ID:</span>&nbsp;{" "}
                  <span className="text-gray-600 ">
                    {clusterData.supervisor_email || ""}
                  </span>
                </p>
                <p className="text-sm">
                  <span className="text-gray-400">Contact No:</span>&nbsp;{" "}
                  <span className="text-gray-600">
                    {clusterData.supervisor_contact || "Not Available"}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 mb-8">
        <h3 className="text-xl font-bold mb-4 text-black">Clusters Venue</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {validVenues.length > 0 ? (
            validVenues.map((venue, index) => (
              <Link
                key={venue.id}
                href={`/venues/view-venue/${venue.id}`}
                className="block border border-gray-300 rounded-3xl overflow-hidden shadow-sm min-h-[300px] hover:shadow-md transition-shadow"
              >
                <div className="relative h-52 pb-4">
                  <Image
                    src={venue.image_url || "/assets/stadium.png"}
                    alt={venue.venue_name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-lg text-black pb-1">
                    {venue.venue_name}
                  </h4>
                  <p className="text-sm text-gray-600 mb-2 pb-3">
                    Capacity:{" "}
                    <span className="font-medium text-black">
                      {venue.venue_capacity || "N/A"}
                    </span>
                  </p>

                  {venue.sports && venue.sports.length > 0 && (
                    <>
                      <div className="inline-block text-xs font-medium px-3 py-1 bg-[linear-gradient(to_right,#7942d1,#2a1647)] text-[var(--white)] rounded-full mb-2">
                        Sport Facility
                      </div>

                      <div className="flex flex-wrap gap-1 mt-2">
                        {venue.sports.slice(0, 3).map((sport, sportIndex) => (
                          <Button
                            key={sportIndex}
                            variant="outline"
                            size="sm"
                            className="h-7 px-3 py-1 text-yellow-800 text-black border-yellow-200 rounded-full"
                            style={{ backgroundColor: "var(--yellow-dark-2)" }}
                          >
                            {sport.sport_name}
                          </Button>
                        ))}
                        {venue.sports.length > 3 && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-3 py-1 text-yellow-800 text-black border-yellow-200 rounded-full"
                            style={{ backgroundColor: "var(--yellow-dark-2)" }}
                          >
                            +{venue.sports.length - 3} more
                          </Button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-gray-500">
              <div className="flex flex-col items-center gap-4">
                <div className="text-6xl text-gray-300">🏟️</div>
                <h4 className="text-lg font-medium text-gray-600">
                  No venues found
                </h4>
                <p className="text-sm text-gray-500">
                  This cluster doesnt have any venues yet.
                </p>
                <Button
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-[linear-gradient(to_right,#7942d1,#2a1647)] hover:bg-purple-700 text-white"
                >
                  Add First Venue
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-black text-2xl font-bold"
              aria-label="Close"
            >
              &times;
            </button>


            <div className="p-4">
              <h2 className="text-xl font-bold text-center text-black">
                Add Venue to {clusterData.cluster_name || "Cluster"}
              </h2>
            </div>

            <VenueForm
              setIsModalOpen={setIsAddModalOpen}
              mode="create"
              onVenueSaved={handleVenueSaved}
              presetClusterId={clusterData.id}
              preselectedClusterId={clusterData.cluster_name}
            />
          </div>
        </div>
      )}

      {isEditClusterOpen && (
        <EditClusterModal
          editOpen={isEditClusterOpen}
          setEditOpen={setIsEditClusterOpen}
          clusterId={clusterId}
        />
      )}
    </div>
  );
}
