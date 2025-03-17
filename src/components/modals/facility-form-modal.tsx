"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import {
  createFacility,
  updateFacility,
  getSportsDropdown,
} from "../../redux/reducer/facilities/action";
import Swal from "sweetalert2";
import { FacilityCreateUpdatePayload } from "../../app/services/facilityServices";

export interface FacilityData {
  data: any;
  image_url: string | undefined;
  facility_image_url: string | undefined;
  facility_capacity: string | undefined;
  geofencing_type: string;
  longitude: any;
  venueId?: number;
  latitude: any;
  facility_radius: string | undefined;
  facility_amenities: string[] | undefined;
  id?: number;
  venueName?: string;
  facilityCode?: string;
  facilityName?: string;
  facilityType?: string;
  sport_id?: string | number;
  coordinates?: {
    latitude?: string;
    longitude?: string;
  };
  radius?: string;
  capacity?: string;
  supervisorName?: string;
  supervisorId?: string;
  supervisorEmail?: string;
  supervisorContact?: string;
  zoneId?: string;
  zones?: (string | number)[];
  amenities?: string[];
  image?: string;
}

interface FacilityFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEditing?: boolean;
  facilityData?: FacilityData | null;
  onSuccess?: () => void;
  venueId?: number;
  initialData?: FacilityData;
}

export default function FacilityFormModal({
  isOpen,
  onClose,
  isEditing = false,
  facilityData,
  onSuccess,
  venueId,
}: FacilityFormModalProps) {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState(
    facilityData?.radius ? "radius" : "polygon"
  );
  const title = isEditing ? "Edit Facility" : "Add Facility";

  const sportsDropdown = useSelector(
    (state: RootState) => state.facility.sportsDropdown || []
  );
  const loading = useSelector((state: RootState) => state.facility.loading);

  useEffect(() => {
    if (isOpen) {
      console.log("Fetching sports dropdown for venueId:", venueId || 29);
      dispatch(getSportsDropdown(venueId || 29) as any);
    }
  }, [dispatch, venueId, isOpen]);

  const [availableZones, setAvailableZones] = useState([
    { id: 1, name: "FOP" },
    { id: 2, name: "Spectator Area" },
    { id: 3, name: "Dining Area" },
  ]);

  const [newAmenity, setNewAmenity] = useState("");
  const [amenities, setAmenities] = useState<string[]>(
    facilityData?.amenities || []
  );

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(
    facilityData?.image || null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false); // Track if SweetAlert is open
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sportSearchTerm, setSportSearchTerm] = useState("");
  const [filteredSports, setFilteredSports] = useState(sportsDropdown || []);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    facility_code: facilityData?.facilityCode || "",
    facility_name: facilityData?.facilityName || "",
    facility_type: facilityData?.facilityType || "",
    sport_id: facilityData?.sport_id || "",
    coordinates: {
      latitude: facilityData?.coordinates?.latitude,
      longitude: facilityData?.coordinates?.longitude,
    },
    geofencing_type: activeTab === "polygon" ? "1" : "2",
    facility_capacity: facilityData?.capacity || "",
    facility_image_url: facilityData?.image || (null as string | null),
    facility_radius: facilityData?.radius || "",
    supervisor_id: facilityData?.supervisorId || "1",
    supervisor_name: facilityData?.supervisorName || "",
    supervisor_contact: facilityData?.supervisorContact || "",
    supervisor_email: facilityData?.supervisorEmail || "",
    assigned_to: null as any,
    venue_ids: venueId ? [venueId] : ([] as number[]),
    zone_ids: Array.isArray(facilityData?.zones)
      ? facilityData.zones.map((z) =>
          typeof z === "string" ? Number.parseInt(z) : z
        )
      : ([] as number[]),
    facility_amenities: amenities,
  });

  // Find sport name based on sport_id
  const getSelectedSportName = (sportId: string | number | undefined) => {
    if (!sportId || !sportsDropdown || sportsDropdown.length === 0) return "";

    const sport = sportsDropdown.find(
      (s) => s.sport_id.toString() === sportId.toString()
    );
    return sport ? sport.sport_name : "";
  };

  const resetForm = () => {
    setFormData({
      facility_code: "",
      facility_name: "",
      facility_type: "",
      sport_id: "",
      coordinates: {
        latitude: "",
        longitude: "",
      },
      geofencing_type: activeTab === "polygon" ? "1" : "2",
      facility_capacity: "",
      facility_image_url: null,
      facility_radius: "",
      supervisor_id: "1",
      supervisor_name: "",
      supervisor_contact: "",
      supervisor_email: "",
      assigned_to: null,
      venue_ids: venueId ? [venueId] : [],
      zone_ids: [],
      facility_amenities: [],
    });
    setAmenities([]);
    setSelectedFile(null);
    setFilePreview(null);
    setErrors({});
  };

  useEffect(() => {
    console.log("sportsDropdown:", sportsDropdown);
    console.log("sportSearchTerm:", sportSearchTerm);

    if (sportsDropdown && sportsDropdown.length > 0) {
      const filtered = sportsDropdown.filter((sport) => {
        console.log("Filtering sport:", sport);
        const sportName = sport.sport_name;
        if (typeof sportName !== "string") return true;
        return sportName.toLowerCase().includes(sportSearchTerm.toLowerCase());
      });
      console.log("Filtered sports:", filtered);
      setFilteredSports(filtered);
    } else {
      console.log("No sports in dropdown or empty array");
      setFilteredSports([]);
    }
  }, [sportSearchTerm, sportsDropdown]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      facility_amenities: amenities,
    }));
  }, [amenities]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      geofencing_type: activeTab === "polygon" ? "1" : "2",
    }));
  }, [activeTab]);

  useEffect(() => {
    if (facilityData) {
      setActiveTab(facilityData.radius ? "radius" : "polygon");
      setFormData({
        facility_code: facilityData.facilityCode || "",
        facility_name: facilityData.facilityName || "",
        facility_type: facilityData.facilityType || "",
        sport_id: facilityData.sport_id || facilityData.facilityType || "",
        coordinates: {
          latitude: facilityData.coordinates?.latitude || "",
          longitude: facilityData.coordinates?.longitude || "",
        },
        geofencing_type: facilityData.radius ? "1" : "2",
        facility_capacity: facilityData.capacity || "",
        facility_image_url: facilityData.image || null,
        facility_radius: facilityData.radius || "",
        supervisor_id: facilityData.supervisorId || "1",
        supervisor_name: facilityData.supervisorName || "",
        supervisor_contact: facilityData.supervisorContact || "",
        supervisor_email: facilityData.supervisorEmail || "",
        assigned_to: null,
        venue_ids: venueId ? [venueId] : [],
        zone_ids: Array.isArray(facilityData.zones)
          ? facilityData.zones.map((z) =>
              typeof z === "string" ? Number.parseInt(z) : z
            )
          : [],
        facility_amenities: facilityData.amenities || [],
      });

      if (facilityData.amenities) {
        setAmenities(facilityData.amenities);
      }

      setFilePreview(facilityData.image || null);
    }
  }, [facilityData, venueId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isAlertOpen) return;

    const { name, value } = e.target;

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      if (parent === "coordinates") {
        setFormData({
          ...formData,
          coordinates: {
            ...formData.coordinates,
            [child]: value,
          },
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSelectChange = (name: string, value: string | number) => {
    if (isAlertOpen) return;

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    if (name === "zone_ids") {
      const zoneId = typeof value === "string" ? Number.parseInt(value) : value;
      if (!formData.zone_ids.includes(zoneId)) {
        setFormData({
          ...formData,
          zone_ids: [...formData.zone_ids, zoneId],
        });
      }
    } else if (name === "facility_type" || name === "sport_id") {
      const sportName = getSelectedSportName(value);
      setFormData({
        ...formData,
        [name]: String(value),
        facility_name: String(sportName || ""),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isAlertOpen) return;

    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);

      const reader = new FileReader();
      reader.onload = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addAmenity = () => {
    if (isAlertOpen) return;

    if (newAmenity.trim() !== "" && !amenities.includes(newAmenity.trim())) {
      const updatedAmenities = [...amenities, newAmenity.trim()];
      setAmenities(updatedAmenities);
      setNewAmenity("");
    }
  };

  const removeAmenity = (index: number) => {
    if (isAlertOpen) return;

    const updatedAmenities = amenities.filter((_, i) => i !== index);
    setAmenities(updatedAmenities);
  };

  const removeZone = (zoneId: number) => {
    if (isAlertOpen) return;

    setFormData({
      ...formData,
      zone_ids: formData.zone_ids.filter((id) => id !== zoneId),
    });
  };

  const getZoneName = (zoneId: number) => {
    const zone = availableZones.find((z) => z.id === zoneId);
    return zone ? zone.name : `Zone ${zoneId}`;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.facility_code.trim()) {
      newErrors.facility_code = "Facility Code is required";
    }

    if (!formData.sport_id) {
      newErrors.sport_id = "Sport Type is required";
    }

    if (!venueId && formData.venue_ids.length === 0) {
      newErrors.venue_ids = "Venue ID is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const LabelWithAsterisk = ({
    htmlFor,
    children,
  }: {
    htmlFor: string;
    children: React.ReactNode;
  }) => (
    <label htmlFor={htmlFor} className="block font-medium text-black mb-2">
      {children} <span className="text-red-500">*</span>
    </label>
  );

  const handleSubmit = async () => {
    if (isAlertOpen) return; // Prevent submission when alert is open

    if (!validateForm()) {
      // Set alert state to true before showing validation error
      setIsAlertOpen(true);

      await new Promise((resolve) => {
        Swal.fire({
          title: "Validation Error",
          text: "Please fix the errors in the form",
          icon: "error",
          confirmButtonColor: "#8A2BE2",
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false,
          allowOutsideClick: false,
          allowEscapeKey: false,
          target: document.body,
          backdrop: true,
          heightAuto: false,
          customClass: {
            container: "swal-container-high-z-index",
          },
          didOpen: () => {
            // Disable form interactions
            const formElement = document.querySelector(
              ".facility-form-container"
            );
            if (formElement) {
              (formElement as HTMLElement).style.pointerEvents = "none";
              (formElement as HTMLElement).style.opacity = "0.7";
            }

            // Ensure proper z-index
            const swalContainer = document.querySelector(
              ".swal2-container"
            ) as HTMLElement;
            if (swalContainer) {
              swalContainer.style.zIndex = "99999";
              swalContainer.style.position = "fixed";
            }
          },
          didClose: () => {
            // Re-enable form interactions
            const formElement = document.querySelector(
              ".facility-form-container"
            );
            if (formElement) {
              (formElement as HTMLElement).style.pointerEvents = "auto";
              (formElement as HTMLElement).style.opacity = "1";
            }
            resolve({ isConfirmed: true });
          },
        }).then((result) => {
          setIsAlertOpen(false);
          resolve(result);
        });
      });

      return;
    }

    setIsSubmitting(true);

    try {
      const formDataPayload = new FormData();

      formDataPayload.append("facility_code", formData.facility_code.trim());
      formDataPayload.append("facility_name", formData.facility_name.trim());

      const coordinatesToSend = {
        latitude: formData.coordinates.latitude || null,
        longitude: formData.coordinates.longitude || null,
      };
      formDataPayload.append("coordinates", JSON.stringify(coordinatesToSend));
      formDataPayload.append("geofencing_type", formData.geofencing_type);
      formDataPayload.append(
        "facility_capacity",
        formData.facility_capacity || ""
      );

      if (selectedFile) {
        formDataPayload.append("image_url", selectedFile);
      } else if (formData.facility_image_url) {
        formDataPayload.append("image_url", formData.facility_image_url);
      }

      if (activeTab === "radius" && formData.facility_radius) {
        formDataPayload.append(
          "facility_radius",
          formData.facility_radius.trim()
        );
      }

      formDataPayload.append("supervisor_id", formData.supervisor_id);
      formDataPayload.append(
        "supervisor_name",
        formData.supervisor_name.trim()
      );
      formDataPayload.append(
        "supervisor_contact",
        formData.supervisor_contact.trim()
      );
      formDataPayload.append(
        "supervisor_email",
        formData.supervisor_email.trim()
      );
      formDataPayload.append("assigned_to", "null");
      formDataPayload.append("venue_ids", JSON.stringify(formData.venue_ids));
      formDataPayload.append(
        "zone_ids",
        JSON.stringify(formData.zone_ids.map((id) => id.toString()))
      );
      formDataPayload.append("facility_amenities", JSON.stringify(amenities));

      if (formData.sport_id) {
        formDataPayload.append("facility_type", formData.sport_id.toString());
      }

      let result;
      if (isEditing && facilityData?.id) {
        result = await dispatch(
          updateFacility(
            facilityData.id,
            formDataPayload as unknown as FacilityCreateUpdatePayload
          ) as any
        );

        if (result) {
          // Set alert state for success message
          setIsAlertOpen(true);

          await new Promise((resolve) => {
            Swal.fire({
              title: "Success!",
              text: `Facility "${formData.facility_name.trim()}" updated successfully.`,
              icon: "success",
              confirmButtonColor: "#8A2BE2",
              timer: 2000,
              timerProgressBar: true,
              showConfirmButton: false,
              allowOutsideClick: false,
              allowEscapeKey: false,
              target: document.body,
              backdrop: true,
              heightAuto: false,
              customClass: {
                container: "swal-container-high-z-index",
              },
              didOpen: () => {
                const formElement = document.querySelector(
                  ".facility-form-container"
                );
                if (formElement) {
                  (formElement as HTMLElement).style.pointerEvents = "none";
                  (formElement as HTMLElement).style.opacity = "0.7";
                }

                const swalContainer = document.querySelector(
                  ".swal2-container"
                ) as HTMLElement;
                if (swalContainer) {
                  swalContainer.style.zIndex = "99999";
                  swalContainer.style.position = "fixed";
                }
              },
              didClose: () => {
                const formElement = document.querySelector(
                  ".facility-form-container"
                );
                if (formElement) {
                  (formElement as HTMLElement).style.pointerEvents = "auto";
                  (formElement as HTMLElement).style.opacity = "1";
                }
                resolve({ isConfirmed: true });
              },
            }).then((result) => {
              setIsAlertOpen(false);
              resolve(result);
            });
          });

          if (onSuccess) onSuccess();
          resetForm();
          onClose();
        }
      } else {
        result = await dispatch(
          createFacility(
            formDataPayload as unknown as FacilityCreateUpdatePayload
          ) as any
        );

        if (result) {
          // Set alert state for success message
          setIsAlertOpen(true);

          await new Promise((resolve) => {
            Swal.fire({
              title: "Success!",
              text: `Facility "${formData.facility_name.trim()}" created successfully.`,
              icon: "success",
              confirmButtonColor: "#8A2BE2",
              timer: 2000,
              timerProgressBar: true,
              showConfirmButton: false,
              allowOutsideClick: false,
              allowEscapeKey: false,
              target: document.body,
              backdrop: true,
              heightAuto: false,
              customClass: {
                container: "swal-container-high-z-index",
              },
              didOpen: () => {
                const formElement = document.querySelector(
                  ".facility-form-container"
                );
                if (formElement) {
                  (formElement as HTMLElement).style.pointerEvents = "none";
                  (formElement as HTMLElement).style.opacity = "0.7";
                }

                const swalContainer = document.querySelector(
                  ".swal2-container"
                ) as HTMLElement;
                if (swalContainer) {
                  swalContainer.style.zIndex = "99999";
                  swalContainer.style.position = "fixed";
                }
              },
              didClose: () => {
                const formElement = document.querySelector(
                  ".facility-form-container"
                );
                if (formElement) {
                  (formElement as HTMLElement).style.pointerEvents = "auto";
                  (formElement as HTMLElement).style.opacity = "1";
                }
                resolve({ isConfirmed: true });
              },
            }).then((result) => {
              setIsAlertOpen(false);
              resolve(result);
            });
          });

          if (onSuccess) onSuccess();
          resetForm();
          onClose();
        }
      }
    } catch (error: any) {
      console.error("Error submitting facility form:", error);

      let errorMessage = "An error occurred while saving the facility.";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Set alert state for error message
      setIsAlertOpen(true);

      await new Promise((resolve) => {
        Swal.fire({
          title: "Error",
          text: errorMessage,
          icon: "error",
          confirmButtonColor: "#8A2BE2",
          timer: 4000,
          timerProgressBar: true,
          showConfirmButton: false,
          allowOutsideClick: false,
          allowEscapeKey: false,
          target: document.body,
          backdrop: true,
          heightAuto: false,
          customClass: {
            container: "swal-container-high-z-index",
          },
          didOpen: () => {
            const formElement = document.querySelector(
              ".facility-form-container"
            );
            if (formElement) {
              (formElement as HTMLElement).style.pointerEvents = "none";
              (formElement as HTMLElement).style.opacity = "0.7";
            }

            const swalContainer = document.querySelector(
              ".swal2-container"
            ) as HTMLElement;
            if (swalContainer) {
              swalContainer.style.zIndex = "99999";
              swalContainer.style.position = "fixed";
            }
          },
          didClose: () => {
            const formElement = document.querySelector(
              ".facility-form-container"
            );
            if (formElement) {
              (formElement as HTMLElement).style.pointerEvents = "auto";
              (formElement as HTMLElement).style.opacity = "1";
            }
            resolve({ isConfirmed: true });
          },
        }).then((result) => {
          setIsAlertOpen(false);
          resolve(result);
        });
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-full sm:max-w-4xl p-6 rounded-lg bg-white overflow-y-auto max-h-[90vh] z-50">
        <div className="absolute right-4 top-4 z-10">
          {/* <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-6 w-6 rounded-full"
          >
            <X size={16} />
          </Button> */}
        </div>
        <DialogHeader className="p-0 mb-6 text-center">
          <DialogTitle className="text-2xl font-bold text-black">
            {isEditing ? "Edit Facility" : "Create Facility"}
          </DialogTitle>
        </DialogHeader>

        <div className="w-full mb-6">
          <div className="w-full border border-gray-200 h-64 bg-gray-200 rounded-lg overflow-hidden">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3501.6743366308513!2d77.21116937547852!3d28.63926937564201!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfd5b347eb62d%3A0x52c2b7494e204dce!2sNew%20Delhi%2C%20Delhi!5e0!3m2!1sen!2sin!4v1711605847027!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>

        <div className="flex justify-center mb-6">
          <div className="flex rounded-full bg-purple-100 p-1">
            <button
              className={`px-6 py-2 rounded-full text-sm font-medium ${
                activeTab === "polygon"
                  ? "bg-purple-600 text-white"
                  : "bg-transparent text-purple-600"
              }`}
              onClick={() => setActiveTab("polygon")}
            >
              Polygon
            </button>
            <button
              className={`px-6 py-2 rounded-full text-sm font-medium ${
                activeTab === "radius"
                  ? "bg-purple-600 text-white"
                  : "bg-transparent text-purple-600"
              }`}
              onClick={() => setActiveTab("radius")}
            >
              Radius
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sport Type - Moved to the first position */}
          <div>
            <LabelWithAsterisk htmlFor="sport_id">Sport Type</LabelWithAsterisk>
            <div className="relative">
              <Select
                value={formData.sport_id?.toString() || ""}
                onValueChange={(value) => handleSelectChange("sport_id", value)}
                disabled={isEditing} // Use isEditing instead of mode
                onOpenChange={(open) => {
                  // Prevent opening dropdown in edit mode
                  if (isEditing) return; // Use isEditing instead of mode

                  // Reset search when dropdown opens
                  if (open) {
                    setSportSearchTerm("");
                    // Focus the search input after a short delay to ensure it's rendered
                    setTimeout(() => {
                      if (searchInputRef.current) {
                        searchInputRef.current.focus();
                      }
                    }, 100);
                  }
                }}
              >
                <SelectTrigger
                  className={`w-full border-gray-300 rounded-md ${
                    errors.sport_id ? "border-red-500" : ""
                  } ${
                    isEditing ? "bg-gray-100 cursor-not-allowed opacity-60" : ""
                  }`} // Use isEditing instead of mode
                >
                  <SelectValue placeholder="Select Sport Type">
                    {getSelectedSportName(formData.sport_id)}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <div className="px-2 py-2 sticky top-0 bg-white z-10">
                    <Input
                      ref={searchInputRef}
                      className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Search sports..."
                      value={sportSearchTerm}
                      onChange={(e) => {
                        setSportSearchTerm(e.target.value);
                        e.stopPropagation();
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>

                  <div className="max-h-52 overflow-y-auto">
                    {/* Debug info - remove this in production */}
                    {process.env.NODE_ENV === "development" && (
                      <div className="px-2 py-1 text-xs text-gray-400 border-b">
                        {/* Debug: {sportsDropdown?.length || 0} sports loaded,{" "} */}
                        {filteredSports.length} filtered
                      </div>
                    )}

                    {filteredSports.length > 0 ? (
                      filteredSports.map((sport) => {
                        console.log("Rendering sport item:", sport);
                        return (
                          <SelectItem
                            key={sport.sport_id}
                            value={sport.sport_id?.toString() || ""}
                          >
                            {typeof sport.sport_name === "string"
                              ? sport.sport_name
                              : "Unknown Sport"}
                          </SelectItem>
                        );
                      })
                    ) : sportSearchTerm && filteredSports.length === 0 ? (
                      <div className="px-2 py-2 text-gray-500 text-sm">
                        No sports found matching {sportSearchTerm}
                      </div>
                    ) : sportsDropdown && sportsDropdown.length === 0 ? (
                      <div className="px-2 py-2 text-gray-500 text-sm">
                        No sports available
                      </div>
                    ) : !sportsDropdown ? (
                      <SelectItem value="loading" disabled>
                        Loading sports...
                      </SelectItem>
                    ) : (
                      <div className="px-2 py-2 text-gray-500 text-sm">
                        Type to search sports...
                      </div>
                    )}
                  </div>
                </SelectContent>
              </Select>
              {errors.sport_id && (
                <p className="text-red-500 text-xs mt-1">{errors.sport_id}</p>
              )}
              {isEditing && ( // Use isEditing instead of mode
                <p className="text-xs text-gray-500 mt-1">
                  Sport type cannot be changed in edit mode
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block font-medium text-black mb-2">
              Facility Name
            </label>
            <Input
              name="facility_name"
              value={formData.facility_name}
              className="w-full border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
              readOnly
            />
          </div>

          {/* Facility Code */}
          <div>
            <LabelWithAsterisk htmlFor="facility_code">
              Facility Code
            </LabelWithAsterisk>
            <Input
              name="facility_code"
              placeholder="Enter Facility Code"
              value={formData.facility_code}
              onChange={handleInputChange}
              className={`w-full border-gray-300 rounded-md ${
                errors.facility_code ? "border-red-500" : ""
              }`}
              disabled={isEditing}
            />
            {errors.facility_code && (
              <p className="text-red-500 text-xs mt-1">
                {errors.facility_code}
              </p>
            )}
          </div>
          {/* Coordinates */}
          <div>
            <label className="block font-medium text-black mb-2">
              Coordinates
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                name="coordinates.latitude"
                placeholder="Latitude"
                value={formData.coordinates.latitude}
                onChange={handleInputChange}
                className="w-full border-gray-300 rounded-md"
              />
              <Input
                name="coordinates.longitude"
                placeholder="Longitude"
                value={formData.coordinates.longitude}
                onChange={handleInputChange}
                className="w-full border-gray-300 rounded-md"
              />
            </div>
          </div>
          {/* Radius field (conditional) */}
          {activeTab === "radius" && (
            <div>
              <label className="block font-medium text-black mb-2">
                Radius
              </label>
              <Input
                name="facility_radius"
                placeholder="Enter Cluster Radius"
                value={formData.facility_radius}
                onChange={handleInputChange}
                className="w-full border-gray-300 rounded-md"
                type="number"
              />
            </div>
          )}
          {/* Facility Capacity */}
          <div>
            <label className="block font-medium text-black mb-2">
              Facility Capacity
            </label>
            <Input
              name="facility_capacity"
              placeholder="Enter Capacity"
              value={formData.facility_capacity}
              onChange={handleInputChange}
              className="w-full border-gray-300 rounded-md"
              type="number"
            />
          </div>
          {/* Upload Image */}
          <div>
            <label className="block font-medium text-black mb-2">
              Upload Image
            </label>
            <div className="border border-gray-300 rounded-md p-2">
              <Input
                id="upload-image"
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept="image/*"
              />
              <label
                htmlFor="upload-image"
                className="cursor-pointer text-sm flex items-center"
              >
                <span className="bg-gray-100 px-3 py-2 rounded mr-2">
                  Choose file
                </span>
                <span className="text-gray-500">
                  {selectedFile ? selectedFile.name : "No file chosen"}
                </span>
              </label>
            </div>
            {filePreview && (
              <div className="mt-2 relative">
                <img
                  src={filePreview || "/placeholder.svg"}
                  alt="Facility preview"
                  className="h-20 w-auto rounded-md object-cover"
                />
                <button
                  onClick={() => {
                    setFilePreview(null);
                    setSelectedFile(null);
                    if (!isEditing) {
                      setFormData({
                        ...formData,
                        facility_image_url: null,
                      });
                    }
                  }}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                >
                  <X size={12} />
                </button>
              </div>
            )}
          </div>

          {/* Supervisor Name */}
          <div>
            <label htmlFor="supervisor_name" className="block font-bold mb-1">
              Facility Supervisor Name
            </label>
            <Input
              name="supervisor_name"
              placeholder="Enter Supervisor Name"
              value={formData.supervisor_name}
              onChange={handleInputChange}
              className={`w-full border-gray-300 rounded-md ${
                errors.supervisor_name ? "border-red-500" : ""
              }`}
            />
            {errors.supervisor_name && (
              <p className="text-red-500 text-xs mt-1">
                {errors.supervisor_name}
              </p>
            )}
          </div>

          {/* Supervisor Email */}
          <div>
            <label htmlFor="supervisor_email" className="block font-bold mb-1">
              Facility Supervisor Email
            </label>
            <Input
              name="supervisor_email"
              placeholder="Enter Supervisor Email"
              value={formData.supervisor_email}
              onChange={handleInputChange}
              className={`w-full border-gray-300 rounded-md ${
                errors.supervisor_email ? "border-red-500" : ""
              }`}
              type="email"
            />
            {errors.supervisor_email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.supervisor_email}
              </p>
            )}
          </div>

          {/* Supervisor Contact */}
          <div>
            <label
              htmlFor="supervisor_contact"
              className="block font-bold mb-1"
            >
              Facility Supervisor Contact No
            </label>
            <Input
              name="supervisor_contact"
              placeholder="Enter Contact No"
              value={formData.supervisor_contact}
              onChange={handleInputChange}
              className={`w-full border-gray-300 rounded-md ${
                errors.supervisor_contact ? "border-red-500" : ""
              }`}
            />
            {errors.supervisor_contact && (
              <p className="text-red-500 text-xs mt-1">
                {errors.supervisor_contact}
              </p>
            )}
          </div>

          {/* Venue Amenities */}
          <div>
            <label className="block font-medium text-black mb-2">
              Add Venue Amenities
            </label>
            <div className="flex">
              <Input
                placeholder="Enter Venue Amenities"
                value={newAmenity}
                onChange={(e) => setNewAmenity(e.target.value)}
                className="w-full border-gray-300 rounded-l-md"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addAmenity();
                  }
                }}
              />
              <Button
                className="rounded-l-none bg-purple-600 hover:bg-purple-700 text-white"
                onClick={addAmenity}
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {amenities.map((amenity, index) => (
                <div
                  key={index}
                  className="flex items-center bg-yellow-400 text-black px-3 py-1 rounded-full text-sm"
                >
                  {amenity}
                  <button
                    onClick={() => removeAmenity(index)}
                    className="ml-2 text-black hover:text-gray-800"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <Button
            onClick={handleSubmit}
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-2 rounded-md"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Saving..."
              : isEditing
              ? "Update Facility"
              : "Create Facility"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
