import { Dispatch } from "redux";
import facilityService, {
  FacilityCreateUpdatePayload,
} from "../../../app/services/facilityServices";
import * as types from "../facilities/actionTypes";

// Helper action creators
const setLoading = (loading: boolean) => ({
  type: types.FACILITY_LOADING,
  payload: loading,
});

const setError = (error: string | null) => ({
  type: types.FACILITY_ERROR,
  payload: error,
});

// Get all facilities action
export const getAllFacilities =
  (page = 1, limit = 10) =>
  async (dispatch: Dispatch) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      const response = await facilityService.getAllFacilities(page, limit);

      dispatch({
        type: types.GET_ALL_FACILITIES_SUCCESS,
        payload: {
          data: response.data,
          total: response.total,
          pagination: response.pagination,
        },
      });

      return {
        success: true,
        data: response.data,
        pagination: response.pagination,
      };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch facilities";
      dispatch(setError(errorMessage));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

// Get single facility action
export const getSingleFacility =
  (id: number, limit?: number) => async (dispatch: Dispatch) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      const response = await facilityService.getSingleFacility(id, limit);

      dispatch({
        type: types.GET_SINGLE_FACILITY_SUCCESS,
        payload: response,
      });

      return {
        success: true,
        data: response,
      };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        `Failed to fetch facility with ID: ${id}`;
      dispatch(setError(errorMessage));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

// Create facility action
export const createFacility =
  (facilityData: FacilityCreateUpdatePayload) => async (dispatch: Dispatch) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      const response = await facilityService.createFacility(facilityData);

      dispatch({
        type: types.CREATE_FACILITY_SUCCESS,
        payload: response,
      });

      return {
        success: true,
        data: response,
      };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to create facility";
      dispatch(setError(errorMessage));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

// Update facility action
export const updateFacility =
  (id: number, facilityData: FacilityCreateUpdatePayload) =>
  async (dispatch: Dispatch) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      const response = await facilityService.updateFacility(id, facilityData);

      dispatch({
        type: types.UPDATE_FACILITY_SUCCESS,
        payload: response,
      });

      return {
        success: true,
        data: response,
      };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        `Failed to update facility with ID: ${id}`;
      dispatch(setError(errorMessage));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

// Delete facility action
export const deleteFacility = (id: number) => async (dispatch: Dispatch) => {
  try {
    dispatch(setLoading(true));
    dispatch(setError(null));

    await facilityService.deleteFacility(id);

    dispatch({
      type: types.DELETE_FACILITY_SUCCESS,
      payload: id,
    });

    return {
      success: true,
      message: "Facility deleted successfully",
    };
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      `Failed to delete facility with ID: ${id}`;
    dispatch(setError(errorMessage));
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
};

// Get facility dropdown action
export const getFacilityDropdown = () => async (dispatch: Dispatch) => {
  try {
    dispatch(setLoading(true));
    dispatch(setError(null));

    const response = await facilityService.getFacilityDropdown();

    dispatch({
      type: types.GET_FACILITY_DROPDOWN_SUCCESS,
      payload: response,
    });

    return {
      success: true,
      data: response,
    };
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to fetch facility dropdown";
    dispatch(setError(errorMessage));
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
};

// Get sports dropdown action
export const getSportsDropdown =
  (venueId?: number) => async (dispatch: Dispatch) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      const response = await facilityService.getSportsDropdown(venueId);

      // Debug: Log the response to see its structure
      console.log("Sports dropdown API response:", response);

      // Handle different possible response structures
      let sportsData = [];
      if (response?.data) {
        sportsData = Array.isArray(response.data)
          ? response.data
          : [response.data];
      } else if (Array.isArray(response)) {
        sportsData = response;
      } else {
        console.warn("Unexpected response structure:", response);
      }

      dispatch({
        type: types.GET_SPORTS_DROPDOWN_SUCCESS,
        payload: sportsData, // Make sure we're dispatching an array
      });

      return {
        success: true,
        data: sportsData,
      };
    } catch (error: any) {
      console.error("Sports dropdown error:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to fetch sports dropdown";
      dispatch(setError(errorMessage));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

// Updated action creator with better facility name handling
export const getZonesByFacility =
  (facilityId: number, page = 1, limit = 10) =>
  async (dispatch: Dispatch) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      const response = await facilityService.getZonesByFacility(
        facilityId,
        page,
        limit
      );

      // Extract facility_name from multiple possible sources
      let facilityName = "Unknown Facility";

      // Priority 1: Direct facility_name from response root
      if (response.facility_name) {
        facilityName = response.facility_name;
      }
      // Priority 2: facility_name from first zone
      else if (
        response.data &&
        response.data.length > 0 &&
        response.data[0].facility_name
      ) {
        facilityName = response.data[0].facility_name;
      }
      // Priority 3: Keep as fallback
      else {
        facilityName = `Facility ${facilityId}`;
      }

      // Transform the response to match the expected structure
      const transformedData = (response.data || response || []).map(
        (zone: any) => ({
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
          facility_name: zone.facility_name || facilityName, // Use zone's facility_name or fallback
          originalData: zone,
        })
      );

      // Handle pagination from different response structures
      const pagination = {
        hasNextPage:
          response.pagination?.hasNextPage || response.hasNextPage || false,
        hasPrevPage:
          response.pagination?.hasPrevPage || response.hasPrevPage || false,
        currentPage:
          response.pagination?.currentPage || response.currentPage || page,
        totalPages: response.pagination?.totalPages || response.totalPages || 1,
        totalItems:
          response.pagination?.totalItems ||
          response.totalItems ||
          response.total ||
          transformedData.length,
        itemsPerPage:
          response.pagination?.itemsPerPage || response.itemsPerPage || limit,
      };

      dispatch({
        type: types.GET_ZONES_BY_FACILITY,
        payload: {
          zones: transformedData,
          pagination: pagination,
          facilityName: facilityName, // This should now have the correct facility name
        },
      });

      return {
        success: true,
        data: transformedData,
        pagination: pagination,
        facilityName: facilityName,
      };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        `Failed to fetch zones for facility ID: ${facilityId}`;
      dispatch(setError(errorMessage));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };
