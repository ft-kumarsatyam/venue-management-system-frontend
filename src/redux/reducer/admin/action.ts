import { AppDispatch } from "@/redux/store";
import * as types from "./actionTypes";
import axiosInstance from "@/api/axiosInstance";
import {
  FETCH_ALL_ADMIN_LIST,
  FETCH_ADMIN_BY_ID,
  CREATE_SUBADMIN,
  FETCH_CLUSTER_DROPDOWN,
  FETCH_VENUE_DROPDOWN,
} from "@/api/api_endpoints";

export interface CreateSubadminData {
  name: string;
  email: string;
  phone: string;
  password: string;
  venue_id: string;
  cluster_id: string;
  image_url?: string | null;
}

export const getAdminData =
  (page: number = 1, limit: number = 10) =>
  async (dispatch: AppDispatch) => {
    try {
      dispatch({ type: types.FETCH_ADMIN_REQUEST });

      let url = FETCH_ALL_ADMIN_LIST();
      const separator = url.includes("?") ? "&" : "?";
      url = `${url}${separator}page=${page}&limit=${limit}`;

      const response = await axiosInstance.get(url);

      const pagination = {
        totalItems: response.data.totalItems,
        totalPages: response.data.totalPages,
        currentPage: response.data.currentPage,
        itemsPerPage: response.data.itemsPerPage,
        hasNextPage: response.data.hasNextPage,
        hasPrevPage: response.data.hasPrevPage,
      };

      return dispatch({
        type: types.FETCH_ADMIN_SUCCESS,
        payload: {
          admin: response.data.data,
          pagination: pagination,
        },
      });
    } catch (error) {
      console.log(error);
      dispatch({
        type: types.FETCH_ADMIN_FAILURE,
        payload:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
      throw error;
    }
  };

export const getAdminById =
  (id: string | number) => async (dispatch: AppDispatch) => {
    try {
      dispatch({ type: types.FETCH_ADMIN_BY_ID_REQUEST });

      const response = await axiosInstance.get(FETCH_ADMIN_BY_ID(id));

      dispatch({
        type: types.FETCH_ADMIN_BY_ID_SUCCESS,
        payload: response.data,
      });

      return response.data;
    } catch (error: any) {
      console.log(error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch admin details";
      dispatch({
        type: types.FETCH_ADMIN_BY_ID_FAILURE,
        payload: errorMessage,
      });
      throw error;
    }
  };

export const createSubadmin = async (
  dispatch: AppDispatch,
  data: CreateSubadminData
) => {
  try {
    dispatch({ type: types.CREATE_SUBADMIN_REQUEST });

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("email", data.email);
    formData.append("phone", data.phone);
    formData.append("password", data.password);
    formData.append("venue_id", data.venue_id);
    formData.append("cluster_id", data.cluster_id);

    if (data.image_url) {
      formData.append("image_url", data.image_url);
    }

    const response = await axiosInstance.post(CREATE_SUBADMIN(), formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    dispatch({
      type: types.CREATE_SUBADMIN_SUCCESS,
      payload: response.data,
    });

    return response.data;
  } catch (error: any) {
    console.log(error);
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "An unknown error occurred";
    dispatch({
      type: types.CREATE_SUBADMIN_FAILURE,
      payload: errorMessage,
    });
    throw error;
  }
};

// Fetch Cluster Dropdown Action
export const fetchClusterDropdown = async (dispatch: AppDispatch) => {
  try {
    dispatch({ type: types.FETCH_CLUSTER_DROPDOWN_REQUEST });
    const response = await axiosInstance.get(FETCH_CLUSTER_DROPDOWN());

    dispatch({
      type: types.FETCH_CLUSTER_DROPDOWN_SUCCESS,
      payload: response.data.data || response.data,
    });

    return response.data;
  } catch (error: any) {
    console.log(error);
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch clusters";
    dispatch({
      type: types.FETCH_CLUSTER_DROPDOWN_FAILURE,
      payload: errorMessage,
    });
    throw error;
  }
};

// Fetch Venue Dropdown Action
export const fetchVenueDropdown = async (
  dispatch: AppDispatch,
  clusterId: string
) => {
  try {
    dispatch({ type: types.FETCH_VENUE_DROPDOWN_REQUEST });
    const response = await axiosInstance.get(FETCH_VENUE_DROPDOWN(clusterId));

    dispatch({
      type: types.FETCH_VENUE_DROPDOWN_SUCCESS,
      payload: response.data.data || response.data,
    });

    return response.data;
  } catch (error: any) {
    console.log(error);
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch venues";
    dispatch({
      type: types.FETCH_VENUE_DROPDOWN_FAILURE,
      payload: errorMessage,
    });
    throw error;
  }
};
