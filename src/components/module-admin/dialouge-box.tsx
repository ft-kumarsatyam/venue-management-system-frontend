"use client"

import { useState, useRef } from "react"
import { X } from 'lucide-react'
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"

interface CreateClusterDialogProps {
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
  onSave?: (data: ClusterFormData) => void
  trigger?: React.ReactNode
}

interface ClusterFormData {
  cluster_code: string;
  cluster_name: string;
  cluster_description: string;
  coordinates: {
    latitude: string;
    longitude: string;
  };
  geofencing_type: number;
  cluster_radius: string;
  supervisor_id: string;
  supervisor_name: string;
  supervisor_contact: string;
  supervisor_email: string;
  assigned_to: number | null; // Explicitly typing to accept both number and null
  image_url: string;
}

export function CreateClusterDialog({
  isOpen,
  onOpenChange,
  onSave,
  trigger
}: CreateClusterDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<ClusterFormData>({
    cluster_code: "",
    cluster_name: "",
    cluster_description: "",
    coordinates: {
      latitude: "",
      longitude: "",
    },
    geofencing_type: 1, // Default to circle (1)
    cluster_radius: "",
    supervisor_id: "",
    supervisor_name: "",
    supervisor_contact: "",
    supervisor_email: "",
    assigned_to: null, // As per API spec
    image_url: "",
  });

  // State for file upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [useManualUrl, setUseManualUrl] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for form errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Validation rules based on requirements
  const validators = {
    cluster_code: (val: string) => {
      if (!val) return "Cluster code is required";
      if (!/^[a-zA-Z0-9]+$/.test(val))
        return "Only alphanumeric characters allowed";
      return "";
    },
    cluster_name: (val: string) =>
      !val
        ? "Cluster name is required"
        : /^[a-zA-Z\s]+$/.test(val)
        ? ""
        : "Only alphabets allowed",
    latitude: (val: string) => {
      if (!val) return ""; // Not mandatory (NM)
      if (isNaN(Number(val))) return "Must be a valid number";
      if (Number(val) < -90 || Number(val) > 90)
        return "Latitude must be between -90 and 90";
      return "";
    },
    longitude: (val: string) => {
      if (!val) return ""; // Not mandatory (NM)
      if (isNaN(Number(val))) return "Must be a valid number";
      if (Number(val) < -180 || Number(val) > 180)
        return "Longitude must be between -180 and 180";
      return "";
    },
    cluster_radius: (val: string) => {
      if (!val) return ""; // Not mandatory (NM)
      if (isNaN(Number(val))) return "Must be a valid number";
      if (Number(val) <= 0) return "Radius must be greater than 0";
      return "";
    },
    supervisor_id: (val: string) => (!val ? "Supervisor ID is required" : ""),
    supervisor_name: (val: string) =>
      !val ? "Supervisor name is required" : "",
    supervisor_contact: (val: string) =>
      !val
        ? "Contact is required"
        : /^\d{10,15}$/.test(val)
        ? ""
        : "Invalid phone number format",
    supervisor_email: (val: string) =>
      !val
        ? "Email is required"
        : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
        ? ""
        : "Invalid email format",
    cluster_description: (val: string) => {
      if (!val) return "Description is required";
      // Count words (approximation by splitting on whitespace)
      const wordCount = val.trim().split(/\s+/).length;
      return wordCount > 100 ? "Description must be 100 words or less" : "";
    },
    image_url: (val: string) => {
      // Image is not mandatory (NM)
      return "";
    },
  };

  // Handle input changes with validation
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;

    // Handle coordinate fields separately
    if (id === "latitude" || id === "longitude") {
      setFormData({
        ...formData,
        coordinates: {
          ...formData.coordinates,
          [id]: value,
        },
      });

      // Validate coordinates
      const error = validators[id](value);
      setErrors((prev) => ({ ...prev, [id]: error }));
    } else {
      setFormData({
        ...formData,
        [id]: value,
      });

      // Validate other fields
      if (validators[id as keyof typeof validators]) {
        const error = validators[id as keyof typeof validators](value);
        setErrors((prev) => ({ ...prev, [id]: error }));
      }
    }
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!validTypes.includes(file.type)) {
        setUploadError("Please select a valid image file (JPG, JPEG, or PNG)");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setUploadError("File size should be less than 5MB");
        return;
      }

      setSelectedFile(file);
      setUploadError("");

      // Clear any previous image URL error
      setErrors((prev) => ({ ...prev, image_url: "" }));
    }
  };

  // Handle file upload
  const uploadImage = async () => {
    if (!selectedFile) {
      return null;
    }

    setIsUploading(true);
    setUploadError("");

    try {
      // Create form data for the file upload
      const formData = new FormData();
      formData.append("file", selectedFile);

      // Replace with your actual upload API endpoint
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Image upload failed");
      }

      const data = await response.json();
      setIsUploading(false);

      // Return the image URL provided by your server
      return data.url;
    } catch (error) {
      console.error("Error uploading imageabcd:", error);
      setUploadError("Failed to upload image. Please try again.");
      setIsUploading(false);
      return null;
    }
  };

  // Handle select changes for geofencing type
  const handleGeofencingTypeChange = (value: string) => {
    setFormData({
      ...formData,
      geofencing_type: parseInt(value),
    });
  };

  // Handle select changes for assigned_to
  const handleAssignedToChange = (value: string) => {
    setFormData({
      ...formData,
      assigned_to: value === "null" ? null : parseInt(value),
    });
  };

  const toggleUrlInputMethod = () => {
    setUseManualUrl(!useManualUrl);
    // Clear the related fields when toggling
    if (useManualUrl) {
      setSelectedFile(null);
    } else {
      setFormData({
        ...formData,
        image_url: "",
      });
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Validate mandatory fields
    newErrors.cluster_code = validators.cluster_code(formData.cluster_code);
    newErrors.cluster_name = validators.cluster_name(formData.cluster_name);
    newErrors.supervisor_id = validators.supervisor_id(formData.supervisor_id);
    newErrors.supervisor_name = validators.supervisor_name(
      formData.supervisor_name
    );
    newErrors.supervisor_contact = validators.supervisor_contact(
      formData.supervisor_contact
    );
    newErrors.supervisor_email = validators.supervisor_email(
      formData.supervisor_email
    );
    newErrors.cluster_description = validators.cluster_description(
      formData.cluster_description
    );

    // Validate non-mandatory fields only if they have values
    if (formData.coordinates.latitude) {
      newErrors.latitude = validators.latitude(formData.coordinates.latitude);
    }

    if (formData.coordinates.longitude) {
      newErrors.longitude = validators.longitude(
        formData.coordinates.longitude
      );
    }

    if (formData.cluster_radius) {
      newErrors.cluster_radius = validators.cluster_radius(
        formData.cluster_radius
      );
    }

    // Filter out empty error messages
    const filteredErrors: { [key: string]: string } = {};
    Object.entries(newErrors).forEach(([key, value]) => {
      if (value) {
        filteredErrors[key] = value;
      }
    });

    setErrors(filteredErrors);
    return Object.keys(filteredErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
console.log(321,"dialog")
    if (!validateForm()) {
      console.log("Validation failed", errors);
      return;
    }

    setIsSubmitting(true);

    let imageUrl = formData.image_url;

    if (selectedFile) {
      const uploadedUrl = await uploadImage();
      if (!uploadedUrl && formData.image_url === "") {
        // Image upload failed, but image is not mandatory so we can continue
        console.log(
          "Image upload failed, but continuing as it's not mandatory"
        );
      } else if (uploadedUrl) {
        imageUrl = uploadedUrl;
      }
    }

    // Prepare data for API
    const clusterData = {
      cluster_code: formData.cluster_code,
      cluster_name: formData.cluster_name,
      cluster_description: formData.cluster_description,
      coordinates:
        formData.coordinates.latitude && formData.coordinates.longitude
          ? {
              latitude: parseFloat(formData.coordinates.latitude),
              longitude: parseFloat(formData.coordinates.longitude),
            }
          : null,
      geofencing_type: formData.geofencing_type,
      cluster_radius: formData.cluster_radius
        ? parseFloat(formData.cluster_radius)
        : null,
      supervisor_id: parseInt(formData.supervisor_id),
      supervisor_name: formData.supervisor_name,
      supervisor_contact: formData.supervisor_contact,
      supervisor_email: formData.supervisor_email,
      assigned_to: formData.assigned_to,
      image_url: imageUrl || null,
    };

    if (onSave) {
      onSave(clusterData as any);
    }
    
    setIsSubmitting(false);
    if (onOpenChange) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-0 flex justify-between items-center">
          <DialogTitle className="text-xl font-semibold">Create Cluster</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={() => onOpenChange?.(false)}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cluster_code">Cluster Code*</Label>
                <Input
                  id="cluster_code"
                  value={formData.cluster_code}
                  onChange={handleChange}
                  placeholder="Enter Cluster Code (alphanumeric)"
                  className={errors.cluster_code ? "border-red-500" : ""}
                />
                {errors.cluster_code && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.cluster_code}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label>Coordinates (optional)</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    id="latitude"
                    value={formData.coordinates.latitude}
                    onChange={handleChange}
                    placeholder="Latitude"
                    className={errors.latitude ? "border-red-500" : ""}
                  />
                  <Input
                    id="longitude"
                    value={formData.coordinates.longitude}
                    onChange={handleChange}
                    placeholder="Longitude"
                    className={errors.longitude ? "border-red-500" : ""}
                  />
                </div>
                {(errors.latitude || errors.longitude) && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.latitude || errors.longitude}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="supervisor_id">Supervisor ID*</Label>
                <Input
                  id="supervisor_id"
                  value={formData.supervisor_id}
                  onChange={handleChange}
                  placeholder="Enter Supervisor ID"
                  className={errors.supervisor_id ? "border-red-500" : ""}
                />
                {errors.supervisor_id && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.supervisor_id}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="supervisor_name">Cluster Supervisor*</Label>
                <Input
                  id="supervisor_name"
                  value={formData.supervisor_name}
                  onChange={handleChange}
                  placeholder="Enter Supervisor Name"
                  className={errors.supervisor_name ? "border-red-500" : ""}
                />
                {errors.supervisor_name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.supervisor_name}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="supervisor_email">Supervisor Email*</Label>
                <Input
                  id="supervisor_email"
                  value={formData.supervisor_email}
                  onChange={handleChange}
                  placeholder="Enter Supervisor Email"
                  className={errors.supervisor_email ? "border-red-500" : ""}
                />
                {errors.supervisor_email && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.supervisor_email}
                  </p>
                )}
              </div>
            </div>
            
            {/* Right Column */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cluster_name">Cluster Name*</Label>
                <Input
                  id="cluster_name"
                  value={formData.cluster_name}
                  onChange={handleChange}
                  placeholder="Enter Cluster Name (alphabets only)"
                  className={errors.cluster_name ? "border-red-500" : ""}
                />
                {errors.cluster_name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.cluster_name}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="geofencing_type">Geofencing Type</Label>
                <Select
                  onValueChange={handleGeofencingTypeChange}
                  value={formData.geofencing_type.toString()}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Geofencing Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="1">Circle</SelectItem>
                    <SelectItem value="2">Polygon</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cluster_radius">Cluster Radius (in meters, optional)</Label>
                <Input
                  id="cluster_radius"
                  value={formData.cluster_radius}
                  onChange={handleChange}
                  placeholder="Enter Radius in meters"
                  className={errors.cluster_radius ? "border-red-500" : ""}
                />
                {errors.cluster_radius && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.cluster_radius}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="supervisor_contact">Supervisor Contact No*</Label>
                <Input
                  id="supervisor_contact"
                  value={formData.supervisor_contact}
                  onChange={handleChange}
                  placeholder="Enter Contact Number"
                  className={errors.supervisor_contact ? "border-red-500" : ""}
                />
                {errors.supervisor_contact && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.supervisor_contact}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label>Assigned To (optional)</Label>
                <Select
                  onValueChange={handleAssignedToChange}
                  value={formData.assigned_to !== null ? formData.assigned_to.toString() : "null"}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select User" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="null">None</SelectItem>
                    <SelectItem value="1">User 1</SelectItem>
                    <SelectItem value="2">User 2</SelectItem>
                    <SelectItem value="3">User 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Cluster Image - Full Width */}
          <div className="space-y-2 mt-4">
            <div className="flex justify-between items-center">
              <Label htmlFor="cluster_image">Cluster Image (optional)</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={toggleUrlInputMethod}
                className="text-xs"
              >
                {useManualUrl ? "Upload Image File" : "Enter Image URL"}
              </Button>
            </div>

            {useManualUrl ? (
              <div>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={handleChange}
                  placeholder="Enter Image URL (https://example.com/image.jpg)"
                  className={errors.image_url ? "border-red-500" : ""}
                />
              </div>
            ) : (
              <div>
                <Input
                  type="file"
                  id="cluster_image"
                  ref={fileInputRef}
                  accept=".jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className={uploadError ? "border-red-500" : ""}
                />
                {selectedFile && (
                  <p className="text-sm text-green-600 mt-1">
                    Selected: {selectedFile.name}
                  </p>
                )}
              </div>
            )}

            {(errors.image_url || uploadError) && (
              <p className="text-red-500 text-sm mt-1">
                {errors.image_url || uploadError}
              </p>
            )}
            <p className="text-xs text-gray-500">
              Supported formats: JPEG, JPG, PNG. Max size: 5MB
            </p>
          </div>

          {/* Description - Full Width */}
          <div className="space-y-2 mt-4">
            <Label htmlFor="cluster_description">Description* (max 100 words)</Label>
            <Textarea
              id="cluster_description"
              value={formData.cluster_description}
              onChange={handleChange}
              placeholder="Enter description (maximum 100 words)"
              className={`resize-none ${errors.cluster_description ? "border-red-500" : ""}`}
            />
            {errors.cluster_description && (
              <p className="text-red-500 text-sm mt-1">
                {errors.cluster_description}
              </p>
            )}
            <p className="text-xs text-gray-500">
              Word count: {formData.cluster_description ? formData.cluster_description.trim().split(/\s+/).length : 0}/100
            </p>
          </div>
          
          <div className="mt-8 flex justify-center">
            <Button 
              type="submit" 
              disabled={isUploading || isSubmitting}
              className="bg-primary hover:bg-primary/90 text-white px-8"
            >
              {isSubmitting ? "Creating Cluster..." : "Save Cluster"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}