"use client";

import React, { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { ImageUploader } from "../../components/ui/image-uploader";
import "../main.css";
import {
  createSubadmin,
  fetchClusterDropdown,
  fetchVenueDropdown,
} from "@/redux/reducer/admin/action";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { useRouter } from "next/navigation";

interface CreateAdminFormProps {
  onSubmit?: (data: AdminFormData) => void;
  onAddPermissions?: () => void;
}

export interface AdminFormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  photo: string | null;
  selectCluster: string;
  selectVenue: string;
}

export function CreateAdminForm({ onSubmit }: CreateAdminFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<AdminFormData>({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    photo: null,
    selectCluster: "",
    selectVenue: "",
  });

  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof AdminFormData, string>>
  >({});
  const [successPopupVisible, setSuccessPopupVisible] = useState(false);
  const [progressWidth, setProgressWidth] = useState("100%");

  const dispatch = useDispatch<AppDispatch>();

  // Add safety checks for Redux state
  const adminState = useSelector((state: RootState) => state.admins || {});
  const {
    clusters = [],
    venues = [],
    clusterLoading = false,
    venueLoading = false,
    createLoading = false,
    createSuccess = false,
    createError = null,
    clusterError = null,
    venueError = null,
  } = adminState;

  useEffect(() => {
    fetchClusterDropdown(dispatch);
  }, [dispatch]);

  useEffect(() => {
    if (formData.selectCluster) {
      fetchVenueDropdown(dispatch, formData.selectCluster);
    }
  }, [dispatch, formData.selectCluster]);

  useEffect(() => {
    if (createSuccess) {
      setSuccessPopupVisible(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        photo: null,
        selectCluster: "",
        selectVenue: "",
      });

      // Clear form errors
      setFormErrors({});

      // Progress bar animation and redirect
      setProgressWidth("100%");
      setTimeout(() => setProgressWidth("0%"), 10);

      setTimeout(() => {
        setSuccessPopupVisible(false);
        // Refresh the page to show updated data
        window.location.reload();
      }, 3000);
    }
  }, [createSuccess]);

  // Handle create error
  useEffect(() => {
    if (createError) {
      console.error("Error creating admin:", createError);
      if (onSubmit) {
        onSubmit({
          ...formData,
          apiError: createError,
        } as any);
      }
    }
  }, [createError, formData, onSubmit]);

  // Validation function
  const validateField = (fieldName: string, value: string): string => {
    switch (fieldName) {
      case "name":
        return !value.trim() ? "Name is required" : "";
      case "email":
        if (!value.trim()) return "Email is required";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
        return !emailRegex.test(value.trim()) ? "Invalid email format" : "";
      case "phone":
        return !value.match(/^[0-9]{10}$/) ? "Phone must be 10 digits" : "";
      case "password":
        return !value ? "Password is required" : "";
      case "confirmPassword":
        return value !== formData.password ? "Passwords do not match" : "";
      case "selectCluster":
        return !value ? "Please select a cluster" : "";
      case "selectVenue":
        return !value ? "Please select a venue" : "";
      default:
        return "";
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [id]: value,
      ...(id === "selectCluster" ? { selectVenue: "" } : {}),
    }));

    // Real-time validation
    const error = validateField(id, value);
    setFormErrors((prev) => ({
      ...prev,
      [id]: error,
      // Special case for confirm password when password changes
      ...(id === "password"
        ? {
            confirmPassword: validateField(
              "confirmPassword",
              formData.confirmPassword
            ),
          }
        : {}),
    }));

    // Clear venue error when cluster changes
    if (id === "selectCluster") {
      setFormErrors((prev) => ({
        ...prev,
        selectVenue: "",
      }));
    }
  };

  const handleImageChange = (imageUrl: string | null) => {
    setFormData((prev) => ({ ...prev, photo: imageUrl }));
  };

  const isFormValid = (): boolean => {
    const hasErrors = Object.values(formErrors).some((error) => error !== "");
    const hasEmptyRequiredFields =
      !formData.name.trim() ||
      !formData.email ||
      !formData.phone ||
      !formData.password ||
      !formData.confirmPassword ||
      !formData.selectCluster ||
      !formData.selectVenue;

    return !hasErrors && !hasEmptyRequiredFields;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid()) return;

    try {
      const createSubadminData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        venue_id: formData.selectVenue,
        cluster_id: formData.selectCluster,
        image_url: formData.photo,
      };

      console.log("Submitting subadmin data:", {
        ...createSubadminData,
        password: "[REDACTED]",
      });

      await createSubadmin(dispatch, createSubadminData);

      if (onSubmit) {
        onSubmit({
          ...formData,
          cluster_id: formData.selectCluster,
          apiResponse: "success",
        } as any);
      }

      // If createSuccess is not immediately available, we can also refresh after a short delay
      // This is a fallback in case the Redux state doesn't update immediately
      setTimeout(() => {
        if (!createSuccess) {
          console.log("Refreshing page to show updated data...");
          window.location.reload();
        }
      }, 2000);
    } catch (error: any) {
      console.error("Error creating admin:", error);
    }
  };

  return (
    <>
      {successPopupVisible && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded shadow-lg z-50 w-[90%] md:w-auto">
          <div>Admin created successfully!</div>
          <div className="mt-2 h-1 w-full bg-green-700 rounded overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-[3000ms] ease-linear"
              style={{ width: progressWidth }}
            />
          </div>
        </div>
      )}

      {createError && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded shadow-lg z-50 w-[90%] md:w-auto">
          <div>Error: {createError}</div>
        </div>
      )}

      {clusterError && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded shadow-lg z-50 w-[90%] md:w-auto">
          <div>Error loading clusters: {clusterError}</div>
        </div>
      )}

      {venueError && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded shadow-lg z-50 w-[90%] md:w-auto">
          <div>Error loading venues: {venueError}</div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter Name"
                className="mt-2"
                disabled={createLoading}
              />
              {formErrors.name && (
                <p className="text-red-500 text-sm">{formErrors.name}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone" className="mt-8">
                Phone Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter Phone Number"
                className="mt-2"
                disabled={createLoading}
              />
              {formErrors.phone && (
                <p className="text-red-500 text-sm">{formErrors.phone}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password" className="mt-8">
                Password <span className="text-red-500">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter Password"
                className="mt-2"
                disabled={createLoading}
              />
              {formErrors.password && (
                <p className="text-red-500 text-sm">{formErrors.password}</p>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="mt-8">
                Confirm Password <span className="text-red-500">*</span>
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm Password"
                className="mt-2"
                disabled={createLoading}
              />
              {formErrors.confirmPassword && (
                <p className="text-red-500 text-sm">
                  {formErrors.confirmPassword}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="selectCluster">
                Select Cluster <span className="text-red-500">*</span>
              </Label>
              <select
                id="selectCluster"
                value={formData.selectCluster}
                onChange={handleChange}
                className="w-[100%] border border-gray-500 rounded px-3 py-2 mt-2"
                disabled={createLoading || clusterLoading}
              >
                <option value="">
                  {clusterLoading ? "Loading clusters..." : "Select Cluster"}
                </option>
                {Array.isArray(clusters) &&
                  clusters.map((cluster: any) => (
                    <option
                      key={cluster.id || cluster._id}
                      value={cluster.id || cluster._id}
                    >
                      {cluster.cluster_name ||
                        cluster.name ||
                        "Unknown Cluster"}
                    </option>
                  ))}
              </select>
              {formErrors.selectCluster && (
                <p className="text-red-500 text-sm">
                  {formErrors.selectCluster}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter Email"
                className="mt-2"
                disabled={createLoading}
              />
              {formErrors.email && (
                <p className="text-red-500 text-sm">{formErrors.email}</p>
              )}
            </div>

            <div>
              <Label>Upload Photo</Label>
              <ImageUploader
                label=""
                value={formData.photo}
                onImageChange={handleImageChange}
                maxSizeInMB={1}
                allowedTypes={["image/png", "image/jpeg", "image/jpg"]}
              />
            </div>

            <div>
              <Label htmlFor="selectVenue">
                Select Venue <span className="text-red-500">*</span>
              </Label>
              <select
                id="selectVenue"
                value={formData.selectVenue}
                onChange={handleChange}
                className="w-[100%] border border-gray-500 rounded px-3 py-2 mt-2"
                disabled={
                  !formData.selectCluster || createLoading || venueLoading
                }
              >
                <option value="">
                  {!formData.selectCluster
                    ? "Select cluster first"
                    : venueLoading
                    ? "Loading venues..."
                    : "Select Venue"}
                </option>
                {Array.isArray(venues) &&
                  venues.map((venue: any) => (
                    <option
                      key={venue.id || venue._id}
                      value={venue.id || venue._id}
                    >
                      {venue.venue_name || venue.name || "Unknown Venue"}
                    </option>
                  ))}
              </select>
              {formErrors.selectVenue && (
                <p className="text-red-500 text-sm">{formErrors.selectVenue}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-center items-center mt-8">
          <Button
            type="submit"
            className="bg-primary hover:bg-primary/90 text-white rounded-[12px]"
            disabled={createLoading || !isFormValid()}
            style={{
              background:
                createLoading || !isFormValid()
                  ? "#gray-400"
                  : "linear-gradient(to right, #8A2BE2, #4B0082)",
              color: "#fff",
              padding: "8px 20px",
              fontSize: "16px",
              fontWeight: "500",
              cursor:
                createLoading || !isFormValid() ? "not-allowed" : "pointer",
              outline: "none",
              transition: "background 0.3s ease",
            }}
          >
            {createLoading ? "Creating..." : "Create Module Admin"}
          </Button>
        </div>
      </form>
    </>
  );
}
