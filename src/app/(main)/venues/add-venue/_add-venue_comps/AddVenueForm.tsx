"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../../../../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../../components/ui/select";
import { Input } from "../../../../../components/ui/input";
import Swal, { SweetAlertOptions } from "sweetalert2";
import { Label } from "../../../../../components/ui/label";
// import Swal from "sweetalert2";
import {
  createVenue,
  updateVenue,
  fetchVenue,
  fetchVenues,
} from "../../../../../redux/reducer/venue/action";
import { fetchClusterDropdown } from "../../../../../redux/reducer/cluster/action";
import type { AppDispatch, RootState } from "../../../../../redux/store";
import type { Dispatch, SetStateAction } from "react";

interface VenueFormProps {
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
  onVenueSaved?: (venueId: string | number, venueName: string) => void;
  venueId?: number | string | null;
  mode?: "create" | "edit";
  initialGeofencingType?: "1" | "2";
  preselectedClusterId?: string | null;
  presetClusterId?: number; // Add this
  defaultClusterId?: number; // Add this
}

type ValidationFunction = (value: string) => string | null;

interface Cluster {
  id: number;
  cluster_name: string;
  cluster_code: string;
  assigned_to: string | null;
  venues: any[];
}

interface ClusterType {
  id: number;
  cluster_name: string;
  cluster_code?: string;
  assigned_to?: string | null;
  venues?: any[];
}

// Configure SweetAlert2 defaults
const configureSweetAlert = () => {
  Swal.mixin({
    customClass: {
      popup: "swal-custom-popup",
    },
    target: document.body,
    backdrop: true,
    allowOutsideClick: false,
    allowEscapeKey: true,
    heightAuto: false,
    didOpen: () => {
      // Force higher z-index when opened
      const swalContainer = document.querySelector(
        ".swal2-container"
      ) as HTMLElement;
      if (swalContainer) {
        swalContainer.style.zIndex = "99999";
        swalContainer.style.position = "fixed";
        swalContainer.style.top = "0";
        swalContainer.style.left = "0";
        swalContainer.style.width = "100%";
        swalContainer.style.height = "100%";
      }
      const swalPopup = document.querySelector(".swal2-popup") as HTMLElement;
      if (swalPopup) {
        swalPopup.style.zIndex = "99999";
      }
    },
  });
};

const VenueForm = ({
  setIsModalOpen,
  venueId = null,
  mode = "create",
  onVenueSaved,
  presetClusterId,
  defaultClusterId,
  initialGeofencingType = "1",
  preselectedClusterId = null,
}: VenueFormProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { selectedVenue, updateLoading, createLoading } = useSelector(
    (state: RootState) => state.venue
  );
  console.log(22222);
  const {
    dropdownOptions: clusterDropdown,
    dropdownLoading: clusterDropdownLoading,
  } = useSelector((state: RootState) => state.cluster);

  const [selectedMode, setSelectedMode] = useState<"polygon" | "radius">(
    initialGeofencingType === "2" ? "polygon" : "radius"
  );

  const [fileSelected, setFileSelected] = useState<File | null>(null);
  const [fileLabel, setFileLabel] = useState("No file chosen");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false); // Track if SweetAlert is open

  const [selectedClusterName, setSelectedClusterName] = useState<string>("");

  const [formData, setFormData] = useState({
    venue_code: "",
    venue_name: "",
    venue_capacity: "",
    coordinates: {
      latitude: "",
      longitude: "",
    },
    venue_radius: "",
    // cluster_id: preselectedClusterId || "",
    cluster_id: presetClusterId
      ? String(presetClusterId)
      : defaultClusterId
      ? String(defaultClusterId)
      : "",
    cluster_name: "",
    supervisor_name: "",
    supervisor_contact: "",
    supervisor_email: "",
    venue_description: "",
    venue_address: "",
    image_url: null as File | null | string,
    geofencing_type: initialGeofencingType,
  });

  // Configure SweetAlert2 on component mount
  useEffect(() => {
    configureSweetAlert();
  }, []);

  // Update cluster_id when preselectedClusterId changes
  useEffect(() => {
    if (presetClusterId) {
      setFormData((prev) => ({
        ...prev,
        cluster_id: String(presetClusterId),
      }));
    }
  }, [presetClusterId]);

  // useEffect(() => {
  //   dispatch(fetchClustersDropdown());
  // }, [dispatch]);

  // const renderClusterSelection = () => (
  //   <div>
  //     {renderLabel("Select Cluster", "cluster_id", false)}
  //     <Select
  //       value={formData.cluster_id}
  //       onValueChange={(value) => handleSelectChange(value, "cluster_id")}
  //       disabled={isClusterPreselected || isAlertOpen}
  //     >
  //       <SelectTrigger
  //         className={`w-full border-gray-300 ${
  //           errors.cluster_id ? "border-red-500" : ""
  //         } ${isClusterPreselected ? "bg-gray-50 cursor-not-allowed" : ""}`}
  //       >
  //         <SelectValue placeholder="Select Cluster" />
  //       </SelectTrigger>
  //       <SelectContent className="bg-white">
  //         {clusterDropdown && clusterDropdown.length > 0 ? (
  //           clusterDropdown.map((cluster: any) => (
  //             <SelectItem key={cluster.id} value={cluster.id.toString()}>
  //               {cluster.cluster_name || cluster.name}
  //             </SelectItem>
  //           ))
  //         ) : (
  //           <SelectItem value="" disabled>
  //             {clusterDropdownLoading
  //               ? "Loading clusters..."
  //               : "No clusters available"}
  //           </SelectItem>
  //         )}
  //       </SelectContent>
  //     </Select>
  //     {errors.cluster_id && (
  //       <p className="text-red-500 text-xs mt-1">{errors.cluster_id}</p>
  //     )}
  //     {formData.cluster_id && selectedClusterName && (
  //       <p className="text-xs text-gray-500 mt-1">
  //         Selected: {selectedClusterName}
  //         {isClusterPreselected && (
  //           <span className="text-purple-600 ml-1 font-medium">
  //             (Pre-selected)
  //           </span>
  //         )}
  //       </p>
  //     )}
  //     {isClusterPreselected && (
  //       <p className="text-xs text-blue-600 mt-1">
  //         This venue will be created under the selected cluster.
  //       </p>
  //     )}
  //   </div>
  // );

  const validateRequired = (value: string) => {
    return value.trim() ? null : "This field is required";
  };

  const validateAlphabetic: ValidationFunction = (value) => {
    const required = validateRequired(value);
    if (required) return required;
    if (!/^[A-Za-z\s]+$/.test(value))
      return "Only alphabetic characters are allowed";
    return null;
  };

  const validateAlphanumeric: ValidationFunction = (value) => {
    const required = validateRequired(value);
    if (required) return required;
    if (!/^[A-Za-z0-9]+$/.test(value))
      return "Only alphanumeric characters are allowed";
    return null;
  };
  const validateAlnumeric: ValidationFunction = (value) => {
    if (!value.trim()) return null;
    if (!/^[A-Za-z\s]+$/.test(value))
      return "Only alphabetic characters are allowed";
    return null;
  };

  const validateEmail: ValidationFunction = (value) => {
    if (!value.trim()) return null;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
      return "Invalid email format";
    return null;
  };

  const validateDescription: ValidationFunction = (value) => {
    // const required = validateRequired(value)
    // if (required) return required
    const wordCount = value.trim().split(/\s+/).length;
    if (wordCount > 100) return "Description should be 100 words or less";
    return null;
  };

  const validateNumeric: ValidationFunction = (value) => {
    if (!value.trim()) return null;
    if (!/^\d+$/.test(value)) return "Only numeric values are allowed";
    return null;
  };

  const validatePhoneNumber: ValidationFunction = (value) => {
    if (!value.trim()) return null;
    if (!/^\d{10}$/.test(value)) return "Phone number must be 10 digits";
    return null;
  };

  const validateCoordinate: ValidationFunction = (value) => {
    if (!value.trim()) return null;
    if (!/^-?\d+(\.\d+)?$/.test(value)) return "Invalid coordinate format";
    return null;
  };

  const validateImageType = (file: File | null) => {
    if (!file) return null;
    const acceptedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!acceptedTypes.includes(file.type))
      return "Only JPG, JPEG, PNG formats are allowed";
    return null;
  };

  useEffect(() => {
    dispatch(fetchClusterDropdown);
    console.log("Gooooodddd");
  }, [dispatch]);

  useEffect(() => {
    if (mode === "edit" && venueId) {
      // dispatch(fetchVenue(Number(venueId)));
    }
  }, [venueId, mode, dispatch]);

  // Effect to update selectedClusterName when clusterDropdown loads
  useEffect(() => {
    if (clusterDropdown?.length > 0 && formData.cluster_id) {
      const cluster = clusterDropdown.find(
        (c: ClusterType) => c.id === Number(formData.cluster_id)
      );
      if (cluster) {
        setSelectedClusterName(cluster.cluster_name);
        setFormData((prev) => ({
          ...prev,
          cluster_name: cluster.cluster_name,
        }));
      }
    }
  }, [clusterDropdown, formData.cluster_id]);

  // Update the useEffect where you populate form data for edit mode
  useEffect(() => {
    if (mode === "edit" && selectedVenue) {
      let latitude = "",
        longitude = "";
      if (selectedVenue.coordinates) {
        if (typeof selectedVenue.coordinates === "string") {
          try {
            const coords = JSON.parse(selectedVenue.coordinates);
            latitude = coords.latitude?.toString() || "";
            longitude = coords.longitude?.toString() || "";
          } catch (e) {
            const coords = selectedVenue.coordinates.split(",");
            if (coords.length === 2) {
              latitude = coords[0].trim();
              longitude = coords[1].trim();
            }
          }
        } else if (
          selectedVenue.coordinates &&
          typeof selectedVenue.coordinates === "object"
        ) {
          const coords = selectedVenue.coordinates as {
            latitude?: number;
            longitude?: number;
          };
          latitude = coords.latitude?.toString() || "";
          longitude = coords.longitude?.toString() || "";
        }
      }

      let clusterName = "";
      if (
        selectedVenue.cluster_id &&
        clusterDropdown &&
        clusterDropdown.length > 0
      ) {
        const cluster = clusterDropdown.find(
          (c: ClusterType) => c.id === Number(selectedVenue.cluster_id)
        );
        clusterName = cluster ? cluster.cluster_name : "";
      }

      // Set existing image URL and update file label
      if (selectedVenue.image_url) {
        setExistingImageUrl(selectedVenue.image_url);
        const fileName =
          (selectedVenue.image_url as string).split("/").pop() ||
          "Current image";
        setFileLabel(fileName);
      }

      setFormData({
        venue_code: selectedVenue.venue_code || "null",
        venue_name: selectedVenue.venue_name || "",
        venue_capacity: selectedVenue.venue_capacity?.toString() || "",
        coordinates: {
          latitude,
          longitude,
        },
        venue_radius: selectedVenue.venue_radius?.toString() || "",
        cluster_id: selectedVenue.cluster_id?.toString() || "",
        cluster_name: clusterName,
        supervisor_name: selectedVenue.supervisor_name || "",
        supervisor_contact: selectedVenue.supervisor_contact || "",
        supervisor_email: selectedVenue.supervisor_email || "",
        venue_description: selectedVenue.venue_description || "",
        venue_address: selectedVenue.venue_address || "",
        image_url: selectedVenue.image_url || null,
        geofencing_type: (selectedVenue.geofencing_type?.toString() || "1") as
          | "1"
          | "2",
      });

      setSelectedClusterName(clusterName);
    }
  }, [selectedVenue, mode, clusterDropdown]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (isAlertOpen) return;

    const { id, value } = e.target;

    if (id === "latitude" || id === "longitude") {
      setFormData((prev) => ({
        ...prev,
        coordinates: {
          ...prev.coordinates,
          [id]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [id]: value }));
    }

    if (errors[id]) {
      validateField(id, value);
    }
  };

  const validateField = (id: string, value: string) => {
    let error = "";

    switch (id) {
      case "venue_name":
        error = validateAlphabetic(value) || "";
        break;
      case "venue_code":
        error = validateAlphanumeric(value) || "";
        break;
      case "venue_capacity":
        // First check if it's numeric
        error = validateNumeric(value) || "";

        // If numeric validation passes, check the capacity limit
        if (!error && value) {
          const capacity = parseInt(value, 10);
          if (capacity > 1000000) {
            // 10 lakh = 1,000,000
            error = "Venue capacity cannot exceed 10 lakh (1,000,000)";
          }
        }
        break;
      case "latitude":
      case "longitude":
        error = validateCoordinate(value) || "";
        break;
      case "venue_radius":
        error = validateNumeric(value) || "";
        break;
      case "supervisor_name":
        error = validateAlnumeric(value) || "";
        break;
      case "supervisor_contact":
        error = validatePhoneNumber(value) || "";
        break;
      case "supervisor_email":
        error = validateEmail(value) || "";
        break;
      case "venue_description":
        error = validateDescription(value) || "";
        break;
      case "venue_address":
        error = validateRequired(value) || "";
        break;
      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [id]: error }));
    return error === "";
  };

  const handleSelectChange = (value: string, field: string) => {
    // Prevent changes when alert is open
    if (isAlertOpen) return;

    setFormData((prev) => ({ ...prev, [field]: value }));

    if (field === "cluster_id" && clusterDropdown) {
      const selectedCluster = clusterDropdown.find(
        (c: ClusterType) => c.id === Number(value)
      );
      if (selectedCluster) {
        setFormData((prev) => ({
          ...prev,
          cluster_name: selectedCluster.cluster_name,
        }));
        setSelectedClusterName(selectedCluster.cluster_name);
      }
    }

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Prevent changes when alert is open
    if (isAlertOpen) return;

    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileSelected(file);
      setFileLabel(file.name);
      setFormData((prev) => ({ ...prev, image_url: file }));
      // Clear existing image URL when new file is selected
      setExistingImageUrl(null);

      const fileError = validateImageType(file);
      if (fileError) {
        setErrors((prev) => ({ ...prev, image: fileError }));
      } else {
        setErrors((prev) => ({ ...prev, image: "" }));
      }
    }
  };

  const validateForm = () => {
    const fieldsToValidate = {
      venue_name: formData.venue_name,
      venue_code: formData.venue_code,
      venue_capacity: formData.venue_capacity,
      latitude: formData.coordinates.latitude,
      longitude: formData.coordinates.longitude,
      venue_radius: formData.venue_radius,
      supervisor_name: formData.supervisor_name,
      supervisor_contact: formData.supervisor_contact,
      supervisor_email: formData.supervisor_email,
      venue_description: formData.venue_description,
      venue_address: formData.venue_address,
    };

    let isValid = true;

    for (const [field, value] of Object.entries(fieldsToValidate)) {
      if (!validateField(field, value)) {
        isValid = false;
      }
    }

    if (formData.image_url instanceof File) {
      const imageError = validateImageType(formData.image_url);
      if (imageError) {
        setErrors((prev) => ({ ...prev, image: imageError }));
        isValid = false;
      }
    }

    return isValid;
  };

  const showAlert = async (config: any) => {
    setIsAlertOpen(true);

    try {
      const result = await Swal.fire({
        ...config,
        target: document.body,
        backdrop: true,
        heightAuto: false,
        didOpen: () => {
          // Disable form interactions and set z-index
          const formElement = document.getElementById("venue-form-container");
          if (formElement) {
            formElement.style.pointerEvents = "none";
            formElement.style.opacity = "0.7";
          }

          // Ensure proper z-index
          const swalContainer = document.querySelector(
            ".swal2-container"
          ) as HTMLElement;
          if (swalContainer) {
            swalContainer.style.zIndex = "99999";
            swalContainer.style.position = "fixed";
          }
          const swalPopup = document.querySelector(
            ".swal2-popup"
          ) as HTMLElement;
          if (swalPopup) {
            swalPopup.style.zIndex = "99999";
          }
        },
        didClose: () => {
          // Re-enable form interactions
          const formElement = document.getElementById("venue-form-container");
          if (formElement) {
            formElement.style.pointerEvents = "auto";
            formElement.style.opacity = "1";
          }
        },
      });

      setIsAlertOpen(false);
      return result;
    } catch (error) {
      setIsAlertOpen(false);
      throw error;
    }
  };

  const handleSubmit = async () => {
    if (isAlertOpen) return;

    if (!validateForm()) {
      const errorFields = Object.keys(errors).filter((key) => errors[key]);
      const errorMessage =
        errorFields.length > 0
          ? `Please correct the following fields: ${errorFields.join(", ")}`
          : "Please fill all required fields correctly.";

      let countdown = 0;

      await new Promise((resolve) => {
        const alertConfig = {
          icon: "error",
          title: `Validation Error`,
          text: errorMessage,
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false,
          allowOutsideClick: false,
          allowEscapeKey: false,
          target: document.body,
          backdrop: true,
          heightAuto: false,
          customClass: {
            popup: "swal-custom-popup",
          },
          didOpen: () => {
            const formElement = document.getElementById("venue-form-container");
            if (formElement) {
              formElement.style.pointerEvents = "none";
              formElement.style.opacity = "0.7";
            }

            const swalContainer = document.querySelector(
              ".swal2-container"
            ) as HTMLElement;
            if (swalContainer) {
              swalContainer.style.zIndex = "99999";
              swalContainer.style.position = "fixed";
            }

            const swalPopup = document.querySelector(
              ".swal2-popup"
            ) as HTMLElement;
            if (swalPopup) {
              swalPopup.style.zIndex = "99999";
            }

            const updateCountdown = () => {
              countdown--;
              if (countdown > 0) {
                const titleElement = document.querySelector(".swal2-title");
                if (titleElement) {
                  titleElement.textContent = `Validation Error (${countdown}s)`;
                }
                setTimeout(updateCountdown, 1000);
              }
            };
            setTimeout(updateCountdown, 1000);
          },
          didClose: () => {
            const formElement = document.getElementById("venue-form-container");
            if (formElement) {
              formElement.style.pointerEvents = "auto";
              formElement.style.opacity = "1";
            }
            resolve({ isConfirmed: true });
          },
        };

        setIsAlertOpen(true);
        Swal.fire(alertConfig as SweetAlertOptions).then((result) => {
          setIsAlertOpen(false);
          resolve(result);
        });
      });

      return;
    }

    const formDataObj = new FormData();

    // Always append all fields, sending null for empty ones in edit mode
    // or only non-empty values in create mode
    const appendField = (key: string, value: string) => {
      if (mode === "edit") {
        // In edit mode, send null for empty fields, actual value for non-empty fields
        formDataObj.append(key, value.trim() || "null");
      } else {
        // In create mode, only send non-empty fields
        if (value.trim()) {
          formDataObj.append(key, value.trim());
        }
      }
    };

    // Handle all text fields
    appendField("venue_code", formData.venue_code);
    appendField("venue_name", formData.venue_name);
    appendField("venue_capacity", formData.venue_capacity);
    appendField("venue_radius", formData.venue_radius);
    appendField("venue_address", formData.venue_address);
    appendField("supervisor_name", formData.supervisor_name);
    appendField("supervisor_contact", formData.supervisor_contact);
    appendField("supervisor_email", formData.supervisor_email);
    appendField("venue_description", formData.venue_description);

    // Handle cluster_id
    if (mode === "edit") {
      formDataObj.append("cluster_id", formData.cluster_id || "null");
    } else {
      if (formData.cluster_id) {
        formDataObj.append("cluster_id", formData.cluster_id);
      }
    }

    // Always append geofencing_type
    formDataObj.append("geofencing_type", formData.geofencing_type);

    // Handle coordinates
    if (mode === "edit") {
      // In edit mode, always send coordinates (null if empty)
      if (
        formData.coordinates.latitude.trim() &&
        formData.coordinates.longitude.trim()
      ) {
        const coordinates = {
          latitude: Number.parseFloat(formData.coordinates.latitude),
          longitude: Number.parseFloat(formData.coordinates.longitude),
        };
        formDataObj.append("coordinates", JSON.stringify(coordinates));
      } else {
        formDataObj.append("coordinates", "null");
      }
    } else {
      // In create mode, only send if both coordinates are provided
      if (
        formData.coordinates.latitude.trim() &&
        formData.coordinates.longitude.trim()
      ) {
        const coordinates = {
          latitude: Number.parseFloat(formData.coordinates.latitude),
          longitude: Number.parseFloat(formData.coordinates.longitude),
        };
        formDataObj.append("coordinates", JSON.stringify(coordinates));
      }
    }

    // Handle image_url
    if (formData.image_url instanceof File) {
      formDataObj.append("image_url", formData.image_url);
    } else if (mode === "edit") {
      // In edit mode, if no new file is selected and no existing image, send null
      if (typeof formData.image_url === "string" && formData.image_url) {
        formDataObj.append("image_url", formData.image_url);
      } else if (!existingImageUrl) {
        formDataObj.append("image_url", "null");
      }
    }

    try {
      let venueName = formData.venue_name;
      let responseVenueId: string | number | null = null;

      if (mode === "edit" && venueId) {
        const updatedVenue = (await dispatch(
          updateVenue(Number(venueId), formDataObj)
        )) as unknown as { venue_name: string };
        venueName = updatedVenue.venue_name;
        responseVenueId = venueId;
      } else {
        const createdVenue = (await dispatch(
          createVenue(formDataObj)
        )) as unknown as { id: number; venue_name: string };
        venueName = createdVenue.venue_name;
        responseVenueId = createdVenue.id;
      }

      let successCountdown = 3;

      await new Promise((resolve) => {
        const alertConfig = {
          icon: "success",
          title: `Venue Saved`,
          text: "Venue has been saved successfully.",
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false,
          allowOutsideClick: false,
          allowEscapeKey: false,
          target: document.body,
          backdrop: true,
          heightAuto: false,
          customClass: {
            popup: "swal-custom-popup",
          },
          didOpen: () => {
            const formElement = document.getElementById("venue-form-container");
            if (formElement) {
              formElement.style.pointerEvents = "none";
              formElement.style.opacity = "0.7";
            }

            const swalContainer = document.querySelector(
              ".swal2-container"
            ) as HTMLElement;
            if (swalContainer) {
              swalContainer.style.zIndex = "99999";
              swalContainer.style.position = "fixed";
            }

            const swalPopup = document.querySelector(
              ".swal2-popup"
            ) as HTMLElement;
            if (swalPopup) {
              swalPopup.style.zIndex = "99999";
            }

            const updateCountdown = () => {
              successCountdown--;
              if (successCountdown > 0) {
                const titleElement = document.querySelector(".swal2-title");
                if (titleElement) {
                  titleElement.textContent = `Venue Saved (${successCountdown}s)`;
                }
                setTimeout(updateCountdown, 1000);
              }
            };
            setTimeout(updateCountdown, 1000);
          },
          didClose: () => {
            const formElement = document.getElementById("venue-form-container");
            if (formElement) {
              formElement.style.pointerEvents = "auto";
              formElement.style.opacity = "1";
            }
            resolve({ isConfirmed: true });
          },
        };
        window.location.reload();

        setIsAlertOpen(true);
        Swal.fire(alertConfig as SweetAlertOptions).then((result) => {
          setIsAlertOpen(false);
          resolve(result);
        });
      });

      // Close modal and perform cleanup actions after success alert closes
      if (setIsModalOpen) setIsModalOpen(false);
      dispatch(fetchVenues());
      if (onVenueSaved && responseVenueId) {
        onVenueSaved(responseVenueId, venueName);
      }
    } catch (error: any) {
      console.error("Error saving venue:", error);

      let errorMessage = "Something went wrong while saving the venue.";

      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      // Show API error alert that auto-closes after 4 seconds with countdown
      let errorCountdown = 4;

      await new Promise((resolve) => {
        const alertConfig = {
          icon: "error",
          title: `Save Failed (${errorCountdown}s)`,
          text: errorMessage,
          timer: 4000,
          timerProgressBar: true,
          showConfirmButton: false,
          allowOutsideClick: false,
          allowEscapeKey: false,
          target: document.body,
          backdrop: true,
          heightAuto: false,
          customClass: {
            popup: "swal-custom-popup",
          },
          didOpen: () => {
            // Disable form interactions
            const formElement = document.getElementById("venue-form-container");
            if (formElement) {
              formElement.style.pointerEvents = "none";
              formElement.style.opacity = "0.7";
            }

            // Set proper z-index
            const swalContainer = document.querySelector(
              ".swal2-container"
            ) as HTMLElement;
            if (swalContainer) {
              swalContainer.style.zIndex = "99999";
              swalContainer.style.position = "fixed";
            }

            const swalPopup = document.querySelector(
              ".swal2-popup"
            ) as HTMLElement;
            if (swalPopup) {
              swalPopup.style.zIndex = "99999";
            }

            // Update countdown in title every second
            const updateCountdown = () => {
              errorCountdown--;
              if (errorCountdown > 0) {
                const titleElement = document.querySelector(".swal2-title");
                if (titleElement) {
                  titleElement.textContent = `Save Failed (${errorCountdown}s)`;
                }
                setTimeout(updateCountdown, 1000);
              }
            };
            setTimeout(updateCountdown, 1000);
          },
          didClose: () => {
            // Re-enable form interactions
            const formElement = document.getElementById("venue-form-container");
            if (formElement) {
              formElement.style.pointerEvents = "auto";
              formElement.style.opacity = "1";
            }
            resolve({ isConfirmed: true });
          },
        };

        setIsAlertOpen(true);
        Swal.fire(alertConfig as SweetAlertOptions).then((result) => {
          setIsAlertOpen(false);
          resolve(result);
        });
      });
    }
  };

  const renderLabel = (
    labelText: string,
    fieldId: string,
    isRequired: boolean
  ) => (
    <Label
      htmlFor={fieldId}
      className="text-sm font-medium text-gray-700 mb-1 block"
    >
      {labelText}
      {isRequired && <span className="text-red-500 ml-1">*</span>}
    </Label>
  );

  const renderInput = (
    id: string,
    value: string,
    placeholder: string,
    disabled = false
  ) => (
    <>
      <Input
        id={id}
        value={value}
        onChange={handleChange}
        onBlur={(e) => validateField(id, e.target.value)}
        placeholder={placeholder}
        disabled={disabled || isAlertOpen}
        className={`border-gray-300 focus:border-[#7942d1] focus:ring-[#7942d1] ${
          errors[id] ? "border-red-500" : ""
        }`}
      />
      {errors[id] && <p className="text-red-500 text-xs mt-1">{errors[id]}</p>}
    </>
  );

  return (
    <div className="p-6 sm:p-8 text-[var(--black)]">
      {mode === "edit" && (
        <div className="flex justify-center mb-6">
          <span className="p-2 rounded-full bg-[var(--purple-bg-shadow)]">
            {/* Commented out for now as mentioned in the original code */}
            <button
              className={`px-6 py-2 rounded-full cursor-pointer ${
                formData.geofencing_type === "2"
                  ? "bg-gradient-to-r from-[var(--purple-dark-1)] to-[var(--purple-dark-2)] text-[var(--white)]"
                  : "bg-purple-100 text-purple-700"
              }`}
              onClick={() => {
                setSelectedMode("polygon");
                handleSelectChange("2", "geofencing_type");
              }}
            >
              Polygon
            </button>
            <button
              className={`px-6 py-2 rounded-full cursor-pointer ${
                formData.geofencing_type === "1"
                  ? "bg-gradient-to-r from-[var(--purple-dark-1)] to-[var(--purple-dark-2)] text-white"
                  : "bg-purple-100 text-purple-700"
              }`}
              onClick={() => {
                setSelectedMode("radius");
                handleSelectChange("1", "geofencing_type");
              }}
            >
              Radius
            </button>
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div>
          {renderLabel("Venue Name", "venue_name", true)}
          {renderInput("venue_name", formData.venue_name, "Enter Venue Name")}
        </div>

        <div>
          {renderLabel("Venue Code", "venue_code", true)}
          {renderInput("venue_code", formData.venue_code, "Enter Venue Code")}
        </div>

        <div>
          {renderLabel("Venue Capacity", "venue_capacity", false)}
          {renderInput(
            "venue_capacity",
            formData.venue_capacity,
            "Enter Capacity"
          )}
        </div>

        {/* <div>
          {renderLabel("Venue Address", "venue_address", true)}
          {renderInput("venue_address", formData.venue_address, "Enter Venue Address")}
        </div> */}

        <div className="flex space-x-4">
          <div className="flex-1">
            {renderLabel("Latitude", "latitude", false)}
            <Input
              id="latitude"
              value={formData.coordinates.latitude?.toString() || ""}
              onChange={handleChange}
              onBlur={(e) => validateField("latitude", e.target.value)}
              placeholder="Enter Latitude"
              className={`border-gray-300 focus:border-[#7942d1] focus:ring-[#7942d1] ${
                errors.latitude ? "border-red-500" : ""
              }`}
            />
            {errors.latitude && (
              <p className="text-red-500 text-xs mt-1">{errors.latitude}</p>
            )}
          </div>
          <div className="flex-1">
            {renderLabel("Longitude", "longitude", false)}
            <Input
              id="longitude"
              value={formData.coordinates.longitude?.toString() || ""}
              onChange={handleChange}
              onBlur={(e) => validateField("longitude", e.target.value)}
              placeholder="Enter Longitude"
              className={`border-gray-300 focus:border-[#7942d1] focus:ring-[#7942d1] ${
                errors.longitude ? "border-red-500" : ""
              }`}
            />
            {errors.longitude && (
              <p className="text-red-500 text-xs mt-1">{errors.longitude}</p>
            )}
          </div>
        </div>

        <div>
          {renderLabel("Venue Address", "venue_address", true)}
          {renderInput(
            "venue_address",
            formData.venue_address,
            "Enter Venue Address"
          )}
        </div>

        <div>
          {renderLabel("Radius (in Mts.)", "venue_radius", false)}
          <Input
            id="venue_radius"
            value={formData.venue_radius}
            onChange={handleChange}
            onBlur={(e) => validateField("venue_radius", e.target.value)}
            placeholder="Enter Venue Radius"
            disabled={isAlertOpen || selectedMode === "polygon"} // Fixed: Use selectedMode instead of formData.geofencing_type
            className={`border-gray-300 focus:border-[#7942d1] focus:ring-[#7942d1] ${
              errors.venue_radius ? "border-red-500" : ""
            }`}
          />
          {errors.venue_radius && (
            <p className="text-red-500 text-xs mt-1">{errors.venue_radius}</p>
          )}
        </div>

        <div>
          {renderLabel("Select Cluster", "cluster_id", false)}
          <Select
            value={formData.cluster_id}
            onValueChange={(value) => handleSelectChange(value, "cluster_id")}
            disabled={preselectedClusterId ? true : false} // Disable if preselected
          >
            <SelectTrigger
              className={`w-full border-gray-300 ${
                errors.cluster_id ? "border-red-500" : ""
              } ${preselectedClusterId ? "bg-gray-100" : ""}`} // Add visual indication
            >
              <SelectValue placeholder="Select Cluster" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {clusterDropdown && clusterDropdown.length > 0 ? (
                clusterDropdown.map((cluster: ClusterType) => (
                  <SelectItem key={cluster.id} value={cluster.id.toString()}>
                    {cluster.cluster_name}
                  </SelectItem>
                ))
              ) : (
                <>
                  {clusterDropdownLoading
                    ? "Loading clusters..."
                    : "No clusters available"}
                </>
              )}
            </SelectContent>
          </Select>
          {errors.cluster_id && (
            <p className="text-red-500 text-xs mt-1">{errors.cluster_id}</p>
          )}
          {formData.cluster_id && selectedClusterName && (
            <p className="text-xs text-gray-500 mt-1">
              Selected: {selectedClusterName}
              {preselectedClusterId && (
                <span className="text-purple-600 ml-1">(Pre-selected)</span>
              )}
            </p>
          )}
        </div>

        <div>
          {renderLabel("Venue Supervisor", "supervisor_name", false)}
          {renderInput(
            "supervisor_name",
            formData.supervisor_name,
            "Enter Supervisor Name"
          )}
        </div>

        <div>
          {renderLabel("Supervisor Contact No", "supervisor_contact", false)}
          {renderInput(
            "supervisor_contact",
            formData.supervisor_contact,
            "Enter Supervisor Contact"
          )}
        </div>

        <div>
          {renderLabel("Supervisor Email", "supervisor_email", false)}
          {renderInput(
            "supervisor_email",
            formData.supervisor_email,
            "Enter Supervisor Email"
          )}
        </div>

        <div>
          {renderLabel("Upload Image", "upload-image", false)}
          <div
            className={`border ${
              errors.image ? "border-red-500" : "border-gray-300"
            } rounded-lg flex items-center`}
          >
            <Input
              id="upload-image"
              type="file"
              accept=".jpg,.jpeg,.png"
              className="hidden"
              onChange={handleFileChange}
            />
            <label
              htmlFor="upload-image"
              className="bg-gray-200 px-4 py-2 rounded-l-md cursor-pointer text-sm whitespace-nowrap"
            >
              Choose File
            </label>
            <div className="px-3 py-2 overflow-hidden whitespace-nowrap text-ellipsis max-w-full">
              <span className="text-sm text-gray-500 truncate block">
                {fileLabel}
              </span>
            </div>
          </div>
          {errors.image && (
            <p className="text-red-500 text-xs mt-1">{errors.image}</p>
          )}
          {/* Show current image preview in edit mode */}
          {mode === "edit" && existingImageUrl && !fileSelected && (
            <div className="mt-2">
              <p className="text-xs text-gray-600 mb-1">Current image:</p>
              <img
                src={existingImageUrl}
                alt="Current venue image"
                className="w-20 h-20 object-cover rounded border"
              />
            </div>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Allowed formats: JPG, JPEG, PNG
          </p>
        </div>

        <div>
          {renderLabel("Description", "venue_description", false)}
          <textarea
            id="venue_description"
            value={formData.venue_description}
            onChange={handleChange}
            onBlur={(e) => validateField("venue_description", e.target.value)}
            placeholder="Enter Description (max 100 words)"
            rows={4}
            className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#7942d1] ${
              errors.venue_description ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.venue_description && (
            <p className="text-red-500 text-xs mt-1">
              {errors.venue_description}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Word count:{" "}
            {formData.venue_description
              ? formData.venue_description.trim().split(/\s+/).length
              : 0}
            /100
          </p>
        </div>
      </div>

      <div className="flex justify-center mt-8">
        <Button
          onClick={handleSubmit}
          disabled={createLoading || updateLoading}
          className="w-full sm:w-auto bg-gradient-to-r from-[var(--purple-dark-1)] to-[var(--purple-dark-2)] py-3 px-8 rounded-md text-[var(--white)] cursor-pointer"
        >
          {createLoading || updateLoading
            ? "Saving..."
            : mode === "edit"
            ? "Update Venue"
            : "Save Venue"}
        </Button>
      </div>
    </div>
  );
};

export default VenueForm;
