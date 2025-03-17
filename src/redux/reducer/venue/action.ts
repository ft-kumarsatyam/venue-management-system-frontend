import axiosInstance from "../../../api/axiosInstance";
import {
  FETCH_VENUES_REQUEST,
  FETCH_VENUES_SUCCESS,
  FETCH_VENUES_FAILURE,
  FETCH_VENUE_REQUEST,
  FETCH_VENUE_SUCCESS,
  FETCH_VENUE_FAILURE,
  CREATE_VENUE_REQUEST,
  CREATE_VENUE_SUCCESS,
  CREATE_VENUE_FAILURE,
  UPDATE_VENUE_REQUEST,
  UPDATE_VENUE_SUCCESS,
  UPDATE_VENUE_FAILURE,
  DELETE_VENUE_REQUEST,
  DELETE_VENUE_SUCCESS,
  DELETE_VENUE_FAILURE,
  DROPDOWN_VENUE,
  FETCH_DROPDOWN_VENUES_REQUEST,
  FETCH_DROPDOWN_VENUES_SUCCESS,
  FETCH_DROPDOWN_VENUES_FAILURE,
  FETCH_FACILITIES_BY_VENUE_REQUEST,
  FETCH_FACILITIES_BY_VENUE_SUCCESS,
  FETCH_FACILITIES_BY_VENUE_FAILURE,
} from "./actionTypes";
import { AppDispatch } from "@/redux/store";
import {
  CREATE_VENUE,
  GET_SINGLE_VENUE,
  GET_ALL_VENUES,
  UPDATE_VENUE,
  DELETE_VENUE,
  GET_FACILITIES_BY_VENUE,
} from "../../../api/api_endpoints";

// Define interface for fetch venues parameters
interface FetchVenuesParams {
  clusterId?: string;
  page?: number;
  limit?: number;
  search?: string;
}

// Define interface for fetch facilities by venue parameters
interface FetchFacilitiesByVenueParams {
  venueId: number;
  page?: number;
  limit?: number;
  search?: string;
}

export const fetchVenues =
  (params: FetchVenuesParams = {}) =>
  async (dispatch: AppDispatch) => {
    try {
      dispatch({ type: FETCH_VENUES_REQUEST });

      const queryParams = new URLSearchParams();

      if (params.page) queryParams.append("page", params.page.toString());
      if (params.limit) queryParams.append("limit", params.limit.toString());
      if (params.clusterId) queryParams.append("cluster_id", params.clusterId);
      if (params.search?.trim())
        queryParams.append("search", params.search.trim());

      const url = `${GET_ALL_VENUES}?${queryParams.toString()}`;

      const response = await axiosInstance.get(url);
      const data = response.data;

      console.log("Venues API Response:", data);

      const pagination = {
        totalItems: data.totalItems || 0,
        totalPages: data.totalPages || 0,
        currentPage: data.currentPage || 1,
        itemsPerPage: data.itemsPerPage || 30,
        hasNextPage: data.hasNextPage ?? false,
        hasPrevPage: data.hasPrevPage ?? false,
      };

      const transformedData =
        data.data?.map((venue: any) => ({
          id: venue.id,
          venue_code: venue.venue_code || `VC-${venue.id}`,
          venue_name: venue.venue_name,
          supervisor_name: venue.supervisor_name || venue.supervisor || null,
          supervisor_contact: venue.supervisor_contact || null,
          supervisor_email: venue.supervisor_email || null,
          supervisor_id: venue.supervisor_id || null,
          venue_capacity: venue.venue_capacity || venue.capacity || 0,
          venue_image_url: venue.venue_image_url || venue.image_url || null,
          facilities: venue.facilities || [],
          coordinates: venue.coordinates
            ? `${venue.coordinates.latitude}, ${venue.coordinates.longitude}`
            : "",
          cluster_id: venue.cluster_id,
          parent_cluster: venue.parent_cluster || null,
          zones_count: venue.zones_count || 0,
          facilities_count: venue.facilities_count || 0,
          originalData: venue,
        })) || [];

      dispatch({
        type: FETCH_VENUES_SUCCESS,
        payload: {
          venues: transformedData,
          pagination,
        },
      });

      return transformedData;
    } catch (error) {
      console.error("Error fetching venues:", error);

      const message =
        error instanceof Error
          ? error.message
          : (error as any)?.response?.data?.message || "Failed to fetch venues";

      dispatch({
        type: FETCH_VENUES_FAILURE,
        payload: message,
      });

      return Promise.reject(error);
    }
  };

export const fetchFacilitiesByVenue =
  (
    venueId: number,
    page: number = 1,
    limit: number = 10,
    searchQuery: string = "",
    params?: FetchFacilitiesByVenueParams
  ) =>
  async (dispatch: AppDispatch) => {
    try {
      dispatch({ type: FETCH_FACILITIES_BY_VENUE_REQUEST });

      // Use params if provided, otherwise create from individual parameters
      const queryParams = new URLSearchParams();
      const finalParams = params || {
        venueId,
        page,
        limit,
        search: searchQuery,
      };

      if (finalParams.page)
        queryParams.append("page", finalParams.page.toString());
      if (finalParams.limit)
        queryParams.append("limit", finalParams.limit.toString());
      if (finalParams.search?.trim())
        queryParams.append("search", finalParams.search.trim());

      const baseUrl = GET_FACILITIES_BY_VENUE(finalParams.venueId);
      const connector = baseUrl.includes("?") ? "&" : "?";
      const url = `${baseUrl}${connector}${queryParams.toString()}`;

      console.log("Fetching facilities from URL:", url);

      const response = await axiosInstance.get(url);
      const data = response.data;

      console.log("Facilities API Response:", data);

      // Create pagination object similar to fetchVenues
      const pagination = {
        totalItems: data.totalItems || 0,
        totalPages: data.totalPages || 0,
        currentPage: data.currentPage || finalParams.page || 1,
        itemsPerPage: data.itemsPerPage || finalParams.limit || 10,
        hasNextPage: data.hasNextPage ?? false,
        hasPrevPage: data.hasPrevPage ?? false,
      };

      // Transform facilities data
      const transformedFacilities = (data.data || []).map((facility: any) => ({
        ...facility,
        facility_amenities: Array.isArray(facility.facility_amenities)
          ? facility.facility_amenities
          : typeof facility.facility_amenities === "string"
          ? [facility.facility_amenities]
          : ["Helpdesk", "Washroom", "WIFI"],
      }));

      // Create the complete response structure
      const facilitiesData = {
        data: transformedFacilities,
        venue_name: data.venue_name || null,
        venue_code: data.venue_code || null,
        success: data.success ?? true,
        message: data.message || "Facilities retrieved successfully",
      };

      // Dispatch success with both facilities data and pagination
      dispatch({
        type: FETCH_FACILITIES_BY_VENUE_SUCCESS,
        payload: {
          facilitiesData,
          pagination,
        },
      });

      return {
        facilities: transformedFacilities,
        pagination,
        venue_name: data.venue_name,
      };
    } catch (error) {
      console.error("Error fetching facilities by venue:", error);

      const message =
        error instanceof Error
          ? error.message
          : (error as any)?.response?.data?.message ||
            "Failed to fetch facilities";

      dispatch({
        type: FETCH_FACILITIES_BY_VENUE_FAILURE,
        payload: message,
      });

      return Promise.reject(error);
    }
  };

export const fetchDropdownVenues =
  (clusterId?: string) => async (dispatch: AppDispatch) => {
    try {
      dispatch({ type: FETCH_DROPDOWN_VENUES_REQUEST });
      const params = clusterId ? { cluster_id: clusterId } : {};
      const response = await axiosInstance.get(DROPDOWN_VENUE, { params });

      const transformedData = response.data.data.map((venue: any) => ({
        id: venue.id,
        venue_name: venue.venue_name,
        venue_code: venue.venue_code,
      }));

      dispatch({
        type: FETCH_DROPDOWN_VENUES_SUCCESS,
        payload: transformedData,
      });

      return transformedData;
    } catch (error) {
      console.error("Error fetching dropdown venues:", error);
      dispatch({ type: FETCH_DROPDOWN_VENUES_FAILURE, payload: error });
      return Promise.reject(error);
    }
  };

export const fetchVenue = (id: number) => async (dispatch: AppDispatch) => {
  try {
    dispatch({ type: FETCH_VENUE_REQUEST });

    console.log(`Fetching venue with ID: ${id}`);

    const response = await axiosInstance.get(GET_SINGLE_VENUE(id));

    console.log("API Response:", response.data);

    dispatch({
      type: FETCH_VENUE_SUCCESS,
      payload: response.data.data,
    });

    return response.data.data;
  } catch (error: any) {
    console.error("Error fetching venue:", error);
    console.error("Error details:", error.response?.data || error.message);

    dispatch({
      type: FETCH_VENUE_FAILURE,
      payload: error.response?.data?.error || error.message || error,
    });

    return Promise.reject(error);
  }
};

export const createVenue =
  (venueData: FormData) => async (dispatch: AppDispatch) => {
    try {
      dispatch({ type: CREATE_VENUE_REQUEST });
      const response = await axiosInstance.post(CREATE_VENUE, venueData);
      dispatch({ type: CREATE_VENUE_SUCCESS, payload: response.data });
      return response.data;
    } catch (error) {
      console.error("Error in createVenue:", error);
      dispatch({ type: CREATE_VENUE_FAILURE, payload: error });
      return Promise.reject(error);
    }
  };

export const updateVenue =
  (id: number, venueData: any) => async (dispatch: AppDispatch) => {
    try {
      dispatch({ type: UPDATE_VENUE_REQUEST });
      const response = await axiosInstance.put(UPDATE_VENUE(id), venueData);
      dispatch({ type: UPDATE_VENUE_SUCCESS, payload: response.data });
      return response.data;
    } catch (error) {
      dispatch({ type: UPDATE_VENUE_FAILURE, payload: error });
      return Promise.reject(error);
    }
  };

export const deleteVenue = (id: number) => async (dispatch: AppDispatch) => {
  try {
    dispatch({ type: DELETE_VENUE_REQUEST });
    await axiosInstance.delete(DELETE_VENUE(id));
    dispatch({ type: DELETE_VENUE_SUCCESS, payload: id });
    return true;
  } catch (error) {
    dispatch({ type: DELETE_VENUE_FAILURE, payload: error });
    return Promise.reject(error);
  }
};
