"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Eye } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

// Universal Zone interface that's compatible with both component needs
export interface ZoneDetails {
  id: number | string;
  zone_name?: string;
  zone_code?: string;
  zone_capacity?: number;
  supervisor_name?: string;
  supervisor_email?: string;
  supervisor_contact?: string;
  capacity?: number;
  zone_supervisor?: string;
  email?: string;
  contact?: string;
  facility?: string;
  facility_id?: number;
  image?: string;
  venue_id?: number;
  coordinates?: {
    latitude?: string | number;
    longitude?: string | number;
  };
  zone_radius?: string;
  geofencing_type?: number;
  image_url?: string;
  common_zone_status?: string;
}

interface ZoneDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  zone: ZoneDetails;
}

export default function ZoneDetailsModal({
  isOpen,
  onClose,
  zone,
}: ZoneDetailsModalProps) {
  const [imageError, setImageError] = useState(false);

  // Reset image error state when zone changes
  useEffect(() => {
    setImageError(false);
  }, [zone]);

  // Log when modal props change for debugging
  useEffect(() => {
    console.log("ZoneDetailsModal - isOpen:", isOpen);
    console.log("ZoneDetailsModal - zone:", zone);
  }, [isOpen, zone]);

  // Make sure we have a proper onClose function
  const handleClose = () => {
    console.log("Modal closing");
    if (onClose) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95%] sm:max-w-4xl p-6 rounded-lg bg-white overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-black capitalize text-center">
            {zone?.zone_name || "Zone Details"}
          </DialogTitle>
        </DialogHeader>
        <div className="px-6 mb-6 flex justify-center">
          <div className="w-full ">
            {/* Image Container */}
            <div className="rounded-xl overflow-hidden w-full h-[372px] pb-4">
              <div className="relative w-full h-full">
                {zone?.image_url && !imageError ? (
                  <Image
                    src={zone.image_url}
                    alt={zone.zone_name || "Zone image"}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1115px) 100vw, 1115px"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <Image
                    src={
                      imageError || !zone?.image_url
                        ? "https://media.coliseum-online.com/2024/10/Coliseum-GSVA-News-New-stadium-for-Chennai-India-2.jpg"
                        : zone.image_url
                    }
                    alt="Default Zone image"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1115px) 100vw, 1115px"
                    onError={() => setImageError(true)}
                  />
                )}
              </div>
            </div>

            {/* Content Container */}
            <div className="bg-white p-4">
              <div className="flex justify-between gap-4 flex-wrap">
                {/* Left Column: Capacity & Coordinates */}
                <div className="flex-1 min-w-[250px]">
                  <div>
                    <p className="text-gray-600">
                      <span className="font-semibold">Zone Code:</span>{" "}
                      <span className="font-medium">
                        {zone?.zone_code || "N/A"}
                      </span>
                    </p>
                    <p className="text-gray-600">
                      <span className="font-semibold">Capacity:</span>{" "}
                      <span className="font-medium">
                        {zone?.zone_capacity || zone?.capacity || "N/A"}
                      </span>
                    </p>
                    <p className="text-gray-600">
                      <span className="font-semibold">Coordinates:</span>{" "}
                      <span className="font-medium text-black">
                        {zone?.coordinates?.latitude || "N/A"},{" "}
                        {zone?.coordinates?.longitude || "N/A"}
                      </span>
                    </p>
                    {/* <p className="text-gray-600">
                      <span className="font-semibold">Geofencing Type:</span>{" "}
                      <span className="font-medium">{zone?.geofencing_type || "N/A"}</span>
                    </p> */}
                    {zone?.zone_radius && (
                      <p className="text-gray-600">
                        <span className="font-semibold">Zone Radius:</span>{" "}
                        <span className="font-medium">{zone.zone_radius}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Column: Supervisor Details */}
                <div className="flex-1 min-w-[250px] bg-white p-3 rounded-lg border border-gray-200">
                  <h3 className="font-semibold text-md text-black mb-2">
                    Zone Supervisor Details
                  </h3>
                  <p className="text-sm">
                    <span className="text-gray-400">Name:</span>{" "}
                    <span className="text-gray-600">
                      {zone?.supervisor_name || zone?.zone_supervisor || "N/A"}
                    </span>
                  </p>
                  <p className="text-sm">
                    <span className="text-gray-400">Email ID:</span>{" "}
                    <span className="text-gray-600">
                      {zone?.supervisor_email || zone?.email || "N/A"}
                    </span>
                  </p>
                  <p className="text-sm">
                    <span className="text-gray-400">Contact No:</span>{" "}
                    <span className="text-gray-600">
                      {zone?.supervisor_contact || zone?.contact || "N/A"}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {zone?.common_zone_status === "0" && (
              <div className="pl-4 pr-4 pt-4 mt-4 border border-gray-300 rounded-2xl">
                <div className="flex justify-between items-center">
                  <h2 className="font-medium text-black text-lg">Facility</h2>
                </div>
                <span className="text-gray-300 font-medium text-sm">
                  This zone is mapped with a facility
                </span>

                <div className="flex flex-wrap gap-2 py-3">
                  <span className="bg-gradient-to-r from-yellow-300 to-yellow-500 text-[#653400] px-6 py-2 rounded-full font-semibold text-sm">
                    {zone?.facility || "Facility"}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
