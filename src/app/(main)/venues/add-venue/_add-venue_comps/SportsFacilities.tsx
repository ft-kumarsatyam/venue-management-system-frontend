import { Button } from "../../../../../components/ui/button";
import React, { useState } from "react";

export default function SportsFacilities() {
  const [amenities, setAmenities] = useState([
    "Parking",
    "Sitting Area",
    "WIFI",
    "Washroom",
  ]);
  const [zones, setZones] = useState(["FOP", "Spectator Area", "Dining Area"]);
  const [newAmenity, setNewAmenity] = useState("");

  const addAmenity = () => {
    if (newAmenity.trim() !== "") {
      setAmenities([...amenities, newAmenity]);
      setNewAmenity("");
    }
  };

  const removeAmenity = (index: number) => {
    setAmenities(amenities.filter((_, i) => i !== index));
  };

  const removeZone = (index: number) => {
    setZones(zones.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full p-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 px-4">
        {/* Left-aligned Title */}
        <h2 className="text-xl font-semibold text-[var(--black)]">
          Sports Facilities
        </h2>

        {/* Edit & Delete Buttons */}
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="lg"
            className="bg-[linear-gradient(to_right,#7942d1,#2a1647)] text-[var(--white)]"
          >
            Edit
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="bg-[linear-gradient(to_right,#B92210,#B92210)] text-[var(--white)]"
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left - Zones & Amenities */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-bold text-[var(--black)] mb-4">
              Cricket Field
            </h3>

            {/* Zones */}
            <div className="mb-4">
              <span className="inline-block bg-gradient-to-r from-[var(--purple-dark-1)] to-[var(--purple-dark-2)] py-1 px-4 rounded-full text-white font-medium text-sm">
                Zone
              </span>
              <div className="flex flex-wrap gap-2 mt-2">
                {zones.map((zone, index) => (
                  <span
                    key={index}
                    className="bg-yellow-500 text-black px-3 py-1 rounded-full flex items-center text-sm"
                  >
                    {zone}
                    <button onClick={() => removeZone(index)} className="ml-2">
                      ✖
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div>
              <span className="inline-block bg-gradient-to-r from-[var(--purple-dark-1)] to-[var(--purple-dark-2)] py-1 px-4 rounded-full text-white font-medium text-sm">
                Amenities
              </span>
              <div className="flex flex-wrap gap-2 mt-2">
                {amenities.map((amenity, index) => (
                  <span
                    key={index}
                    className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-3 py-1 rounded-full flex items-center text-sm"
                  >
                    {amenity}
                    <button onClick={() => removeAmenity(index)} className="ml-2">
                      ✖
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right - Add Venue Amenities */}
          <div className="w-full md:pl-4">
            <div className="mb-2 text-sm text-[var(--black)] font-bold">
              Add Venue Amenities
            </div>
            <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-2">
              <input
                type="text"
                placeholder="Enter Venue Amenities"
                value={newAmenity}
                onChange={(e) => setNewAmenity(e.target.value)}
                className="border p-2 rounded-md w-full md:w-auto"
              />
              <button
                onClick={addAmenity}
                className="bg-gradient-to-r from-[var(--purple-dark-1)] to-[var(--purple-dark-2)] py-2 px-4 rounded-md text-white font-medium"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Save Facilities Button */}
      <div className="flex justify-center mt-6">
        <button className="bg-gradient-to-r from-[var(--purple-dark-1)] to-[var(--purple-dark-2)] py-2 px-8 rounded-md text-white font-medium">
          Save Facilities
        </button>
      </div>
    </div>
  );
}
