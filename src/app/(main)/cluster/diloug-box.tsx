"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Textarea } from "../../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Label } from "../../../components/ui/label";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  createCluster,
  updateCluster,
  fetchClusters,
} from "../../../redux/reducer/cluster/action";
import { AppDispatch, RootState } from "../../../redux/store";
import { AlertCircle, Loader2 } from "lucide-react";
import Swal, { SweetAlertOptions } from "sweetalert2";
import {
  CREATE_CLUSTER_SUCCESS,
  UPDATE_CLUSTER_SUCCESS,
} from "@/redux/reducer/cluster/actionTypes";

interface ClusterModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isEditing?: boolean;
  editData?: any;
  onSuccess?: () => void;
}

export function ClusterModal({
  open,
  setOpen,
  isEditing = false,
  editData = null,
}: ClusterModalProps) {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { venues } = useSelector(
    (state: RootState) => state.venue || { venues: [] }
  );

  const initialFormState = {
    cluster_code: "",
    cluster_name: "",
    cluster_description: "",
    coordinates: {
      latitude: "",
      longitude: "",
    },
    geofencing_type: 1,
    cluster_radius: "",
    cluster_capacity: "",
    supervisor_id: null,
    supervisor_name: "",
    supervisor_contact: "",
    supervisor_email: "",
    image_url: "",
    venue: "",
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (isEditing && editData) {
      setFormData({
        cluster_code: editData.cluster_code || "",
        cluster_name: editData.cluster_name || "",
        cluster_description: editData.cluster_description || "",
        coordinates: {
          latitude: editData.latitude ? editData.latitude.toString() : "",
          longitude: editData.longitude ? editData.longitude.toString() : "",
        },
        geofencing_type: editData.geofencing_type || 1,
        cluster_radius: editData.cluster_radius
          ? editData.cluster_radius.toString()
          : "",
        cluster_capacity: editData.cluster_capacity
          ? editData.cluster_capacity.toString()
          : "",
        supervisor_id: editData.supervisor_id || null,
        supervisor_name: editData.supervisor_name || "",
        supervisor_contact: editData.supervisor_contact || "",
        supervisor_email: editData.supervisor_email || "",
        image_url: editData.image_url || "",
        venue: editData.venue || "",
      });

      if (editData.image_url) {
        setUseManualUrl(true);
      }
    } else {
      // Reset form when opening in create mode
      setFormData(initialFormState);
      setUseManualUrl(false);
      setSelectedFile(null);
    }
  }, [isEditing, editData, open]);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [useManualUrl, setUseManualUrl] = useState(false);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validators = {
    cluster_code: (val: string) => {
      const trimmedVal = val.trim();
      if (!trimmedVal) return "Cluster code is required";
      if (!/^[a-zA-Z0-9]+$/.test(trimmedVal))
        return "Only alphanumeric characters allowed";
      return "";
    },
    cluster_name: (val: string) => {
      const trimmedVal = val.trim();
      if (!trimmedVal) return "Cluster name is required";
      if (!/^[a-zA-Z\s]+$/.test(trimmedVal))
        return "Cluster name can only contain alphabets and spaces";
      if (!/[a-zA-Z]/.test(trimmedVal))
        return "Cluster name must include at least one alphabet character";
      return "";
    },
    latitude: (val: string) => {
      if (!val.trim()) return "";
      if (isNaN(Number(val))) return "Must be a valid number";
      if (Number(val) < -90 || Number(val) > 90)
        return "Latitude must be between -90 and 90";
      return "";
    },
    longitude: (val: string) => {
      if (!val.trim()) return "";
      if (isNaN(Number(val))) return "Must be a valid number";
      if (Number(val) < -180 || Number(val) > 180)
        return "Longitude must be between -180 and 180";
      return "";
    },
    cluster_radius: (val: string) => {
      if (!val.trim()) return "";
      if (isNaN(Number(val))) return "Must be a valid number";
      if (Number(val) <= 10000000)
        return "Radius should be less than 10000000mts ";
      return "";
    },
    cluster_capacity: (val: string) => {
      if (!val.trim()) return "";
      if (isNaN(Number(val))) return "Must be a valid number";
      if (Number(val) <= 0) return "Capacity must be greater than 0";
      return "";
    },
    supervisor_name: (val: string) => {
      const trimmedVal = val.trim();
      if (!trimmedVal) return "";
      if (!/^[a-zA-Z\s]+$/.test(trimmedVal))
        return "Supervisor name can only contain alphabets and spaces";
      return "";
    },
    supervisor_contact: (val: string) => {
      const trimmedVal = val.trim();
      if (!trimmedVal) return "";
      if (!/^\d{10,15}$/.test(trimmedVal))
        return "Invalid phone number format (10 digits only)";
      return "";
    },
    supervisor_email: (val: string) => {
      const trimmedVal = val.trim();
      if (!trimmedVal) return "";
      // More strict email validation
      if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(trimmedVal))
        return "Invalid email format";
      return "";
    },
    cluster_description: (val: string) => {
      const trimmedVal = val.trim();
      // if (!trimmedVal) return "";
      if (trimmedVal.length < 10)
        return "Description must be between 10-100 characters long";
      const wordCount = trimmedVal.split(/\s+/).length;
      return wordCount > 100 ? "Description must be 100 words or less" : "";
    },
    image_url: (val: string) => {
      return "";
    },
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;

    if (id === "latitude" || id === "longitude") {
      setFormData({
        ...formData,
        coordinates: {
          ...formData.coordinates,
          [id]: value,
        },
      });

      const error = validators[id](value);
      setErrors((prev) => ({ ...prev, [id]: error }));
    } else {
      setFormData({
        ...formData,
        [id]: value,
      });

      if (validators[id as keyof typeof validators]) {
        const error = validators[id as keyof typeof validators](value);
        setErrors((prev) => ({ ...prev, [id]: error }));
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!validTypes.includes(file.type)) {
        setUploadError("Please select a valid image file (JPG, JPEG, or PNG)");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setUploadError("File size should be less than 5MB");
        return;
      }

      setSelectedFile(file);
      setUploadError("");

      setErrors((prev) => ({ ...prev, image_url: "" }));
    }
  };

  const handleGeofencingTypeChange = (value: string) => {
    setFormData({
      ...formData,
      geofencing_type: parseInt(value),
    });
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // === Required Fields: ONLY cluster_code and cluster_name ===
    const trimmedClusterCode = formData.cluster_code.trim();
    if (!trimmedClusterCode) {
      newErrors.cluster_code = "Cluster code is required.";
    } else if (!/^[a-zA-Z0-9]+$/.test(trimmedClusterCode)) {
      newErrors.cluster_code = "Only alphanumeric characters allowed.";
    }

    const trimmedClusterName = formData.cluster_name.trim();
    if (!trimmedClusterName) {
      newErrors.cluster_name = "Cluster name is required.";
    } else if (trimmedClusterName.length > 50) {
      // ADD THIS LINE
      newErrors.cluster_name = "Cluster name cannot exceed 50 characters.";
    } else if (!/[a-zA-Z]/.test(trimmedClusterName)) {
      newErrors.cluster_name =
        "Cluster name must contain at least one alphabet character.";
    } else if (!/^[a-zA-Z\s]+$/.test(trimmedClusterName)) {
      newErrors.cluster_name =
        "Cluster name can contain only alphabets and spaces.";
    }

    const trimmedRadius = formData.cluster_radius.trim();
    if (trimmedRadius) {
      const radius = Number(trimmedRadius);
      if (isNaN(radius)) {
        newErrors.cluster_radius = "Cluster radius must be a valid number.";
      } else if (radius <= 0) {
        newErrors.cluster_radius = "Cluster radius must be a positive number.";
      } else if (radius > 1000000) {
        newErrors.cluster_radius =
          "Cluster radius cannot exceed 1,000,000 meters.";
      }
    }

    const trimmedSupervisorName = formData.supervisor_name.trim();
    if (trimmedSupervisorName && !/^[a-zA-Z\s]+$/.test(trimmedSupervisorName)) {
      newErrors.supervisor_name =
        "Supervisor name can contain only alphabets and spaces.";
    }

    const trimmedContact = formData.supervisor_contact.trim();
    if (trimmedContact && !/^\d{10}$/.test(trimmedContact)) {
      newErrors.supervisor_contact =
        "Invalid phone number format (10 digits only).";
    }

    const trimmedEmail = formData.supervisor_email.trim();
    if (
      trimmedEmail &&
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(trimmedEmail)
    ) {
      newErrors.supervisor_email = "Invalid email format.";
    }

    const trimmedDescription = formData.cluster_description.trim();
    if (trimmedDescription) {
      if (trimmedDescription.length < 10) {
        newErrors.cluster_description =
          "Description must be at least 10 characters long.";
      } else {
        const wordCount = trimmedDescription.split(/\s+/).length;
        if (wordCount > 100) {
          newErrors.cluster_description =
            "Description must be 100 words or less.";
        }
      }
    }

    const trimmedLat = formData.coordinates.latitude.trim();
    if (trimmedLat) {
      if (isNaN(Number(trimmedLat))) {
        newErrors.latitude = "Latitude must be a valid number.";
      } else if (Number(trimmedLat) < -90 || Number(trimmedLat) > 90) {
        newErrors.latitude = "Latitude must be between -90 and 90.";
      }
    }

    const trimmedLng = formData.coordinates.longitude.trim();
    if (trimmedLng) {
      if (isNaN(Number(trimmedLng))) {
        newErrors.longitude = "Longitude must be a valid number.";
      } else if (Number(trimmedLng) < -180 || Number(trimmedLng) > 180) {
        newErrors.longitude = "Longitude must be between -180 and 180.";
      }
    }

    // const trimmedCapacity = formData.cluster_capacity.trim();
    // if (trimmedCapacity) {
    //   const capacity = Number(trimmedCapacity);
    //   if (isNaN(capacity)) {
    //     newErrors.cluster_capacity = "Cluster capacity must be a valid number.";
    //   } else if (capacity <= 0) {
    //     newErrors.cluster_capacity =
    //       "Cluster capacity must be a positive number.";
    //   }
    // }

    // Image field treated as optional
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isAlertOpen) return;

    if (!validateForm()) {
      const errorFields = Object.keys(errors).filter((key) => errors[key]);
      const errorMessage = errorFields.length
        ? `Please correct the following fields: ${errorFields.join(", ")}`
        : "Please fill all required fields correctly.";

      let countdown = 3;

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
            const formElement = document.getElementById(
              "cluster-form-container"
            );
            if (formElement) {
              formElement.style.pointerEvents = "none";
              formElement.style.opacity = "0.7";
            }

            const swalPopup = document.querySelector(
              ".swal2-popup"
            ) as HTMLElement;
            if (swalPopup) swalPopup.style.zIndex = "99999";

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
            const formElement = document.getElementById(
              "cluster-form-container"
            );
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

    setIsSubmitting(true);

    try {
      const apiFormData = new FormData();
      const clusterData = {
        cluster_code: formData.cluster_code.trim(),
        cluster_name: formData.cluster_name.trim(),
        cluster_description: formData.cluster_description.trim() || "",
        supervisor_name: formData.supervisor_name.trim() || "",
        supervisor_contact: formData.supervisor_contact.trim() || "",
        supervisor_email: formData.supervisor_email.trim() || "",
        geofencing_type: formData.geofencing_type,
        cluster_radius: formData.cluster_radius.trim()
          ? parseFloat(formData.cluster_radius.trim())
          : "",
      };

      Object.entries(clusterData).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
          apiFormData.append(key, String(value));
        }
      });

      if (
        formData.coordinates.latitude.trim() &&
        formData.coordinates.longitude.trim()
      ) {
        const coordinates = {
          latitude: parseFloat(formData.coordinates.latitude.trim()),
          longitude: parseFloat(formData.coordinates.longitude.trim()),
        };
        apiFormData.append("coordinates", JSON.stringify(coordinates));
      }

      if (useManualUrl && formData.image_url.trim()) {
        apiFormData.append("image_url", formData.image_url.trim());
      } else if (selectedFile) {
        apiFormData.append("image_url", selectedFile);
      }

      let actionResult;
      if (isEditing && editData?.id) {
        actionResult = await dispatch(
          updateCluster(dispatch, editData.id, apiFormData)
        );
      } else {
        actionResult = await dispatch(createCluster(apiFormData));
      }

      // Check if the action was successful by looking at the action type
      const isSuccess =
        actionResult.type === CREATE_CLUSTER_SUCCESS ||
        actionResult.type === UPDATE_CLUSTER_SUCCESS;

      if (isSuccess) {
        let successCountdown = 3;

        await new Promise((resolve) => {
          const alertConfig = {
            icon: "success",
            title: `Cluster Saved`,
            text: `Cluster "${formData.cluster_name.trim()}" saved successfully.`,
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
              const formElement = document.getElementById(
                "cluster-form-container"
              );
              if (formElement) {
                formElement.style.pointerEvents = "none";
                formElement.style.opacity = "0.7";
              }

              const swalPopup = document.querySelector(
                ".swal2-popup"
              ) as HTMLElement;
              if (swalPopup) swalPopup.style.zIndex = "99999";

              const updateCountdown = () => {
                successCountdown--;
                if (successCountdown > 0) {
                  const titleElement = document.querySelector(".swal2-title");
                  if (titleElement) {
                    titleElement.textContent = `Cluster Saved (${successCountdown}s)`;
                  }
                  setTimeout(updateCountdown, 1000);
                }
              };
              setTimeout(updateCountdown, 1000);
            },
            didClose: () => {
              const formElement = document.getElementById(
                "cluster-form-container"
              );
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

        // Close modal/form
        setOpen(false);

        // Reset form state
        setFormData(initialFormState);
        setSelectedFile(null);
        setUseManualUrl(false);

        // REFRESH CLUSTERS DATA AND PAGE
        await dispatch(fetchClusters());

        // Force a hard refresh if needed
        if (typeof window !== "undefined") {
          window.location.reload();
        }
      } else {
        // Handle failure case - get error message from action payload
        const errorMessage =
          actionResult.payload?.message || "Operation failed";
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error("Cluster submission error:", error);

      let errorMessage = "Something went wrong while saving the cluster.";
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      let errorCountdown = 4;

      await new Promise((resolve) => {
        const alertConfig = {
          icon: "error",
          title: `Cluster Save Failed!`,
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
            const formElement = document.getElementById(
              "cluster-form-container"
            );
            if (formElement) {
              formElement.style.pointerEvents = "none";
              formElement.style.opacity = "0.7";
            }

            const swalPopup = document.querySelector(
              ".swal2-popup"
            ) as HTMLElement;
            if (swalPopup) swalPopup.style.zIndex = "99999";

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
            const formElement = document.getElementById(
              "cluster-form-container"
            );
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleUrlInputMethod = () => {
    setUseManualUrl(!useManualUrl);
    if (useManualUrl) {
      setSelectedFile(null);
    } else {
      setFormData({
        ...formData,
        image_url: "",
      });
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(openState) => {
        // Prevent modal from closing if we're submitting
        if (isSubmitting) return;

        // Reset form when closing
        if (!openState) {
          setFormData(initialFormState);
          setErrors({});
          setSelectedFile(null);
          setUploadError("");
        }

        setOpen(openState);
      }}
    >
      <DialogContent className="w-full max-w-[90%] sm:max-w-4xl p-6 rounded-xl text-black bg-[var(--white)] overflow-y-auto max-h-[90vh] scrollbar-none">
        <DialogHeader>
          <DialogTitle className="text-center text-black font-semibold">
            {isEditing ? "Edit Cluster" : "Create Cluster"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            {/* Cluster Code */}
            <div>
              <Label htmlFor="cluster_code">
                Cluster Code<span className="text-red-500">*</span>
              </Label>{" "}
              <Input
                id="cluster_code"
                value={formData.cluster_code}
                onChange={handleChange}
                placeholder="Enter Cluster Code (alphanumeric)"
                className={`w-full mt-2 border-gray-300 ${
                  errors.cluster_code ? "border-red-500" : ""
                }`}
              />
              {errors.cluster_code && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.cluster_code}
                </p>
              )}
            </div>

            {/* Cluster Name */}
            <div>
              <Label htmlFor="cluster_name">
                Cluster Name<span className="text-red-500">*</span>
              </Label>{" "}
              <Input
                id="cluster_name"
                value={formData.cluster_name}
                onChange={handleChange}
                placeholder="Enter Cluster Name (alphabets only)"
                maxLength={50} // ADD THIS LINE
                className={`w-full mt-2 border-gray-300 ${
                  errors.cluster_name ? "border-red-500" : ""
                }`}
              />
              {errors.cluster_name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.cluster_name}
                </p>
              )}
              {/* ADD THIS CHARACTER COUNTER */}
              <p className="text-xs text-gray-500 mt-1">
                {formData.cluster_name.length}/50 characters
              </p>
            </div>

            {/* Coordinates (NM) */}
            <div>
              <Label className="text-sm">Coordinates </Label>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  id="latitude"
                  value={formData.coordinates.latitude}
                  onChange={handleChange}
                  placeholder="Latitude"
                  className={`w-full mt-2 border-gray-300 ${
                    errors.latitude ? "border-red-500" : ""
                  }`}
                />
                <Input
                  id="longitude"
                  value={formData.coordinates.longitude}
                  onChange={handleChange}
                  placeholder="Longitude"
                  className={`w-full mt-2 border-gray-300 ${
                    errors.longitude ? "border-red-500" : ""
                  }`}
                />
              </div>
              {(errors.latitude || errors.longitude) && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.latitude || errors.longitude}
                </p>
              )}
            </div>

            {/* Cluster Capacity */}
            {/* <div>
              <Label htmlFor="cluster_capacity">Cluster Capacity</Label>
              <Input
                id="cluster_capacity"
                value={formData.cluster_capacity}
                onChange={handleChange}
                placeholder="Enter Cluster Capacity"
                className={`w-full mt-2 border-gray-300 ${
                  errors.cluster_capacity ? "border-red-500" : ""
                }`}
              />
              {errors.cluster_capacity && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.cluster_capacity}
                </p>
              )}
            </div> */}

            {/* Cluster Radius */}
            <div>
              <Label htmlFor="cluster_radius">Radius (in mts.)</Label>
              <Input
                id="cluster_radius"
                name="cluster_radius"
                type="number"
                max={999999999}
                value={formData.cluster_radius}
                onChange={handleChange}
                placeholder="Enter Radius in meters"
                className={`w-full mt-2 border-gray-300 ${
                  errors.cluster_radius ? "border-red-500" : ""
                }`}
              />

              {errors.cluster_radius && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.cluster_radius}
                </p>
              )}
            </div>

            {/* Supervisor Name */}
            <div>
              <Label htmlFor="supervisor_name">Cluster Supervisor</Label>
              <Input
                id="supervisor_name"
                value={formData.supervisor_name}
                onChange={handleChange}
                placeholder="Enter Supervisor Name"
                className={`w-full mt-2 border-gray-300 ${
                  errors.supervisor_name ? "border-red-500" : ""
                }`}
              />
              {errors.supervisor_name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.supervisor_name}
                </p>
              )}
            </div>

            {/* Contact */}
            <div>
              <Label htmlFor="supervisor_contact">Supervisor Contact No</Label>
              <Input
                id="supervisor_contact"
                value={formData.supervisor_contact}
                onChange={handleChange}
                placeholder="Enter Supervisor Contact No"
                className={`w-full mt-2 border-gray-300 ${
                  errors.supervisor_contact ? "border-red-500" : ""
                }`}
              />
              {errors.supervisor_contact && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.supervisor_contact}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="supervisor_email">Supervisor Email</Label>
              <Input
                id="supervisor_email"
                value={formData.supervisor_email}
                onChange={handleChange}
                placeholder="Enter Supervisor Email"
                className={`w-full mt-2 border-gray-300 ${
                  errors.supervisor_email ? "border-red-500" : ""
                }`}
              />
              {errors.supervisor_email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.supervisor_email}
                </p>
              )}
            </div>

            {/* Image Upload with toggle for manual URL input (NM) */}
            <div className="">
              <div className="flex justify-between items-center">
                <Label htmlFor="cluster_image">Upload Image</Label>
                {/* <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={toggleUrlInputMethod}
                  className="text-xs"
                  >
                  {useManualUrl ? "Upload File Instead" : "Enter URL Instead"}
                </Button> */}
              </div>

              {useManualUrl ? (
                <div className="mt-2">
                  <Input
                    id="image_url"
                    value={formData.image_url}
                    onChange={handleChange}
                    placeholder="Enter image URL"
                    className={`w-full border-gray-300 ${
                      errors.image_url ? "border-red-500" : ""
                    }`}
                  />
                </div>
              ) : (
                <div className="mt-2">
                  <Input
                    type="file"
                    id="cluster_image"
                    ref={fileInputRef}
                    accept=".jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className={`w-full border-gray-300 ${
                      errors.image_url ? "border-red-500" : ""
                    }`}
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
              <p className="text-xs text-gray-500 mt-1">
                Supported formats: JPEG, JPG, PNG. Max size: 5MB
              </p>
            </div>

            {/* Description */}
            <div className="">
              <Label htmlFor="cluster_description">Description</Label>
              <Textarea
                id="cluster_description"
                value={formData.cluster_description}
                onChange={handleChange}
                placeholder="Enter description (maximum 100 words)"
                className={`w-full mt-2 border-gray-300 ${
                  errors.cluster_description ? "border-red-500" : ""
                }`}
              />
              {errors.cluster_description && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.cluster_description}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Word count:{" "}
                {formData.cluster_description
                  ? formData.cluster_description.trim().split(/\s+/).length
                  : 0}
                /100
              </p>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-center mt-6">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-[#8A2BE2] to-[rgb(49,2,83)] text-white px-6 py-2 rounded-md hover:opacity-90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? "Updating..." : "Creating..."}
                </>
              ) : isEditing ? (
                "Update Cluster"
              ) : (
                "Save Cluster"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
function setIsAlertOpen(arg0: boolean) {
  throw new Error("Function not implemented.");
}
