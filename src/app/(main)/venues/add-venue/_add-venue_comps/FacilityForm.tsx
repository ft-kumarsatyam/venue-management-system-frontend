import FormField from "../../../../../components/FormFields/FormField";
import React from "react";
import SportsFacilities from "./SportsFacilities";

// Define props for FacilityForm
interface FacilityFormProps {
  venueId: string | number;
  venueName?: string;
}

export default function FacilityForm({ venueId, venueName }: FacilityFormProps) {
  return (
    <>
      <div className="p-6 sm:p-8 text-[var(--black)]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Venue Name (readonly or prefilled from props) */}
          <div className="flex flex-col">
          <FormField label="Venue Name" placeholder="Maharana Pratap Stadium" />
          </div>

          {/* Facility Code */}
          <div className="flex flex-col">
            <FormField label="Facility Code" placeholder="Enter Facility Code" />
          </div>

          {/* Facility Name */}
          <div className="flex flex-col">
            <FormField label="Facility Name" placeholder="Enter Facility Name" />
          </div>

          {/* Coordinates - Latitude & Longitude */}
          <div className="flex flex-col w-full">
            <label className="text-sm font-medium text-[var(--black)] mb-1">Coordinates</label>
            <div className="flex flex-col sm:flex-row sm:space-x-4 gap-4">
              <FormField label=" " placeholder="Latitude" />
              <FormField label=" " placeholder="Longitude" />
            </div>
          </div>

          {/* Radius */}
          <div className="flex flex-col">
            <FormField label="Radius" placeholder="Enter Cluster Radius" />
          </div>

          {/* Facility Capacity */}
          <div className="flex flex-col">
            <FormField label="Facility Capacity" placeholder="Enter Capacity" />
          </div>

          {/* Upload Image */}
          <div className="flex flex-col">
            <FormField label="Upload Image" type="file" placeholder="" />
          </div>

          {/* Add Zone */}
          <div className="flex flex-col">
            <FormField label="Add Zone" placeholder="Select Zone" type="select" />
          </div>

          {/* Facility Supervisor Name */}
          <div className="flex flex-col">
            <FormField label="Facility Supervisor Name" placeholder="Enter Supervisor Name" />
          </div>

          {/* Facility Supervisor Email */}
          <div className="flex flex-col">
            <FormField label="Facility Supervisor Email" placeholder="Enter Supervisor Email" />
          </div>

          {/* Facility Supervisor Contact No */}
          <div className="flex flex-col">
            <FormField label="Facility Supervisor Contact No" placeholder="Enter Contact No" />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-center mt-6">
          <button className="bg-gradient-to-r from-[var(--purple-dark-1)] to-[var(--purple-dark-2)] py-2 px-8 rounded-md text-[var(--white)] font-bold">
            Save
          </button>
        </div>
      </div>

      <SportsFacilities />
    </>
  );
}
