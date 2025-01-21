import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../../../redux/store";
import { fetchZones, deleteZone } from "../../../../../redux/reducer/zones/action";
import { Button } from "../../../../../components/ui/button";
import ZoneEditModal from "../../../../../components/modals/zone-edit-modal";

interface ZonesListingProps {
  venueId?: string | number | undefined;
}

const ZonesListing = ({ venueId }: ZonesListingProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { zones, loading } = useSelector((state: RootState) => state?.zone);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState<any>(null);

  useEffect(() => {
    if (venueId) {
      // If venueId is provided, fetch zones for that venue
      dispatch(fetchZones(venueId));
    } else {
      // Otherwise fetch all zones
      dispatch(fetchZones());
    }
  }, [dispatch, venueId]);

  const handleEditZone = (zone: any) => {
    setSelectedZone(zone);
    setIsEditModalOpen(true);
  };

  const handleDeleteZone = async (zoneId: number) => {
    if (window.confirm("Are you sure you want to delete this zone?")) {
      try {
        await dispatch(deleteZone(zoneId));
        // Refresh zones list
        if (venueId) {
          dispatch(fetchZones(venueId));
        } else {
          dispatch(fetchZones());
        }
      } catch (error) {
        console.error("Error deleting zone:", error);
      }
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading zones...</div>;
  }

  return (
    <div className="mt-4">
      {zones && zones.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Zone Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Capacity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supervisor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {zones.map((zone: any) => (
                <tr key={zone.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {zone.zone_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {zone.zone_code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {zone.zone_capacity || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {zone.supervisor_name || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap flex space-x-2">
                    <Button
                      onClick={() => handleEditZone(zone)}
                      variant="outline"
                      size="sm"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDeleteZone(zone.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500">
          No zones found. Add a zone to get started.
        </div>
      )}

      {/* Edit Zone Modal */}
      {selectedZone && (
        <ZoneEditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={async (formData) => {
            setIsEditModalOpen(false);
            if (venueId) {
              await dispatch(fetchZones(venueId));
            } else {
              await dispatch(fetchZones());
            }
          }}
          isEdit={true}
          zone={selectedZone}
          setIsEditModalOpen={setIsEditModalOpen}
          venueId={venueId}
        />
      )}
    </div>
  );
};

export default ZonesListing;

// "use client";

// import React, { useState, useEffect } from "react";
// import { Eye, Edit, Trash } from "lucide-react";
// import GenericTable from "@/components/Table/TableComp";
// import { Input } from "@/components/ui/input";
// import { Switch } from "@/components/ui/switch";
// import { Label } from "@/components/ui/label";
// import DeleteConfirmationModal from "@/components/modals/delete-confirmation-modal";
// import ZoneDetailsModal from "@/components/modals/zone-details-modal";
// import ZoneEditModal from "@/components/modals/zone-edit-modal";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   fetchZones,
//   createZone,
//   updateZone,
//   deleteZone,
// } from "@/redux/reducer/zones/action";
// import { AppDispatch } from "@/redux/store";

// // Type definitions
// interface Zone {
//   id: string;
//   zone_code: string;
//   zone_name: string;
//   zone_supervisor: string;
//   capacity: number;
//   coordinates?: string;
//   email?: string;
//   contact?: string;
//   facility?: string;
//   image?: string;
//   supervisor_name?: string;
//   supervisor_email?: string;
//   supervisor_contact?: string;
//   zone_capacity?: number;
//   zone_image_url?: string;
//   geofencing_type?: number;
//   zone_radius?: string;
// }

// const columns = [
//   { key: "zone_code", label: "Zone ID" },
//   { key: "zone_name", label: "Zone Name" },
//   { key: "zone_supervisor", label: "Zone Supervisor" },
//   { key: "coordinates", label: "Coordinates" },
//   { key: "capacity", label: "Capacity" },
// ];

// // Fallback mock data in case the API fails
// const mockData = new Array(10).fill(null).map((_, index) => ({
//   id: `${index + 1}`,
//   zone_code: `V${String(index + 1).padStart(3, "0")}`,
//   zone_name: "JLN Stadium",
//   zone_supervisor: "Kunal Phalaswal",
//   coordinates: "28.699015, 77.213668",
//   capacity: 1026,
//   email: "kunalphalaswal@gmail.com",
//   contact: "9876543210",
//   facility: "Basketball",
//   image: "/images/stadium.png",
// }));

// export default function ZonesListing() {
//   const dispatch = useDispatch<AppDispatch>();
//   const {
//     zones = [],
//     loading,
//     error,
//   } = useSelector((state: any) => state.zone);

//   const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
//   const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
//   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
//   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
//   const [isDeleting, setIsDeleting] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [showAllocatedOnly, setShowAllocatedOnly] = useState(false);

//   // Fetch zones from API on component mount
//   useEffect(() => {
//     dispatch(fetchZones());
//   }, [dispatch]);

//   // Map API data to component's expected format if necessary
//   const mappedZones =
//     zones.length > 0
//       ? zones.map((zone: any) => ({
//           id: zone.id.toString(),
//           zone_code:
//             zone.zone_code || `V${zone.id.toString().padStart(3, "0")}`,
//           zone_name: zone.zone_name,
//           zone_supervisor: zone.supervisor_name,
//           capacity: zone.zone_capacity,
//           coordinates: zone.coordinates
//             ? `${zone.coordinates.latitude}, ${zone.coordinates.longitude}`
//             : "",
//           email: zone.supervisor_email,
//           contact: zone.supervisor_contact,
//           facility: zone.facility || "Not specified",
//           image: zone.zone_image_url,
//           // Keep original API fields for form use
//           supervisor_name: zone.supervisor_name,
//           supervisor_email: zone.supervisor_email,
//           supervisor_contact: zone.supervisor_contact,
//           zone_capacity: zone.zone_capacity,
//           zone_image_url: zone.zone_image_url,
//           geofencing_type: zone.geofencing_type,
//           zone_radius: zone.zone_radius,
//         }))
//       : mockData; // Use mock data if API fails

//   // Filter zones based on search terms
//   const filteredZones = mappedZones.filter((zone: Zone) => {
//     const matchesSearch =
//       zone.zone_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       zone.zone_supervisor.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       zone.zone_code.toLowerCase().includes(searchTerm.toLowerCase());

//     // Apply allocated filter if needed
//     if (showAllocatedOnly) {
//       // Add your allocation filter logic here
//       return matchesSearch; // && zone.isAllocated
//     }

//     return matchesSearch;
//   });

//   const handleViewClick = (zone: Zone) => {
//     setSelectedZone(zone);
//     setIsDetailsModalOpen(true);
//   };

//   const handleEditClick = (zone: Zone) => {
//     setSelectedZone(zone);
//     setIsEditModalOpen(true);
//   };

//   const handleDeleteClick = (zone: Zone) => {
//     setSelectedZone(zone);
//     setIsDeleteModalOpen(true);
//   };

//   const handleDeleteConfirm = async () => {
//     if (!selectedZone) return;

//     setIsDeleting(true);
//     try {
//       // Convert string ID to number if needed for API
//       const numericId =
//         typeof selectedZone.id === "string"
//           ? parseInt(selectedZone.id, 10)
//           : selectedZone.id;

//       await dispatch(deleteZone(numericId));
//       setIsDeleteModalOpen(false);
//     } catch (error) {
//       console.error("Failed to delete zone:", error);
//     } finally {
//       setIsDeleting(false);
//     }
//   };

//   const handleSaveZone = async (formData: FormData) => {
//     try {
//       if (selectedZone) {
//         // Update existing zone
//         const numericId =
//           typeof selectedZone.id === "string"
//             ? parseInt(selectedZone.id, 10)
//             : selectedZone.id;

//         await dispatch(updateZone(numericId, formData));
//       } else {
//         // Add new zone
//         await dispatch(createZone(formData));
//       }
//       setIsEditModalOpen(false);
//       // Refresh zones after save
//       dispatch(fetchZones());
//     } catch (error) {
//       console.error("Error saving zone:", error);
//     }
//   };

//   // Define actions for the table
//   const ActionObj = [
//     {
//       icon: Edit,
//       title: "Edit",
//       onClick: (id: string) => {
//         return () => {
//           const zone = filteredZones.find(
//             (item: { id: string }) => item.id === id
//           );
//           if (zone) handleEditClick(zone);
//         };
//       },
//     },
//     {
//       icon: Trash,
//       title: "Delete",
//       onClick: (id: string) => {
//         return () => {
//           const zone = filteredZones.find(
//             (item: { id: string }) => item.id === id
//           );
//           if (zone) handleDeleteClick(zone);
//         };
//       },
//     },
//     {
//       icon: Eye,
//       title: "View",
//       onClick: (id: string) => {
//         return () => {
//           const zone = filteredZones.find(
//             (item: { id: string }) => item.id === id
//           );
//           if (zone) handleViewClick(zone);
//         };
//       },
//     },
//   ];

//   return (
//     <>
//       <div className="flex justify-between">
//         <h1 className="text-[var(--black)] font-bold">Saved Zones</h1>
//       </div>
//       <div className="flex justify-between gap-2">
//         <Input
//           className="w-75 border-[var(--background)] p-2 placeholder-[var(--foreground)]"
//           placeholder="Search"
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//         />
//         <div className="flex items-center gap-2">
//           <span className="text-red-500">⚠</span>
//           <Label htmlFor="allocated-switch" className="text-sm">
//             Allocated Common Zone
//           </Label>
//           <Switch
//             id="allocated-switch"
//             className="border"
//             checked={showAllocatedOnly}
//             onCheckedChange={setShowAllocatedOnly}
//           />
//         </div>
//       </div>

//       {loading ? (
//         <div className="py-10 text-center">Loading zones...</div>
//       ) : error ? (
//         <div className="py-10 text-center text-red-500">
//           Error loading zones: {error}
//         </div>
//       ) : (
//         <GenericTable
//           columns={columns}
//           data={filteredZones}
//           actions={ActionObj}
//         />
//       )}

//       {/* View Zone Details Modal */}
//       {selectedZone && (
//         <ZoneDetailsModal
//           isOpen={isDetailsModalOpen}
//           onClose={() => setIsDetailsModalOpen(false)}
//           zone={selectedZone}
//         />
//       )}

//       {/* Edit/Create Zone Modal */}
//       <ZoneEditModal
//         isOpen={isEditModalOpen}
//         onClose={() => setIsEditModalOpen(false)}
//         // zone={selectedZone}
//         onSave={handleSaveZone}
//         isEdit={!!selectedZone}
//         setIsEditModalOpen={setIsEditModalOpen}
//       />

//       {/* Delete Confirmation Modal */}
//       {selectedZone && (
//         <DeleteConfirmationModal
//           isOpen={isDeleteModalOpen}
//           onClose={() => setIsDeleteModalOpen(false)}
//           onConfirm={handleDeleteConfirm}
//           itemType="Zone"
//           itemName={selectedZone.zone_name}
//           isDeleting={isDeleting}
//         />
//       )}
//     </>
//   );
// }
