"use client";

import type React from "react";

import { useState, useEffect, type Dispatch, type SetStateAction } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import { AlertCircle } from "lucide-react";
import axiosInstance from "../../api/axiosInstance";
import Swal from "sweetalert2";

export interface Zone {
  id?: number | string;
  zone_code: string;
  zone_name: string;
  zone_capacity: number;
  supervisor_name: string;
  supervisor_email: string;
  supervisor_contact: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  zone_radius?: string;
  geofencing_type: number;
  image_url: File | string | null;
  common_zone_status?: string;
}

interface ZoneFormData {
  zone_code: string;
  zone_name: string;
  zone_capacity: number;
  supervisor_name: string;
  supervisor_email: string;
  supervisor_contact: string;
  latitude: string;
  longitude: string;
  zone_radius: string;
  geofencing_type: number;
  image_url: File | string | null;
}

interface ZoneFormErrors {
  zone_code?: string;
  zone_name?: string;
  zone_capacity?: string;
  supervisor_name?: string;
  supervisor_email?: string;
  supervisor_contact?: string;
  coordinates?: string;
  zone_radius?: string;
  image_url?: string | File | null;
}

interface EditZoneFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  zoneName?: string;
  venueId?: string | number;
  facilityId?: number;
  isEditing?: boolean;
  onUpdateSuccess?: () => void;
  zone?: Zone;
  onSave?: (formData: FormData) => Promise<void>;
  isEdit?: boolean;
  setIsEditModalOpen?: Dispatch<SetStateAction<boolean>>;
  initialData?: { ids: (string | number)[] };
}

export default function EditZoneFormModal({
  isOpen,
  onClose,
  zoneName,
  venueId,
  facilityId,
  onUpdateSuccess,
  isEditing,
  zone,
  onSave,
  isEdit,
  setIsEditModalOpen,
  initialData,
}: EditZoneFormModalProps) {
  const [formData, setFormData] = useState<ZoneFormData>({
    zone_code: "",
    zone_name: "",
    zone_capacity: 1,
    supervisor_name: "",
    supervisor_email: "",
    supervisor_contact: "",
    latitude: "",
    longitude: "",
    zone_radius: "",
    geofencing_type: 1,
    image_url: null,
  });

  const [errors, setErrors] = useState<ZoneFormErrors>({});
  const [loading, setLoading] = useState(false);
  const [geofencingType, setGeofencingType] = useState<string>("Radius");
  const [currentZone, setCurrentZone] = useState<Zone | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("No file chosen");
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Alert dialog state for backend responses
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && zone) {
      setCurrentZone(zone);
      populateFormWithZone(zone);
    } else if (isOpen && zoneName && venueId && isEditing) {
      fetchZoneData();
    }
  }, [isOpen, zoneName, venueId, isEditing, zone]);

  const populateFormWithZone = (zoneData: Zone) => {
    setFormData({
      zone_code: zoneData.zone_code || "",
      zone_name: zoneData.zone_name || "",
      zone_capacity: zoneData.zone_capacity,
      supervisor_name: zoneData.supervisor_name || "",
      supervisor_email: zoneData.supervisor_email || "",
      supervisor_contact: zoneData.supervisor_contact || "",
      latitude: zoneData.coordinates?.latitude?.toString() || "",
      longitude: zoneData.coordinates?.longitude?.toString() || "",
      zone_radius: zoneData.zone_radius || "",
      geofencing_type: zoneData.geofencing_type === 2 ? 2 : 1,
      image_url: zoneData.image_url ?? null,
    });

    setGeofencingType(zoneData.geofencing_type === 2 ? "Polygon" : "Radius");

    if (zoneData.image_url instanceof File) {
      setSelectedFile(zoneData.image_url);
      setFileName(zoneData.image_url.name);
      setImagePreview(URL.createObjectURL(zoneData.image_url));
    } else if (typeof zoneData.image_url === "string" && zoneData.image_url) {
      const urlParts = zoneData.image_url.split("/");
      setFileName(urlParts[urlParts.length - 1] || "Current image");
      setImagePreview(zoneData.image_url);
    } else {
      setImagePreview(null);
    }
  };

  const fetchZoneData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/venues/${venueId}`);
      const data = await response.json();

      if (data.success && data.data) {
        const zoneData = data.data.zones.find(
          (zone: any) => zone.zone_name === zoneName
        );

        if (zoneData) {
          setCurrentZone(zoneData);
          populateFormWithZone(zoneData);
        }
      }
    } catch (error) {
      console.error("Error fetching zone data:", error);
      showAlert("Error", "Failed to fetch zone data. Please try again.", false);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof ZoneFormErrors]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof ZoneFormErrors];
        return newErrors;
      });
    }

    if (name === "zone_radius") {
      const numericValue = parseInt(value, 10);

      if (isNaN(numericValue) || numericValue < 0 || numericValue > 1000000) {
        setErrors((prev) => ({
          ...prev,
          zone_radius: "Radius must be a number between 0 and 1,000,000",
        }));
      } else {
        setErrors((prev) => ({ ...prev, zone_radius: "" }));
      }

      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      return;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const fileType = file.type;

      if (!fileType.match(/^image\/(jpeg|jpg|png)$/)) {
        setErrors((prev) => ({
          ...prev,
          image_url: "Only JPG, JPEG, and PNG files are allowed",
        }));
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);

      setSelectedFile(file);
      setFileName(file.name);
      setFormData((prev) => ({ ...prev, image_url: file }));

      if (errors.image_url) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.image_url;
          return newErrors;
        });
      }
    }
  };

  const validateForm = () => {
    const newErrors: ZoneFormErrors = {};

    // Zone Code validation
    if (!formData.zone_code?.trim()) {
      newErrors.zone_code = "Zone Code is required";
    } else if (!/^[A-Za-z0-9]+$/.test(formData.zone_code)) {
      newErrors.zone_code = "Only alphanumeric characters are allowed";
    }

    // Zone Name validation
    if (!formData.zone_name?.trim()) {
      newErrors.zone_name = "Zone Name is required";
    } else if (!/^[A-Za-z0-9\s\-_]+$/.test(formData.zone_name)) {
      newErrors.zone_name =
        "Only alphanumeric characters, spaces, hyphens and underscores are allowed";
    }

    // ✅ Supervisor Name – optional but if filled, validate length
    if (formData.supervisor_name.trim()) {
      if (formData.supervisor_name.trim().length < 2) {
        newErrors.supervisor_name =
          "Supervisor Name must be at least 2 characters";
      }
    }

    // ✅ Supervisor Email – optional but if filled, validate format
    if (formData.supervisor_email.trim()) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.supervisor_email)) {
        newErrors.supervisor_email = "Please enter a valid email";
      }
    }

    // Supervisor Contact – if provided, validate format and length
    if (formData.supervisor_contact) {
      if (!/^\d+$/.test(formData.supervisor_contact)) {
        newErrors.supervisor_contact = "Only numeric values are allowed";
      } else if (
        formData.supervisor_contact.length < 8 ||
        formData.supervisor_contact.length > 15
      ) {
        newErrors.supervisor_contact =
          "Contact number should be between 8 and 15 digits";
      }
    }

    // Zone Capacity
    if (!formData.zone_capacity || formData.zone_capacity < 1) {
      newErrors.zone_capacity = "Zone capacity must be at least 1";
    } else if (formData.zone_capacity > 10000) {
      newErrors.zone_capacity = "Zone capacity cannot exceed 10,000";
    }

    // Coordinates validation
    if (formData.latitude && !/^-?\d*\.?\d*$/.test(formData.latitude)) {
      newErrors.coordinates = "Invalid latitude format";
    } else if (
      formData.latitude &&
      (Number.parseFloat(formData.latitude) < -90 ||
        Number.parseFloat(formData.latitude) > 90)
    ) {
      newErrors.coordinates = "Latitude must be between -90 and 90";
    }

    if (formData.longitude && !/^-?\d*\.?\d*$/.test(formData.longitude)) {
      newErrors.coordinates = "Invalid longitude format";
    } else if (
      formData.longitude &&
      (Number.parseFloat(formData.longitude) < -180 ||
        Number.parseFloat(formData.longitude) > 180)
    ) {
      newErrors.coordinates = "Longitude must be between -180 and 180";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Function to show alert dialog with messages from backend
  const showAlert = (title: string, message: string, success: boolean) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setIsSuccess(success);
    setAlertOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      Swal.fire({
        title: "Validation Error",
        text: "Please check the form for errors",
        icon: "error",
        confirmButtonColor: "#8A2BE2",
        timer: 3000,
      });
      return;
    }

    setLoading(true);

    try {
      const apiFormData = new FormData();

      // Trim all string values before submitting
      apiFormData.append("zone_code", formData.zone_code.trim());
      apiFormData.append("zone_name", formData.zone_name.trim());
      apiFormData.append("zone_capacity", formData.zone_capacity.toString());
      apiFormData.append("supervisor_name", formData.supervisor_name.trim());
      apiFormData.append("supervisor_email", formData.supervisor_email.trim());
      apiFormData.append(
        "supervisor_contact",
        formData.supervisor_contact ? formData.supervisor_contact.trim() : ""
      );

      // Properly format coordinates as a JSON string
      if (formData.latitude && formData.longitude) {
        const coordsObj = {
          latitude: Number.parseFloat(formData.latitude.trim()),
          longitude: Number.parseFloat(formData.longitude.trim()),
        };
        apiFormData.append("coordinates", JSON.stringify(coordsObj));
      }

      // Handle venue IDs properly for both create and update operations
      const venueIdsArray = initialData?.ids || (venueId ? [venueId] : []);
      if (venueIdsArray.length > 0) {
        apiFormData.append("venue_ids", JSON.stringify(venueIdsArray));
      }

      const hasFacilityId = facilityId !== undefined && facilityId !== null;
      if (hasFacilityId) {
        apiFormData.append("facility_id", facilityId.toString());
      }

      const commonZoneStatus = hasFacilityId ? "0" : "1";
      apiFormData.append("common_zone_status", commonZoneStatus);

      apiFormData.append(
        "geofencing_type",
        formData.geofencing_type.toString()
      );

      // Fix: Handle zone_radius properly - convert to string and then trim
      if (geofencingType === "Radius" && formData.zone_radius) {
        const radiusValue = String(formData.zone_radius).trim();
        apiFormData.append("zone_radius", radiusValue);
      }

      // Handle image file upload
      if (selectedFile) {
        apiFormData.append("image_url", selectedFile);
      }

      if (onSave) {
        await onSave(apiFormData);
        onClose(); // Ensure modal closes after save callback
      } else {
        const response = await axiosInstance.post(`/zone`, apiFormData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Accept: "application/json",
          },
          timeout: 60000, // Increased timeout for file uploads
        });

        if (response.data && response.data.success) {
          // Check if this is a new zone creation (not editing)
          const isCreatingNewZone = !isEditing && !isEdit && !zone;

          Swal.fire({
            title: "Success!",
            text: isCreatingNewZone
              ? "Zone has been created successfully!"
              : "Zone has been updated successfully!",
            icon: "success",
            confirmButtonColor: "#8A2BE2",
            timer: 2000,
            timerProgressBar: true,
          }).then(() => {
            // Close modal first
            onClose();

            // Reset form after successful submission
            setFormData({
              zone_code: "",
              zone_name: "",
              zone_capacity: 1,
              supervisor_name: "",
              supervisor_email: "",
              supervisor_contact: "",
              latitude: "",
              longitude: "",
              zone_radius: "",
              geofencing_type: 1,
              image_url: null,
            });
            setSelectedFile(null);
            setFileName("No file chosen");
            setImagePreview(null);
            setErrors({});

            // Call onUpdateSuccess if provided
            if (onUpdateSuccess) {
              onUpdateSuccess();
            }

            // Only reload page for new zone creation
            if (isCreatingNewZone) {
              setTimeout(() => {
                window.location.reload();
              }, 100);
            }
          });
        } else {
          const errorMessage =
            typeof response.data?.error === "string"
              ? response.data.error
              : "Failed to update zone. Please try again.";

          Swal.fire({
            title: "Error!",
            text: errorMessage,
            icon: "error",
            confirmButtonColor: "#8A2BE2",
            confirmButtonText: "Try Again",
          });
        }
      }
    } catch (error: any) {
      console.error("Error updating zone:", error);

      // Handle various error formats from the backend
      let errorMessage = "An unexpected error occurred. Please try again.";

      if (error.response?.data?.error) {
        errorMessage =
          typeof error.response.data.error === "string"
            ? error.response.data.error
            : JSON.stringify(error.response.data.error);
      } else if (error.message) {
        errorMessage = error.message;
      }

      Swal.fire({
        title: "Error!",
        text: errorMessage,
        icon: "error",
        confirmButtonColor: "#8A2BE2",
        confirmButtonText: "Try Again",
      });
    } finally {
      setLoading(false);
    }
  };

  // Clean up object URLs when component unmounts or when preview changes
  useEffect(() => {
    return () => {
      if (imagePreview && !imagePreview.startsWith("http")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Reset form when modal is closed or opened without a zone
  useEffect(() => {
    if (!isOpen) {
      // Reset form data when modal is closed
      setFormData({
        zone_code: "",
        zone_name: "",
        zone_capacity: 1,
        supervisor_name: "",
        supervisor_email: "",
        supervisor_contact: "",
        latitude: "",
        longitude: "",
        zone_radius: "",
        geofencing_type: 1,
        image_url: null,
      });
      setSelectedFile(null);
      setFileName("No file chosen");
      setImagePreview(null);
      setErrors({});
    } else if (isOpen && !zone) {
      // Reset form data when creating a new zone
      setFormData({
        zone_code: "",
        zone_name: "",
        zone_capacity: 1,
        supervisor_name: "",
        supervisor_email: "",
        supervisor_contact: "",
        latitude: "",
        longitude: "",
        zone_radius: "",
        geofencing_type: 1,
        image_url: null,
      });
      setSelectedFile(null);
      setFileName("No file chosen");
      setImagePreview(null);
      setErrors({});
    }
  }, [isOpen, zone]);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-[95%] sm:max-w-4xl p-6 rounded-lg bg-white overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
              {isEditing || isEdit
                ? `Edit Zone: ${zone?.zone_name || zoneName}`
                : "Create Zone"}
            </DialogTitle>
          </DialogHeader>

          {loading && (
            <div className="text-center py-4">Loading zone data...</div>
          )}

          {!loading && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="w-full border border-gray-200 h-[200px] bg-gray-200">
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

              <div className="flex justify-center">
                <span className="p-2 rounded-full bg-purple-100">
                  <button
                    type="button"
                    className={`px-6 py-2 rounded-full cursor-pointer ${
                      geofencingType === "Polygon"
                        ? "bg-gradient-to-r from-purple-600 to-purple-800 text-white"
                        : "bg-purple-100 text-purple-700"
                    }`}
                    onClick={() => {
                      setGeofencingType("Polygon");
                      setFormData((prev) => ({ ...prev, geofencing_type: 2 }));
                    }}
                  >
                    Polygon
                  </button>
                  <button
                    type="button"
                    className={`px-6 py-2 rounded-full cursor-pointer ${
                      geofencingType === "Radius"
                        ? "bg-gradient-to-r from-purple-600 to-purple-800 text-white"
                        : "bg-purple-100 text-purple-700"
                    }`}
                    onClick={() => {
                      setGeofencingType("Radius");
                      setFormData((prev) => ({ ...prev, geofencing_type: 1 }));
                    }}
                  >
                    Radius
                  </button>
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label
                    htmlFor="zone_code"
                    className="text-base text-gray-800"
                  >
                    Zone Code <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="zone_code"
                    name="zone_code"
                    value={formData.zone_code}
                    onChange={handleChange}
                    placeholder="Enter Zone Code"
                    className={`mt-1 border-gray-300 h-11 ${
                      errors.zone_code ? "border-red-500" : ""
                    }`}
                  />
                  {errors.zone_code && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />{" "}
                      {errors.zone_code}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="zone_name"
                    className="text-base text-gray-800"
                  >
                    Zone Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="zone_name"
                    name="zone_name"
                    value={formData.zone_name}
                    onChange={handleChange}
                    placeholder="Enter Zone Name"
                    className={`mt-1 border-gray-300 h-11 ${
                      errors.zone_name ? "border-red-500" : ""
                    }`}
                  />
                  {errors.zone_name && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />{" "}
                      {errors.zone_name}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="zone_capacity"
                    className="text-base text-gray-800"
                  >
                    Zone Capacity <span className="text-red-500"></span>
                  </Label>
                  <Input
                    id="zone_capacity"
                    name="zone_capacity"
                    type="number"
                    min="1"
                    value={formData.zone_capacity}
                    onChange={handleChange}
                    placeholder="Enter Zone Capacity"
                    className={`mt-1 border-gray-300 h-11 ${
                      errors.zone_capacity ? "border-red-500" : ""
                    }`}
                  />
                  {errors.zone_capacity && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />{" "}
                      {errors.zone_capacity}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-base text-gray-800">Coordinates</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <Input
                      placeholder="Latitude"
                      name="latitude"
                      value={formData.latitude}
                      onChange={handleChange}
                      className={`border-gray-300 h-11 ${
                        errors.coordinates ? "border-red-500" : ""
                      }`}
                    />
                    <Input
                      placeholder="Longitude"
                      name="longitude"
                      value={formData.longitude}
                      onChange={handleChange}
                      className={`border-gray-300 h-11 ${
                        errors.coordinates ? "border-red-500" : ""
                      }`}
                    />
                  </div>
                  {errors.coordinates && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />{" "}
                      {errors.coordinates}
                    </p>
                  )}
                </div>

                {geofencingType === "Radius" && (
                  <div>
                    <Label
                      htmlFor="zone_radius"
                      className="text-base text-gray-800"
                    >
                      Radius (in Mts.)
                    </Label>
                    <Input
                      type="number"
                      id="zone_radius"
                      name="zone_radius"
                      placeholder="Enter Radius"
                      value={formData.zone_radius}
                      onChange={handleChange}
                      min={0}
                      max={1000000}
                      className={`mt-1 border-gray-300 h-11 ${
                        errors.zone_radius ? "border-red-500" : ""
                      }`}
                    />
                    {errors.zone_radius && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />{" "}
                        {errors.zone_radius}
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <Label
                    htmlFor="supervisor_name"
                    className="text-base text-gray-800"
                  >
                    Supervisor Name <span className="text-red-500"></span>
                  </Label>
                  <Input
                    id="supervisor_name"
                    name="supervisor_name"
                    value={formData.supervisor_name}
                    onChange={handleChange}
                    placeholder="Enter Supervisor Name"
                    className={`mt-1 border-gray-300 h-11 ${
                      errors.supervisor_name ? "border-red-500" : ""
                    }`}
                  />
                  {errors.supervisor_name && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />{" "}
                      {errors.supervisor_name}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label
                    htmlFor="supervisor_email"
                    className="text-base text-gray-800"
                  >
                    Supervisor Email <span className="text-red-500"></span>
                  </Label>
                  <Input
                    id="supervisor_email"
                    name="supervisor_email"
                    type="email"
                    value={formData.supervisor_email}
                    onChange={handleChange}
                    placeholder="Enter Supervisor Email"
                    className={`mt-1 border-gray-300 h-11 ${
                      errors.supervisor_email ? "border-red-500" : ""
                    }`}
                  />
                  {errors.supervisor_email && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />{" "}
                      {errors.supervisor_email}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="supervisor_contact"
                    className="text-base text-gray-800"
                  >
                    Supervisor Contact
                  </Label>
                  <Input
                    id="supervisor_contact"
                    name="supervisor_contact"
                    value={formData.supervisor_contact}
                    onChange={handleChange}
                    placeholder="Enter Supervisor Contact"
                    className={`mt-1 border-gray-300 h-11 ${
                      errors.supervisor_contact ? "border-red-500" : ""
                    }`}
                  />
                  {errors.supervisor_contact && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />{" "}
                      {errors.supervisor_contact}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="upload-image"
                    className="text-base text-gray-800"
                  >
                    Upload Image
                  </Label>
                  <div className="border border-gray-300 rounded-lg flex items-center gap-4 p-2 mt-1">
                    <Input
                      id="upload-image"
                      name="image_url"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <label
                      htmlFor="upload-image"
                      className="bg-gray-200 px-4 py-2 rounded-md cursor-pointer text-sm"
                    >
                      Choose File
                    </label>
                    <span className="text-sm text-gray-500 truncate max-w-[150px]">
                      {fileName}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Allowed formats: JPG, JPEG, PNG
                  </p>
                  {errors.image_url && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {typeof errors.image_url === "string"
                        ? errors.image_url
                        : "Invalid file"}
                    </p>
                  )}

                  {/* Image Preview */}
                  {imagePreview && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 mb-1">
                        Image Preview:
                      </p>
                      <div className="relative w-full h-32 bg-gray-100 rounded-md overflow-hidden">
                        <img
                          src={imagePreview || "/placeholder.svg"}
                          alt="Zone image preview"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-center mt-6">
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-600 to-purple-800 py-2 px-8 rounded-md text-white font-medium"
                >
                  {loading
                    ? isEditing || isEdit
                      ? "Updating..."
                      : "Creating..."
                    : isEditing || isEdit
                    ? "Update Zone"
                    : "Create Zone"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent className="max-w-md z-50">
          <AlertDialogHeader>
            <AlertDialogTitle
              className={isSuccess ? "text-green-600" : "text-red-600"}
            >
              {alertTitle}
            </AlertDialogTitle>
            <AlertDialogDescription>{alertMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button onClick={() => setAlertOpen(false)}>OK</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
