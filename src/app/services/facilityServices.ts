import axiosInstance from "../../api/axiosInstance";
import {
  CREATE_FACILITY,
  GET_ALL_FACILITIES,
  GET_SINGLE_FACILITY,
  UPDATE_FACILITY,
  DELETE_FACILITY,
  DROPDOWN_FACILITY,
  GET_ZONES_BY_FACILITY_ID,
} from "../../api/api_endpoints";

export interface ZoneResponse {
  id: number;
  zone_name: string;
  zone_code?: string;
  zone_capacity?: number;
  supervisor_name?: string;
  supervisor_email?: string;
  supervisor_contact?: string;
  coordinates?: any;
  zone_radius?: number;
  geofencing_type?: string;
  image_url?: string;
  facility_id?: number;
  venue_id?: number;
  facility_name?: string;
}

export interface FacilityResponse {
  data: FacilityResponse;
  id: number;
  facility_name: string;
  supervisor: string;
  coordinates: { latitude: string; longitude: string };
  capacity: number;
  amenities: string[] | string;
  zone?: string;
  image?: string;
  email?: string;
  contact?: string;
  zones?: string[];
}

export interface FacilityCreateUpdatePayload {
  facility_name: string;
  supervisor: string;
  coordinates: { latitude: string; longitude: string };
  capacity: number;
  amenities: string[];
  zones?: string[];
  image?: string;
  email?: string;
  contact?: string;
}
export interface FacilityDropdownItem {
  id: number;
  facility_name: string;
}

// Updated response interface to include pagination
export interface PaginatedFacilityResponse {
  data: FacilityResponse[];
  total: number;
  pagination: {
    hasNextPage: boolean;
    hasPrevPage: boolean;
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}
// Updated zones response interface with pagination - Made facility_name optional
export interface PaginatedZonesResponse {
  facility_name?: string; // Made optional to fix TypeScript error
  data: ZoneResponse[];
  pagination?: {
    hasNextPage: boolean;
    hasPrevPage: boolean;
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  total?: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  itemsPerPage?: number;
}

const facilityService = {
  createFacility: async (
    facilityData: FacilityCreateUpdatePayload
  ): Promise<FacilityResponse> => {
    const response = await axiosInstance.post(CREATE_FACILITY, facilityData);
    return response.data;
  },

  getSportsDropdown: async (venueId?: number): Promise<any> => {
    const url = `/dropdown/sports${venueId ? `?venue_id=${venueId}` : ""}`;
    const response = await axiosInstance.get(url);
    return response.data;
  },

  getAllFacilities: async (
    page?: number,
    limit?: number
  ): Promise<PaginatedFacilityResponse> => {
    let url = GET_ALL_FACILITIES();

    const params = [];
    if (page) params.push(`page=${page}`);
    if (limit) params.push(`limit=${limit}`);

    if (params.length > 0) {
      const separator = url.includes("?") ? "&" : "?";
      url = `${url}${separator}${params.join("&")}`;
    }

    const response = await axiosInstance.get(url);

    return {
      data: response.data.data || response.data,
      total: response.data.total || 0,
      pagination: {
        hasNextPage: response.data.hasNextPage || false,
        hasPrevPage: response.data.hasPrevPage || false,
        currentPage: response.data.currentPage || 1,
        totalPages: response.data.totalPages || 1,
        totalItems: response.data.totalItems || response.data.total || 0,
        itemsPerPage: response.data.itemsPerPage || limit || 10,
      },
    };
  },

  getSingleFacility: async (
    id: number,
    limit?: number
  ): Promise<FacilityResponse> => {
    const endpoint = GET_SINGLE_FACILITY(id, limit);
    const response = await axiosInstance.get(endpoint);
    return response.data;
  },

  updateFacility: async (
    id: number,
    facilityData: FacilityCreateUpdatePayload
  ): Promise<FacilityResponse> => {
    const response = await axiosInstance.put(
      `${UPDATE_FACILITY}/${id}`,
      facilityData
    );
    return response.data;
  },

  deleteFacility: async (id: number): Promise<void> => {
    const endpoint = DELETE_FACILITY(id);
    await axiosInstance.delete(endpoint);
  },

  getFacilityDropdown: async (): Promise<FacilityDropdownItem[]> => {
    const response = await axiosInstance.get(DROPDOWN_FACILITY);
    return response.data;
  },

  getZonesByFacility: async (
    facilityId: number,
    page = 1,
    limit = 10
  ): Promise<PaginatedZonesResponse> => {
    const endpoint = GET_ZONES_BY_FACILITY_ID(facilityId);

    // Check if the endpoint already has query parameters
    const hasExistingParams = endpoint.includes("?");

    // Add pagination parameters to the URL
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    // Construct the full endpoint with proper separator
    const separator = hasExistingParams ? "&" : "?";
    const fullEndpoint = `${endpoint}${separator}${params.toString()}`;

    const response = await axiosInstance.get(fullEndpoint);

    // Extract facility_name from response (multiple fallback options)
    let facilityName = response.data.facility_name;

    // If not found at root level, try to get from first zone
    if (!facilityName && response.data.data && response.data.data.length > 0) {
      facilityName = response.data.data[0].facility_name;
    }

    // Final fallback
    if (!facilityName) {
      facilityName = `Facility ${facilityId}`;
    }

    // Handle different response structures
    if (response.data.data) {
      // If response has nested data structure
      return {
        facility_name: facilityName,
        data: response.data.data,
        pagination: {
          hasNextPage: response.data.hasNextPage || false,
          hasPrevPage: response.data.hasPrevPage || false,
          currentPage: response.data.currentPage || page,
          totalPages: response.data.totalPages || 1,
          totalItems: response.data.totalItems || response.data.total || 0,
          itemsPerPage: response.data.itemsPerPage || limit,
        },
      };
    } else {
      // If response is direct array or has flat structure
      return {
        facility_name: facilityName,
        data: Array.isArray(response.data) ? response.data : [],
        hasNextPage: response.data.hasNextPage || false,
        hasPrevPage: response.data.hasPrevPage || false,
        currentPage: response.data.currentPage || page,
        totalPages: response.data.totalPages || 1,
        totalItems: response.data.totalItems || response.data.total || 0,
        itemsPerPage: response.data.itemsPerPage || limit,
      };
    }
  },
};

export default facilityService;
