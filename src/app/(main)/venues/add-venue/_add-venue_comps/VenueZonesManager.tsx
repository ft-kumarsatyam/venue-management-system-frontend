import React, { useState, useEffect } from "react";
import { Button } from "../../../../../components/ui/button";
import { Input } from "../../../../../components/ui/input";
import { Label } from "../../../../../components/ui/label";
import { useDispatch, useSelector } from "react-redux";
import {
  createZone,
  fetchZones,
  deleteZone,
  updateZone,
} from "../../../../../redux/reducer/zones/action";
import { AppDispatch, RootState } from "../../../../../redux/store";
import { AlertCircle, Edit, Trash2, Eye } from "lucide-react";
import Pagination from "../../../../../components/ui/pagination";
import ZoneEditModal from "../../../../../components/modals/zone-edit-modal";
import DeleteConfirmationModal from "../../../../../components/modals/delete-confirmation-modal";
import ZoneDetailsModal from "../../../../../components/modals/zone-details-modal";

interface Zone {
  id: number;
  zone_code?: string | undefined;
  zone_name?: string;
  supervisor_name?: string;
  zone_capacity?: number;
  coordinates?: {
    latitude?: number;
    longitude?: number;
  };
  supervisor_email?: string;
  supervisor_contact?: string;
  image_url?: string;
  geofencing_type?: number;
  zone_radius?: string;
}

interface VenueZoneManagerProps {
  venueId: string | number;
  venueName?: string;
  onZoneAdded?: () => void;
  setShowFacility?: React.Dispatch<React.SetStateAction<boolean>>;
}

const VenueZoneManager = ({
  venueId,
  venueName,
  onZoneAdded,
  setShowFacility,
}: VenueZoneManagerProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { zones = [], loading } = useSelector(
    (state: RootState) => state?.zone || {}
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentZone, setCurrentZone] = useState<Zone | null | undefined>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDetailsZone, setSelectedDetailsZone] = useState<Zone | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
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
    image_url: null as File | null,
    geofencing_type: "1",
  });

  const [, setFileSelected] = useState<File | null>(null);
  const [fileLabel, setFileLabel] = useState("No file chosen");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (venueId) {
      dispatch(fetchZones(venueId));
    }
  }, [dispatch, venueId]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentZones = zones.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleEditZone = (zone: Zone) => {
    setCurrentZone(zone);
    setIsEditModalOpen(true);
  };

  const handleViewZone = (zone: Zone) => {
    setSelectedDetailsZone(zone);
    setIsDetailsModalOpen(true);
  };

  const openDeleteModal = (zone: Zone) => {
    setSelectedDetailsZone(zone);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedDetailsZone) {
      setIsDeleting(true);
      try {
        await dispatch(deleteZone(selectedDetailsZone.id));
        dispatch(fetchZones(venueId));
        setIsDeleteModalOpen(false);
      } catch (error) {
        console.error("Error deleting zone:", error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setCurrentZone(null);
  };

  const handleSaveZone = async (formData: FormData) => {
    try {
      if (currentZone && currentZone.id) {
        await dispatch(updateZone(currentZone.id, formData));
      } else {
        await dispatch(createZone(formData));
      }

      await dispatch(fetchZones(venueId));

      if (onZoneAdded) {
        onZoneAdded();
      }
      handleCloseModal();
    } catch (error) {
      console.error("Error saving zone:", error);
    }
  };

  const createNewZone = () => {
    setCurrentZone(null);
    setIsEditModalOpen(true);
  };

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
      setErrors((prev) => ({ ...prev, [id]: "" }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileSelected(file);
      setFileLabel(file.name);
      setFormData((prev) => ({ ...prev, image_url: file }));

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

    newErrors.zone_name = validateAlphabetic(formData.zone_name) || "";
    newErrors.zone_code = validateAlphanumeric(formData.zone_code) || "";
    newErrors.supervisor_name =
      validateAlphabetic(formData.supervisor_name) || "";
    newErrors.supervisor_email = validateEmail(formData.supervisor_email) || "";

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

    const filteredErrors = Object.fromEntries(
      Object.entries(newErrors).filter(([_, value]) => value !== "")
    );

    setErrors(filteredErrors);
    return Object.keys(filteredErrors).length === 0;
  };

  const handleSubmitZoneForm = async () => {
    if (!validateForm()) {
      console.error("Form validation failed");
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataObj = new FormData();

      formDataObj.append("zone_code", formData.zone_code);
      formDataObj.append("zone_name", formData.zone_name);
      formDataObj.append("zone_capacity", formData.zone_capacity);
      formDataObj.append("zone_radius", formData.zone_radius);
      formDataObj.append("supervisor_name", formData.supervisor_name);
      formDataObj.append("supervisor_contact", formData.supervisor_contact);
      formDataObj.append("supervisor_email", formData.supervisor_email);
      formDataObj.append("geofencing_type", formData.geofencing_type);

      if (venueId) {
        formDataObj.append("venue_ids", JSON.stringify([venueId]));
      }

      const coordinates = {
        latitude: formData.coordinates.latitude
          ? parseFloat(formData.coordinates.latitude)
          : null,
        longitude: formData.coordinates.longitude
          ? parseFloat(formData.coordinates.longitude)
          : null,
      };
      formDataObj.append("coordinates", JSON.stringify(coordinates));

      if (formData.image_url instanceof File) {
        formDataObj.append("image_url", formData.image_url);
      }

      await dispatch(createZone(formDataObj));

      await dispatch(fetchZones(venueId));

      setFormData({
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
      setFileSelected(null);
      setFileLabel("No file chosen");

      if (onZoneAdded) {
        onZoneAdded();
      }
    } catch (error) {
      console.error("Error saving zone:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextToFacility = () => {
    if (setShowFacility) {
      setShowFacility(true);
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
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-[var(--black)] mb-6">
          Configure Zone
        </h2>

        <div className="p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-[var(--black)]">
          <div>
            {renderLabel("Zone Code", "zone_code", true)}
            {renderInput("zone_code", formData.zone_code, "Enter Zone Code")}
          </div>

          <div>
            {renderLabel("Zone Name", "zone_name", true)}
            {renderInput("zone_name", formData.zone_name, "Enter Zone Name")}
          </div>

          <div>
            {renderLabel("Zone Capacity", "zone_capacity", false)}
            {renderInput(
              "zone_capacity",
              formData.zone_capacity,
              "Enter Capacity"
            )}
          </div>

          <div className="flex flex-col w-full">
            <label className="text-sm font-medium text-gray-700 mb-1">
              Coordinates
            </label>
            <div className="flex flex-col sm:flex-row sm:space-x-4 gap-4">
              <div className="flex-1">
                <Input
                  id="latitude"
                  value={formData.coordinates.latitude}
                  onChange={handleChange}
                  placeholder="Latitude"
                  className={`border-gray-300 focus:border-[#7942d1] focus:ring-[#7942d1] ${
                    errors.latitude ? "border-red-500" : ""
                  }`}
                />
                {errors.latitude && (
                  <p className="text-red-500 text-xs mt-1">{errors.latitude}</p>
                )}
              </div>
              <div className="flex-1">
                <Input
                  id="longitude"
                  value={formData.coordinates.longitude}
                  onChange={handleChange}
                  placeholder="Longitude"
                  className={`border-gray-300 focus:border-[#7942d1] focus:ring-[#7942d1] ${
                    errors.longitude ? "border-red-500" : ""
                  }`}
                />
                {errors.longitude && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.longitude}
                  </p>
                )}
              </div>
            </div>
          </div>

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

          <div>
            {renderLabel("Zone Supervisor", "supervisor_name", true)}
            {renderInput(
              "supervisor_name",
              formData.supervisor_name,
              "Enter Supervisor Name"
            )}
          </div>

          <div>
            {renderLabel("Supervisor Email", "supervisor_email", true)}
            {renderInput(
              "supervisor_email",
              formData.supervisor_email,
              "Enter Supervisor Email"
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

        <div className="flex justify-center mt-8 gap-6">
          <Button
            onClick={handleSubmitZoneForm}
            disabled={isSubmitting}
            className="bg-gradient-to-r from-[var(--purple-dark-1)] to-[var(--purple-dark-2)] py-2 px-8 rounded-md text-white"
          >
            {isSubmitting ? "Saving..." : "Save Zone"}
          </Button>

          <Button
            onClick={handleNextToFacility}
            className="bg-gradient-to-r from-[var(--purple-dark-1)] to-[var(--purple-dark-2)] py-2 px-8 rounded-md text-white"
          >
            Next
          </Button>
        </div>
      </div>

      {/* Main content section - Zone Listing */}
      <div className="bg-white rounded-lg shadow">
        {/* Header section with title and create button */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-[var(--black)]">
            Zone Listing {venueName && `for ${venueName}`}
          </h2>
          <Button
            onClick={createNewZone}
            className="bg-gradient-to-r from-[var(--purple-dark-1)] to-[var(--purple-dark-2)] text-white"
          >
            Create New Zone
          </Button>
        </div>

        {/* Zone Listing Section */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading zones...</p>
            </div>
          ) : zones && zones.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Zone Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Zone Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Capacity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Supervisor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Geofencing
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentZones.map((zone: Zone) => (
                      <tr key={zone.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {zone.image_url && (
                              <div className="flex-shrink-0 h-10 w-10 mr-4">
                                <img
                                  className="h-10 w-10 rounded-full object-cover"
                                  src={zone.image_url}
                                  alt={zone.zone_name}
                                />
                              </div>
                            )}
                            <div className="font-medium text-gray-900">
                              {zone.zone_name}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                            {zone.zone_code}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                          {zone.zone_capacity || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {zone.supervisor_name || "-"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {zone.supervisor_email || "-"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {zone.supervisor_contact || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              zone.geofencing_type === 1
                                ? "bg-green-100 text-green-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {zone.geofencing_type === 1 ? "Radius" : "Polygon"}
                            {zone.geofencing_type === 1 &&
                              zone.zone_radius &&
                              ` (${zone.zone_radius}m)`}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <Button
                              onClick={() => handleViewZone(zone)}
                              variant="outline"
                              size="sm"
                              className="text-gray-600 hover:text-gray-800 border-gray-300"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() => handleEditZone(zone)}
                              variant="outline"
                              size="sm"
                              className="text-blue-600 hover:text-blue-800 border-blue-300"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() => openDeleteModal(zone)}
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-800 border-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="mt-6 flex justify-center">
                <Pagination
                  totalItems={zones.length}
                  itemsPerPage={itemsPerPage}
                  currentPage={currentPage}
                  onPageChange={handlePageChange}
                />
              </div>
            </>
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-lg">
              <div className="flex justify-center">
                <AlertCircle className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="mt-2 text-lg font-medium text-gray-700">
                No zones found
              </h3>
              <p className="mt-1 text-gray-500">
                Get started by creating a new zone.
              </p>
              <div className="mt-6">
                <Button
                  onClick={createNewZone}
                  className="bg-gradient-to-r from-[var(--purple-dark-1)] to-[var(--purple-dark-2)] text-white"
                >
                  Create First Zone
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* <ZoneEditModal
        isOpen={isEditModalOpen}
        onClose={handleCloseModal}
        zone={currentZone as unknown as Zone}
        onSave={handleSaveZone}
        isEdit={!!currentZone}
        setIsEditModalOpen={setIsEditModalOpen}
        venueId={venueId}
        initialData={{ ids: [venueId] }}
      /> */}

      {/* Zone Details Modal */}
      {/* {selectedDetailsZone && (
        <ZoneDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          zone={selectedDetailsZone}
        />
      )} */}

      {/* Delete Confirmation Modal */}
      {selectedDetailsZone && (
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
          itemType="Zone"
          itemName={selectedDetailsZone.zone_name}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
};

export default VenueZoneManager;
