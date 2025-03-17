"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import Image from "next/image";
import { MdOutlineLocationOn } from "react-icons/md";
import { X } from "lucide-react";
import type { FacilityData } from "./facility-form-modal";

interface FacilityDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  facility: FacilityData;
}

const fallbackImage =
  "https://i.pinimg.com/564x/59/3f/8f/593f8ffd52969e4bafb0b0ee3fc709e7.jpg";

export default function FacilityDetailsModal({
  isOpen,
  onClose,
  facility,
}: FacilityDetailsModalProps) {
  // Safety check - ensure facility is defined before rendering
  if (!facility) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[50%] max-h-[90vh] overflow-y-auto bg-white px-6">
        <DialogHeader className="p-4">
          <DialogTitle className="text-xl font-semibold text-[var(--black)] text-center">
            {facility.facilityName ||
              facility.facilityName ||
              "Facility Details"}
          </DialogTitle>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none"
          >
            <span className="sr-only">Close</span>
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>

        <div className="relative w-full h-60 bg-[#d9d9d9] rounded-[30px]">
          <div className="relative w-full h-60 bg-[#d9d9d9] rounded-[30px]">
            <div className="relative w-full h-full">
              <Image
                src={facility?.facility_image_url || fallbackImage}
                alt={facility?.facilityName || "Facility image"}
                fill
                className="rounded-[30px] object-cover"
              />
            </div>
          </div>
        </div>

        <div className="py-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <span className="text-base text-gray-500 font-[helvetica]">
                Facility ID:{" "}
              </span>
              <span className="font-semibold text-base text-[var(--black)]">
                {facility.id || "N/A"}
              </span>
            </div>

            <div>
              <span className="text-base text-gray-500 font-[helvetica]">
                Facility Code:{" "}
              </span>
              <span className="font-semibold text-base text-[var(--black)]">
                {facility.facilityCode || facility.facilityCode || "N/A"}
              </span>
            </div>

            <div>
              <span className="text-base text-gray-500 font-[helvetica]">
                Capacity:{" "}
              </span>
              <span className="font-semibold text-base text-[var(--black)]">
                {facility.facility_capacity || facility.capacity || "N/A"}
              </span>
            </div>

            <div>
              <span className="text-base text-gray-500 font-[helvetica]">
                Geofencing Type:{" "}
              </span>
              <span className="font-semibold text-base text-[var(--black)]">
                {facility.geofencing_type === "1" ? "Polygon" : "Radius"}
              </span>
            </div>

            {facility.facility_radius || facility.radius ? (
              <div>
                <span className="text-base text-gray-500 font-[helvetica]">
                  Radius:{" "}
                </span>
                <span className="font-semibold text-base text-[var(--black)]">
                  {facility.facility_radius || facility.radius} meters
                </span>
              </div>
            ) : null}

            <div>
              <span className="text-base text-gray-500 font-[helvetica]">
                Coordinates:{" "}
              </span>
              {facility.coordinates ||
              (facility.latitude && facility.longitude) ? (
                <a
                  href={`https://maps.google.com/?q=${
                    facility.coordinates
                      ? `${facility.coordinates.latitude},${facility.coordinates.longitude}`
                      : `${facility.latitude},${facility.longitude}`
                  }`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:underline text-base underline"
                >
                  {facility.coordinates
                    ? `${facility.coordinates.latitude}, ${facility.coordinates.longitude}`
                    : `${facility.latitude}, ${facility.longitude}`}
                </a>
              ) : (
                <span className="text-base text-[var(--black)]">N/A</span>
              )}
            </div>
          </div>

          <div className="rounded-[30px] border border-[#e4e4e7] p-4">
            <h3 className="font-semibold mb-3 text-[var(--black)]">
              Supervisor Details
            </h3>
            <div className="space-y-2">
              <div>
                <span className="font-[poppins] font-normal leading-[100%] tracking-[0.05em] text-[#a0aec0] text-sm">
                  Name:{" "}
                </span>
                <span className="font-[poppins] font-normal leading-[100%] tracking-[0.05em] text-gray-800 text-sm">
                  {facility.supervisorName || facility.supervisorName || "N/A"}
                </span>
              </div>
              <div>
                <span className="font-[poppins] font-normal leading-[100%] tracking-[0.05em] text-[#a0aec0] text-sm">
                  Email ID:{" "}
                </span>
                <span className="font-[poppins] font-normal leading-[100%] tracking-[0.05em] text-gray-800 text-sm break-words overflow-wrap w-full">
                  {facility.supervisorEmail ||
                    facility.supervisorEmail ||
                    "N/A"}
                </span>
              </div>
              <div>
                <span className="font-[poppins] font-normal leading-[100%] tracking-[0.05em] text-[#a0aec0] text-sm">
                  Contact No:{" "}
                </span>
                <span className="font-[poppins] font-normal leading-[100%] tracking-[0.05em] text-gray-800 text-sm">
                  {facility.supervisorContact ||
                    facility.supervisorContact ||
                    "N/A"}
                </span>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="rounded-[30px] border border-[#e4e4e7] p-6">
              <h3 className="mb-2 text-[var(--black)] font-[helvetica] font-bold text-[18px] leading-[100%]">
                Facility Amenities
              </h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {(facility.facility_amenities || facility.amenities || []).map(
                  (amenity, index) => (
                    <div
                      key={index}
                      className="bg-yellow-400 text-black px-3 py-1 rounded-full text-sm"
                    >
                      {amenity}
                    </div>
                  )
                )}
                {(facility.facility_amenities || facility.amenities || [])
                  .length === 0 && (
                  <span className="text-gray-500">No amenities listed</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
