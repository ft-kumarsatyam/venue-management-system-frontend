import * as types from "./actionTypes";
import {
  CREATE_ZONE,
  GET_SINGLE_ZONE,
  UPDATE_ZONE,
  DROPDOWN_ZONE,
} from "../../../api/api_endpoints";
import axiosInstance, { getHeaders } from "../../../api/axiosInstance";
import { AppDispatch } from "@/redux/store";

// Updated Zone interface to match the API response
export interface Zone {
  id: number | string;
  zone_code: string;
  zone_name: string;
  zone_capacity: number;
  geofencing_type: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  image_url: string;
  supervisor_name: string;
  supervisor_email: string;
  supervisor_contact: string;
  supervisor_id: number | null;
  venue_id: number;
  facility_id: number | null;
  created_by: number;
  assigned_to: number | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface ZoneDropdownItem {
  id: number;
  zone_name: string;
}

interface ApiResponse {
  success: boolean;
  error: null | string;
  message: string;
  totalItems: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  data: Zone[];
}

export const fetchZones =
  (
    venueId?: string | number | null,
    isCommonZone = true,
    page = 1,
    limit = 10,
    searchTerm?: string
  ) =>
  async (dispatch: AppDispatch) => {
    try {
      dispatch({ type: types.FETCH_ZONES_REQUEST });

      const token = localStorage.getItem("access_token") || "";
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || window.location.origin;

      const params = new URLSearchParams({
        common_zone_status: isCommonZone ? "1" : "0",
        page: page.toString(),
        limit: limit.toString(),
      });

      if (venueId) {
        params.append("venue_id", venueId.toString());
      }

      if (searchTerm && searchTerm.trim()) {
        params.append("search", searchTerm.trim());
      }

      const endpoint = `${baseUrl}/zone?${params.toString()}`;

      const response = await axiosInstance.get(endpoint);
      console.log("Zones API Response:", response.data);

      const pagination = {
        hasNextPage: response.data.hasNextPage || false,
        hasPrevPage: response.data.hasPrevPage || false,
        currentPage: response.data.currentPage || page,
        totalPages: response.data.totalPages || 1,
        totalItems: response.data.totalItems || response.data.data?.length || 0,
      };

      const transformedData = (response.data.data || []).map((zone: any) => ({
        id: zone.id,
        zone_name: zone.zone_name,
        zone_code: zone.zone_code,
        zone_capacity: zone.zone_capacity,
        supervisor_name: zone.supervisor_name,
        supervisor_email: zone.supervisor_email,
        supervisor_contact: zone.supervisor_contact,
        coordinates: zone.coordinates,
        zone_radius: zone.zone_radius,
        geofencing_type: zone.geofencing_type,
        image_url: zone.image_url,
        facility_id: zone.facility_id,
        venue_id: zone.venue_id,
        facility_name: zone.facility_name,
        originalData: zone,
      }));

      dispatch({
        type: types.FETCH_ZONES_SUCCESS,
        payload: { 
          zones: transformedData, 
          pagination: {
            ...pagination,
            totalItems: pagination.totalItems // Ensure totalItems is included
          }
        },
      });

      console.log("Zones data dispatched:", {
        zones: transformedData,
        pagination,
      });

      return { success: true, data: transformedData };
    } catch (error) {
      console.error("Error fetching zones:", error);
      dispatch({
        type: types.FETCH_ZONES_FAILURE,
        payload:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
      return { success: false, error };
    }
  };

  
export const createZone = (zoneData: any) => async (dispatch: any) => {
  dispatch({ type: types.CREATE_ZONE_REQUEST });

  try {
    let response;

    if (zoneData instanceof FormData) {
      console.log("Submitting as FormData");

      const hasFacilityId = zoneData.get("facility_id");
      const commonZoneStatus = hasFacilityId ? "0" : "1";
      zoneData.set("common_zone_status", commonZoneStatus);

      console.log("FormData keys being sent:");
      for (const key of zoneData.keys()) {
        console.log(key);
      }

      response = await axiosInstance.post(CREATE_ZONE, zoneData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000,
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 100)
          );
          console.log(`Upload progress: ${percentCompleted}%`);
        },
      });
    } else {
      const hasFacilityId =
        zoneData.facility_id !== undefined && zoneData.facility_id !== null;
      const common_zone_status = hasFacilityId ? "0" : "1";

      const transformedData = {
        zone_code: zoneData.zone_code || zoneData.zone_Id,
        zone_name: zoneData.zone_name,
        coordinates:
          zoneData.coordinates && typeof zoneData.coordinates === "string"
            ? {
                latitude: Number.parseFloat(
                  zoneData.coordinates.split(",")[0].trim()
                ),
                longitude: Number.parseFloat(
                  zoneData.coordinates.split(",")[1].trim()
                ),
              }
            : zoneData.coordinates || { latitude: 0, longitude: 0 },
        geofencing_type: zoneData.geofencing_type || "1",
        zone_capacity: Number.parseInt(
          zoneData.zone_capacity || zoneData.capacity || "0",
          10
        ),
        zone_radius: zoneData.zone_radius || "100",
        supervisor_name:
          zoneData.supervisor_name || zoneData.zone_supervisor || "",
        supervisor_contact:
          zoneData.supervisor_contact || zoneData.contact || "",
        supervisor_email: zoneData.supervisor_email || zoneData.email || "",
        venue_ids: zoneData.venue_ids || [],
        facility_id: hasFacilityId ? zoneData.facility_id : null,
        common_zone_status,
        assigned_to: null,
        // id: "",
      };

      console.log("Submitting as JSON:", transformedData);
      response = await axiosInstance.post(CREATE_ZONE, transformedData);
    }

    console.log("API Response:", response.data);

    dispatch({
      type: types.CREATE_ZONE_SUCCESS,
      payload: response.data.data || response.data,
    });

    return response.data.data || response.data;
  } catch (error: any) {
    console.error("Error creating zone:", error);

    if (error.response) {
      console.error("Error response:", error.response.data);
      console.error("Error status:", error.response.status);
      console.error("Error headers:", error.response.headers);
    } else if (error.request) {
      console.error("No response received from server:", error.request);
    } else {
      console.error("Error message:", error.message);
    }

    dispatch({
      type: types.CREATE_ZONE_FAILURE,
      payload:
        error.response?.data?.message ||
        error.message ||
        "An unknown error occurred",
    });

    throw error;
  }
};

export const updateZone =
  (id: number, zoneData: any) => async (dispatch: any) => {
    dispatch({ type: types.UPDATE_ZONE_REQUEST });

    try {
      if (zoneData instanceof FormData) {
        const hasFacilityId = zoneData.get("facility_id");
        const commonZoneStatus = hasFacilityId ? "0" : "1";
        zoneData.set("common_zone_status", commonZoneStatus);

        if (zoneData.has("venue_id")) {
          zoneData.delete("venue_id");
        }
      } else if (typeof zoneData === "object") {
        const hasFacilityId =
          zoneData.facility_id !== undefined && zoneData.facility_id !== null;
        zoneData.common_zone_status = hasFacilityId ? "0" : "1";

        if ("venue_id" in zoneData) {
          delete zoneData.venue_id;
        }
      }
      console.log(zoneData);
      const response = await axiosInstance.put(UPDATE_ZONE(id), zoneData, {
        headers: getHeaders(true),
      });

      dispatch({
        type: types.UPDATE_ZONE_SUCCESS,
        payload: response.data.data || response.data,
      });
      return response.data.data || response.data;
    } catch (error) {
      dispatch({
        type: types.UPDATE_ZONE_FAILURE,
        payload:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
      throw error;
    }
  };

export const fetchZoneDetails = (id: number) => async (dispatch: any) => {
  dispatch({ type: types.FETCH_ZONE_DETAILS_REQUEST });

  try {
    const response = await axiosInstance.get(GET_SINGLE_ZONE(id));
    dispatch({
      type: types.FETCH_ZONE_DETAILS_SUCCESS,
      payload: response.data.data || response.data,
    });
  } catch (error) {
    dispatch({
      type: types.FETCH_ZONE_DETAILS_FAILURE,
      payload:
        error instanceof Error ? error.message : "An unknown error occurred",
    });
  }
};

// Delete zone
export const deleteZone = (id: string | number) => async (dispatch: any) => {
  dispatch({ type: types.DELETE_ZONE_REQUEST });
  try {
    // Assuming you have a DELETE_ZONE endpoint defined somewhere
    await axiosInstance.delete(`/zone/${id}`);

    dispatch({
      type: types.DELETE_ZONE_SUCCESS,
      payload: id,
    });

    return id;
  } catch (error) {
    dispatch({
      type: types.DELETE_ZONE_FAILURE,
      payload:
        error instanceof Error ? error.message : "An unknown error occurred",
    });
    throw error;
  }
};

// Fetch zones for dropdown
export const fetchZoneDropdown = () => async (dispatch: any) => {
  dispatch({ type: types.FETCH_ZONE_DROPDOWN_REQUEST });

  try {
    const response = await axiosInstance.get(DROPDOWN_ZONE);

    dispatch({
      type: types.FETCH_ZONE_DROPDOWN_SUCCESS,
      payload: response.data,
    });

    return response.data;
  } catch (error) {
    dispatch({
      type: types.FETCH_ZONE_DROPDOWN_FAILURE,
      payload:
        error instanceof Error ? error.message : "An unknown error occurred",
    });
    throw error;
  }
};
