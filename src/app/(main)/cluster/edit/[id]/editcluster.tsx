"use client";

import { useState, useEffect } from "react";
import { Button } from "../../../../../components/ui/button";
import { Input } from "../../../../../components/ui/input";
import { Textarea } from "../../../../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../../components/ui/select";
import { fetchClusters } from "../../../../../redux/reducer/cluster/action";
import { updateCluster } from "../../../../../redux/reducer/cluster/action";
import { AppDispatch, RootState } from "../../../../../redux/store";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import axiosInstance from "../../../../../api/axiosInstance";
import Swal from "sweetalert2";

interface EditClusterModalProps {
  editOpen: boolean;
  setEditOpen: (open: boolean) => void;
  clusterId: string | null;
  onSuccess?: () => void;
}

export function EditClusterModal({
  editOpen,
  setEditOpen,
  clusterId,
}: EditClusterModalProps) {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  // Get the loading state from Redux store
  const { updateLoading } = useSelector((state: RootState) => state.cluster);

  const [isLoading, setIsLoading] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [fileLabel, setFileLabel] = useState("No file chosen");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [clusterData, setClusterData] = useState({
    cluster_code: "",
    cluster_name: "",
    coordinates: {
      latitude: "",
      longitude: "",
    },
    geofencing_type: 1,
    cluster_radius: "",
    supervisor_id: "",
    supervisor_name: "",
    supervisor_contact: "",
    supervisor_email: "",
    cluster_description: "",
    image_url: "" as string | File,
    assigned_to: null,
  });

  // Validation rules
  const validators: { [key: string]: (val: string) => string | null } = {
    cluster_code: (val) => {
      if (!val.trim()) return "Cluster code is required";
      if (!/^[a-zA-Z0-9]+$/.test(val))
        return "Only letters and numbers allowed";
      return null;
    },
    cluster_name: (value: string) => {
      if (!value.trim()) {
        return "Cluster name is required";
      }
      if (value.trim().length > 50) {
        return "Cluster name must not exceed 50 characters";
      }
      return "";
    },
    "coordinates.longitude": (val) => {
      if (!val.trim()) return null; // Not required
      if (isNaN(Number(val))) return "Must be a valid number";
      return null;
    },
    cluster_radius: (val) => {
      if (!val.trim()) return null; // Not required
      if (isNaN(Number(val))) return "Must be a valid number";
      return null;
    },
    supervisor_name: (val) => null, // Not required
    supervisor_contact: (val) => {
      // Not required
      if (!val.trim()) return null;
      if (!/^\d{10,15}$/.test(val)) return "Contact must be 10-15 digits";
      return null;
    },
    supervisor_email: (val) => {
      if (!val.trim()) return null; // Not required
      if (val.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val))
        return "Invalid email format";
      return null;
    },
    // cluster_description: (val) => (!val.trim() ? "Description is required" : null),
  };

  // Validate image type
  const validateImageType = (file: File | null) => {
    if (!file) return null;
    const acceptedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!acceptedTypes.includes(file.type))
      return "Only JPG, JPEG, PNG formats are allowed";
    return null;
  };

  // Fetch cluster data when clusterId changes
  useEffect(() => {
    const fetchClusterData = async () => {
      if (clusterId && editOpen) {
        setIsLoading(true);
        try {
          const response = await axiosInstance.get(`/cluster/${clusterId}`);
          const data = response.data;
          const clusterData = data.data || data;

          setClusterData({
            cluster_code: clusterData.cluster_code || clusterData.id || "",
            cluster_name: clusterData.cluster_name || clusterData.name || "",
            coordinates: {
              latitude:
                clusterData.coordinates?.latitude ||
                clusterData.coordinateX ||
                "",
              longitude:
                clusterData.coordinates?.longitude ||
                clusterData.coordinateY ||
                "",
            },
            geofencing_type: clusterData.geofencing_type || "",
            cluster_radius:
              clusterData.cluster_radius || clusterData.radius || "",
            supervisor_id: clusterData.supervisor_id?.toString() || "",
            supervisor_name:
              clusterData.supervisor_name || clusterData.supervisor || "",
            supervisor_contact:
              clusterData.supervisor_contact || clusterData.contactNo || "",
            supervisor_email:
              clusterData.supervisor_email || clusterData.email || "",
            cluster_description:
              clusterData.cluster_description || clusterData.description || "",
            image_url: clusterData.image_url || "",
            assigned_to: clusterData.assigned_to || null,
          });

          if (clusterData.image_url) {
            setImagePreview(clusterData.image_url);
          }
        } catch (error) {
          console.error("Error fetching cluster data:", error);
          setErrors((prev) => ({
            ...prev,
            general: "Failed to load cluster data. Please try again.",
          }));
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchClusterData();
  }, [clusterId, editOpen]);

  const validateRequired = (value: string) => {
    return value.trim() ? null : "This field is required";
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");

      setClusterData((prev) => {
        const parentValue = prev[parent as keyof typeof prev];

        const updatedParent = {
          ...(typeof parentValue === "object" && parentValue !== null
            ? parentValue
            : {}),
          [child]: value,
        };

        return {
          ...prev,
          [parent]: updatedParent,
        };
      });

      // Validate nested fields
      const validatorKey = `${parent}.${child}`;
      const validator = validators[validatorKey];
      if (validator) {
        const error = validator(value);
        setErrors((prev) => ({ ...prev, [validatorKey]: error || "" }));
      }
    } else {
      setClusterData((prev) => ({ ...prev, [name]: value }));

      // Validate direct fields
      const validator = validators[name];
      if (validator) {
        const error = validator(value);
        setErrors((prev) => ({ ...prev, [name]: error || "" }));
      }
    }

    if (name === "cluster_name" && value.length > 50) {
      return; // Don't update if exceeds 50 characters
    }

    // Handle nested properties (like coordinates)
    if (name === "cluster_name" && value.length > 50) {
      return; // Don't update if exceeds 50 characters
    }

    // Handle nested properties (like coordinates)
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setClusterData((prev) => {
        const parentObj = prev[parent as keyof typeof prev];

        // Ensure parentObj is an object before spreading
        const updatedParent =
          typeof parentObj === "object" && parentObj !== null
            ? { ...parentObj, [child]: value }
            : { [child]: value };

        return {
          ...prev,
          [parent]: updatedParent,
        };
      });
    } else {
      setClusterData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSelectChange = (value: string, field: string) => {
    setClusterData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setFileLabel(file.name);
    setImagePreview(URL.createObjectURL(file));

    const error = validateImageType(file);
    setErrors((prev) => ({ ...prev, image: error || "" }));
  };

  const handleRemoveImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setImageFile(null);
    setImagePreview(null);
    setFileLabel("No file chosen");

    setClusterData((prev) => ({
      ...prev,
      image_url: "",
    }));

    setErrors((prev) => ({ ...prev, image: "" }));
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Validate all fields
    Object.entries(validators).forEach(([key, validator]) => {
      let value;

      if (key.includes(".")) {
        const [parent, child] = key.split(".");
        const parentObj = clusterData[parent as keyof typeof clusterData];
        value =
          parentObj && typeof parentObj === "object"
            ? parentObj[child as keyof typeof parentObj]
            : "";
      } else {
        value = clusterData[key as keyof typeof clusterData];
      }

      const error = validator(value?.toString() || "");
      if (error) {
        newErrors[key] = error;
      }
    });

    if (imageFile) {
      const imageError = validateImageType(imageFile);
      if (imageError) {
        newErrors.image = imageError;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      await Swal.fire({
        icon: "error",
        title: "Validation",
        text: "Please correct the errors in the form before submitting.",
        customClass: {
          container: "swal-container-class",
          popup: "swal-custom-popup",
        },
        backdrop: true,
        allowOutsideClick: false,
        allowEscapeKey: true,
      });
      return;
    }

    try {
      const formData = new FormData();

      // Required fields - always send
      formData.append("cluster_code", clusterData.cluster_code.trim());
      formData.append("cluster_name", clusterData.cluster_name.trim());

      // CHANGED: Always send coordinates, even if empty (as 0,0)
      const coordinates = {
        latitude: parseFloat(String(clusterData.coordinates.latitude || "0")),
        longitude: parseFloat(String(clusterData.coordinates.longitude || "0")),
      };
      formData.append("coordinates", JSON.stringify(coordinates));

      // Always send geofencing_type
      // formData.append("geofencing_type", clusterData.geofencing_type);

      // CHANGED: Send "null" string instead of empty string for cluster_radius
      formData.append(
        "cluster_radius",
        String(clusterData.cluster_radius || "").trim() || "null"
      );

      // CHANGED: Always send supervisor_id, even if null
      if (clusterData.supervisor_id) {
        formData.append("supervisor_id", String(clusterData.supervisor_id));
      } else {
        formData.append("supervisor_id", "null");
      }

      // CHANGED: Send "null" string for empty supervisor fields instead of empty strings
      formData.append(
        "supervisor_name",
        clusterData.supervisor_name.trim() || "null"
      );
      formData.append(
        "supervisor_contact",
        clusterData.supervisor_contact.trim() || "null"
      );
      formData.append(
        "supervisor_email",
        clusterData.supervisor_email.trim() || "null"
      );

      // CHANGED: Send "null" string for empty description instead of empty string
      formData.append(
        "cluster_description",
        clusterData.cluster_description.trim() || "null"
      );

      // Handle image upload - keep existing logic but send "null" for empty
      if (imageFile) {
        formData.append("image_url", imageFile, imageFile.name);
      } else if (
        imagePreview &&
        typeof clusterData.image_url === "string" &&
        clusterData.image_url.trim() !== ""
      ) {
        formData.append("image_url", clusterData.image_url);
      } else {
        // CHANGED: Send "null" instead of empty string
        formData.append("image_url", "null");
      }

      const id = parseInt(clusterId || "0", 10);

      Swal.fire({
        title: "Updating Cluster...",
        text: "Please wait while we update your cluster.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      try {
        const result = await updateCluster(dispatch, id, formData);

        Swal.close();

        if (result && !result.error) {
          Swal.fire({
            icon: "success",
            title: "Success!",
            text: "Cluster updated successfully",
            confirmButtonColor: "#7942d1",
          }).then(() => {
            setEditOpen(false);

            // 🔁 Hard reload the page to fetch updated cluster data
            window.location.reload();
          });
        } else {
          throw new Error(result?.message || "Failed to update cluster");
        }
      } catch (error: any) {
        console.error("Error in update response:", error);

        // Get detailed error message from API response if available
        let errorMessage = "Failed to update cluster. Please try again.";

        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }

        Swal.fire({
          icon: "error",
          title: "Update Failed",
          text: errorMessage,
          confirmButtonColor: "#7942d1",
        });

        setErrors((prev) => ({
          ...prev,
          general: errorMessage,
        }));
      }
    } catch (error: unknown) {
      console.error("Error updating cluster:", error);

      let errorMessage = "Failed to update cluster. Please try again.";

      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as any).response?.data?.message === "string"
      ) {
        errorMessage = (error as any).response.data.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setErrors((prev) => ({
        ...prev,
        general: errorMessage,
      }));

      Swal.fire({
        icon: "error",
        title: "Error!",
        text: errorMessage,
        confirmButtonColor: "#7942d1",
      });
    }
  };

  useEffect(() => {
    if (editOpen) {
      // Refresh clusters when modal is opened
      dispatch(fetchClusters());

      // Optional: show a success message
      // Swal.fire({
      //   icon: "success",
      //   title: "Refreshed!",
      //   text: "Clusters list has been updated.",
      //   timer: 1500,
      //   showConfirmButton: false
      // });
    }
  }, [editOpen, dispatch]);

  if (!editOpen) return null;

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <p className="text-black">Loading cluster data...</p>
        </div>
      </div>
    );
  }

  // Helper for rendering label with required asterisk
  const LabelWithAsterisk = ({
    htmlFor,
    children,
  }: {
    htmlFor: string;
    children: React.ReactNode;
  }) => (
    <label htmlFor={htmlFor} className="block font-medium text-black">
      {children} <span className="text-red-500">*</span>
    </label>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-center text-black text-2xl font-semibold flex-1">
              Edit Cluster
            </h1>
            <button
              onClick={() => setEditOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>

          {errors.general && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <LabelWithAsterisk htmlFor="cluster_code">
                  Cluster Code
                </LabelWithAsterisk>
                <Input
                  id="cluster_code"
                  name="cluster_code"
                  value={clusterData.cluster_code}
                  onChange={handleInputChange}
                  className={`w-full mt-1 ${
                    errors.cluster_code ? "border-red-500" : "border-gray-200"
                  }`}
                />
                {errors.cluster_code && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.cluster_code}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <LabelWithAsterisk htmlFor="cluster_name">
                  Cluster Name
                </LabelWithAsterisk>
                <Input
                  id="cluster_name"
                  name="cluster_name"
                  value={clusterData.cluster_name}
                  onChange={handleInputChange}
                  maxLength={50}
                  className={`w-full mt-1 ${
                    errors.cluster_name ? "border-red-500" : "border-gray-200"
                  }`}
                />
                <div className="flex justify-between items-center">
                  {errors.cluster_name && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.cluster_name}
                    </p>
                  )}
                  <p className="text-gray-500 text-xs mt-1 ml-auto">
                    {clusterData.cluster_name?.length || 0}/50 characters
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="coordinates"
                  className="block font-medium text-black"
                >
                  Coordinates
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Input
                      name="coordinates.latitude"
                      value={clusterData.coordinates.latitude}
                      onChange={handleInputChange}
                      placeholder="Latitude"
                      className={`w-full mt-1 ${
                        errors["coordinates.latitude"]
                          ? "border-red-500"
                          : "border-gray-200"
                      }`}
                    />
                    {errors["coordinates.latitude"] && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors["coordinates.latitude"]}
                      </p>
                    )}
                  </div>
                  <div>
                    <Input
                      name="coordinates.longitude"
                      value={clusterData.coordinates.longitude}
                      onChange={handleInputChange}
                      placeholder="Longitude"
                      className={`w-full mt-1 ${
                        errors["coordinates.longitude"]
                          ? "border-red-500"
                          : "border-gray-200"
                      }`}
                    />
                    {errors["coordinates.longitude"] && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors["coordinates.longitude"]}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="cluster_radius"
                  className="block font-medium text-black"
                >
                  Cluster Radius
                </label>
                <Input
                  id="cluster_radius"
                  name="cluster_radius"
                  value={clusterData.cluster_radius}
                  onChange={handleInputChange}
                  className={`w-full mt-1 ${
                    errors.cluster_radius ? "border-red-500" : "border-gray-200"
                  }`}
                />
                {errors.cluster_radius && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.cluster_radius}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="supervisor_name"
                  className="block font-medium text-black"
                >
                  Cluster Supervisor
                </label>{" "}
                {/* FIXED: Added closing label tag */}
                <Input
                  id="supervisor_name"
                  name="supervisor_name"
                  value={clusterData.supervisor_name}
                  onChange={handleInputChange}
                  className={`w-full mt-1 ${
                    errors.supervisor_name
                      ? "border-red-500"
                      : "border-gray-200"
                  }`}
                />
                {errors.supervisor_name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.supervisor_name}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="supervisor_contact"
                  className="block font-medium text-black"
                >
                  Supervisor Contact No
                </label>{" "}
                {/* FIXED: Added closing label tag */}
                <Input
                  id="supervisor_contact"
                  name="supervisor_contact"
                  value={clusterData.supervisor_contact}
                  onChange={handleInputChange}
                  className={`w-full mt-1 ${
                    errors.supervisor_contact
                      ? "border-red-500"
                      : "border-gray-200"
                  }`}
                />
                {errors.supervisor_contact && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.supervisor_contact}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="supervisor_email"
                  className="block font-medium text-black"
                >
                  Supervisor Email
                </label>{" "}
                {/* FIXED: Added closing label tag */}
                <Input
                  id="supervisor_email"
                  name="supervisor_email"
                  type="email"
                  value={clusterData.supervisor_email}
                  onChange={handleInputChange}
                  className={`w-full mt-1 ${
                    errors.supervisor_email
                      ? "border-red-500"
                      : "border-gray-200"
                  }`}
                />
                {errors.supervisor_email && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.supervisor_email}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="upload-image"
                  className="block font-medium text-black"
                >
                  Upload Image
                </label>
                <div
                  className={`border ${
                    errors.image ? "border-red-500" : "border-gray-200"
                  } mt-2 rounded-lg p-3 flex flex-wrap items-center gap-4`}
                >
                  {imagePreview && (
                    <div className="mb-3 relative w-full">
                      <div className="relative h-24 w-full">
                        <Image
                          src={imagePreview}
                          alt="Cluster image"
                          className="object-cover rounded"
                          fill
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute -top-2 -right-2 bg-white rounded-full p-1"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                  <Input
                    id="upload-image"
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    className="hidden"
                    onChange={handleImageUpload}
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

              <div className="col-span-1 md:col-span-2 space-y-1">
                <label
                  htmlFor="cluster_description"
                  className="block font-medium text-black"
                >
                  Description
                </label>
                <Textarea
                  id="cluster_description"
                  name="cluster_description"
                  value={clusterData.cluster_description}
                  onChange={handleInputChange}
                  className={`w-full mt-1 ${
                    errors.cluster_description
                      ? "border-red-500"
                      : "border-gray-200"
                  }`}
                  rows={4}
                />
                {errors.cluster_description && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.cluster_description}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              <Button
                type="submit"
                disabled={updateLoading}
                className="bg-[linear-gradient(to_right,#7942d1,#2a1647)] text-white px-8 py-2 rounded-md hover:opacity-90"
              >
                {updateLoading ? "Saving..." : "Save Cluster"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function EditClusterPage({
  params,
}: {
  params: { id: string };
}) {
  const [editOpen, setEditOpen] = useState(true);
  const router = useRouter();

  const handleClose = () => {
    setEditOpen(false);
    router.push("/clusters");
  };

  return (
    <EditClusterModal
      editOpen={editOpen}
      setEditOpen={handleClose}
      clusterId={params.id}
    />
  );
}
