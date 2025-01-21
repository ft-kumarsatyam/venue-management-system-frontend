import React, { useState, useEffect } from "react";
import { Button } from "../../../../../components/ui/button";
import { Input } from "../../../../../components/ui/input";
import { Label } from "../../../../../components/ui/label";
import { useDispatch } from "react-redux";
import { createZone, fetchZones } from "../../../../../redux/reducer/zones/action";
import { AppDispatch } from "../../../../../redux/store";

interface ConfigureZonesFormProps {
  venueId?: string | number; // Made optional since it might not be provided in some cases
  onSave?: () => void;
  onCancel?: () => void;
  setShowFacility?: React.Dispatch<React.SetStateAction<boolean>>; // Added the new prop
}

interface FormDataType {
  zone_code: string;
  zone_name: string;
  zone_capacity: string;
  coordinates: {
    latitude: string;
    longitude: string;
  };
  zone_radius: string;
  supervisor_name: string;
  supervisor_email: string;
  supervisor_contact: string;
  image_url: File | null;
  geofencing_type: string;
}

const ConfigureZonesForm = ({
  venueId = "", // Default value for optional prop
  onSave,
  onCancel,
  setShowFacility,
}: ConfigureZonesFormProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileSelected, setFileSelected] = useState<File | null>(null);
  const [fileLabel, setFileLabel] = useState("No file chosen");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<FormDataType>({
    zone_code: "",
    zone_name: "",
    zone_capacity: "",
    coordinates: {
      latitude: "",
      longitude: "",
    },
    zone_radius: "",
    supervisor_name: "",
    supervisor_email: "",
    supervisor_contact: "",
    image_url: null,
    geofencing_type: "1",
  });

  // Validation functions
  const validateAlphabetic = (value: string) => {
    if (!value.trim()) return "This field is required";
    if (!/^[A-Za-z\s]+$/.test(value))
      return "Only alphabetic characters are allowed";
    return null;
  };

  const validateAlphanumeric = (value: string) => {
    if (!value.trim()) return "This field is required";
    if (!/^[A-Za-z0-9]+$/.test(value))
      return "Only alphanumeric characters are allowed";
    return null;
  };

  const validateEmail = (value: string) => {
    if (!value.trim()) return "This field is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
      return "Invalid email format";
    return null;
  };

  const validateNonMandatoryNumeric = (value: string) => {
    if (!value.trim()) return null; // Non-mandatory field
    if (!/^\d*\.?\d*$/.test(value)) return "Only numeric values are allowed";
    return null;
  };

  const validateNonMandatoryCoordinate = (value: string) => {
    if (!value.trim()) return null; // Non-mandatory field
    if (!/^-?\d*\.?\d*$/.test(value)) return "Invalid coordinate format";
    return null;
  };

  const validateImageType = (file: File | null) => {
    if (!file) return null;
    const acceptedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!acceptedTypes.includes(file.type))
      return "Only JPG, JPEG, PNG formats are allowed";
    return null;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;

    // Handle coordinates separately
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

    // Clear the error for this field when the user starts typing again
    if (errors[id]) {
      setErrors((prev) => ({ ...prev, [id]: "" }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileSelected(file);
      setFileLabel(file.name);
      setFormData((prev) => ({ ...prev, image_url: file }));

      // Validate file type
      const fileError = validateImageType(file);
      if (fileError) {
        setErrors((prev) => ({ ...prev, image: fileError }));
      } else {
        setErrors((prev) => ({ ...prev, image: "" }));
      }
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate required fields
    newErrors.zone_name = validateAlphabetic(formData.zone_name) || "";
    newErrors.zone_code = validateAlphanumeric(formData.zone_code) || "";
    newErrors.supervisor_name =
      validateAlphabetic(formData.supervisor_name) || "";
    newErrors.supervisor_email = validateEmail(formData.supervisor_email) || "";

    // Validate non-mandatory fields only if they have values
    if (formData.zone_capacity) {
      newErrors.zone_capacity =
        validateNonMandatoryNumeric(formData.zone_capacity) || "";
    }
    if (formData.coordinates.latitude) {
      newErrors.latitude =
        validateNonMandatoryCoordinate(formData.coordinates.latitude) || "";
    }
    if (formData.coordinates.longitude) {
      newErrors.longitude =
        validateNonMandatoryCoordinate(formData.coordinates.longitude) || "";
    }
    if (formData.zone_radius) {
      newErrors.zone_radius =
        validateNonMandatoryNumeric(formData.zone_radius) || "";
    }
    if (formData.supervisor_contact) {
      newErrors.supervisor_contact =
        validateNonMandatoryNumeric(formData.supervisor_contact) || "";
    }
    if (formData.image_url instanceof File) {
      newErrors.image = validateImageType(formData.image_url) || "";
    }

    // Filter out empty error messages
    const filteredErrors = Object.fromEntries(
      Object.entries(newErrors).filter(([_, value]) => value !== "")
    );

    setErrors(filteredErrors);
    return Object.keys(filteredErrors).length === 0;
  };

  const handleSubmit = async () => {
    // Validate the form before submission
    if (!validateForm()) {
      console.error("Form validation failed");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create FormData object for file upload
      const formDataObj = new FormData();

      // Add all form fields to FormData
      formDataObj.append("zone_code", formData.zone_code);
      formDataObj.append("zone_name", formData.zone_name);
      formDataObj.append("zone_capacity", formData.zone_capacity);
      formDataObj.append("zone_radius", formData.zone_radius);
      formDataObj.append("supervisor_name", formData.supervisor_name);
      formDataObj.append("supervisor_contact", formData.supervisor_contact);
      formDataObj.append("supervisor_email", formData.supervisor_email);
      formDataObj.append("geofencing_type", formData.geofencing_type);

      // Add venue ID to associate with this zone
      if (venueId) {
        formDataObj.append("venue_ids", JSON.stringify([venueId]));
      }

      // Add coordinates as stringified JSON
      const coordinates = {
        latitude: formData.coordinates.latitude
          ? parseFloat(formData.coordinates.latitude)
          : null,
        longitude: formData.coordinates.longitude
          ? parseFloat(formData.coordinates.longitude)
          : null,
      };
      formDataObj.append("coordinates", JSON.stringify(coordinates));

      // Handle image file properly
      if (formData.image_url instanceof File) {
        formDataObj.append("image_url", formData.image_url);
      }
      console.log(venueId, "venueID");
      // Dispatch action to create zone

      console.log(233)
      // await dispatch(createZone(formDataObj));

      console.log(234)
      // Call appropriate callbacks after successful submission
      if (onSave) {
        onSave();
      }
      console.log(239)

      await dispatch(fetchZones(venueId));

      // Show the facility form after zone form is successfully submitted
      if (setShowFacility) {
        setShowFacility(true);
      }
    } catch (error) {
      console.error("Error saving zone:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to render field label with optional asterisk for required fields
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

  // Helper to render input field with error message
  const renderInput = (
    id: string,
    value: string,
    placeholder: string,
    disabled: boolean = false
  ) => (
    <>
      <Input
        id={id}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`border-gray-300 focus:border-[#7942d1] focus:ring-[#7942d1] ${
          errors[id] ? "border-red-500" : ""
        }`}
      />
      {errors[id] && <p className="text-red-500 text-xs mt-1">{errors[id]}</p>}
    </>
  );

  return (
    <div className="p-6 sm:p-8 text-[var(--black)]">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Zone Name - Mandatory, Alphabetic */}
        <div>
          {renderLabel("Zone Name", "zone_name", true)}
          {renderInput("zone_name", formData.zone_name, "Enter Zone Name")}
        </div>

        {/* Zone Code - Mandatory, Alphanumeric */}
        <div>
          {renderLabel("Zone Code", "zone_code", true)}
          {renderInput("zone_code", formData.zone_code, "Enter Zone Code")}
        </div>

        {/* Capacity - Non-Mandatory */}
        <div>
          {renderLabel("Zone Capacity", "zone_capacity", false)}
          {renderInput(
            "zone_capacity",
            formData.zone_capacity,
            "Enter Capacity"
          )}
        </div>

        {/* Latitude and Longitude - Non-Mandatory */}
        <div className="flex space-x-4">
          <div className="flex-1">
            {renderLabel("Latitude", "latitude", false)}
            <Input
              id="latitude"
              value={formData.coordinates.latitude}
              onChange={handleChange}
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
              value={formData.coordinates.longitude}
              onChange={handleChange}
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

        {/* Radius - Non-Mandatory */}
        <div>
          {renderLabel("Radius (in Mts.)", "zone_radius", false)}
          <Input
            id="zone_radius"
            value={formData.zone_radius}
            onChange={handleChange}
            placeholder="Enter Zone Radius"
            className={`border-gray-300 focus:border-[#7942d1] focus:ring-[#7942d1] ${
              errors.zone_radius ? "border-red-500" : ""
            }`}
          />
          {errors.zone_radius && (
            <p className="text-red-500 text-xs mt-1">{errors.zone_radius}</p>
          )}
        </div>

        {/* Zone Supervisor - Mandatory */}
        <div>
          {renderLabel("Zone Supervisor", "supervisor_name", true)}
          {renderInput(
            "supervisor_name",
            formData.supervisor_name,
            "Enter Supervisor Name"
          )}
        </div>

        {/* Supervisor Contact - Non-Mandatory */}
        <div>
          {renderLabel("Supervisor Contact No", "supervisor_contact", false)}
          {renderInput(
            "supervisor_contact",
            formData.supervisor_contact,
            "Enter Supervisor Contact"
          )}
        </div>

        {/* Supervisor Email - Mandatory */}
        <div>
          {renderLabel("Supervisor Email", "supervisor_email", true)}
          {renderInput(
            "supervisor_email",
            formData.supervisor_email,
            "Enter Supervisor Email"
          )}
        </div>

        {/* Image Upload */}
        <div>
          {renderLabel("Upload Image", "upload-image", false)}
          <div
            className={`border ${
              errors.image ? "border-red-500" : "border-gray-200"
            } mt-2 rounded-lg flex flex-wrap items-center gap-4`}
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
              className="bg-gray-200 px-4 py-2 rounded-md cursor-pointer text-sm"
            >
              Choose File
            </label>
            <span className="text-sm text-gray-500">{fileLabel}</span>
          </div>
          {errors.image && (
            <p className="text-red-500 text-xs mt-1">{errors.image}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Allowed formats: JPG, JPEG, PNG
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center mt-8 space-x-4">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="bg-gradient-to-r from-[var(--purple-dark-1)] to-[var(--purple-dark-2)] py-2 px-8 rounded-md text-white"
        >
          {isSubmitting ? "Saving..." : "Save Zone"}
        </Button>
        {onCancel && (
          <Button
            onClick={onCancel}
            variant="outline"
            className="border-gray-300 text-gray-700 py-2 px-8 rounded-md"
          >
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
};

export default ConfigureZonesForm;
