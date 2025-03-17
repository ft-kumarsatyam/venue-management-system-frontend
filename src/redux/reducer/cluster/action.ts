import axiosInstance from "../../../api/axiosInstance";
import {
  FETCH_CLUSTERS_FAILURE,
  FETCH_CLUSTERS_REQUEST,
  FETCH_CLUSTERS_SUCCESS,
  CREATE_CLUSTER_REQUEST,
  CREATE_CLUSTER_SUCCESS,
  CREATE_CLUSTER_FAILURE,
  UPDATE_CLUSTER_REQUEST,
  UPDATE_CLUSTER_SUCCESS,
  UPDATE_CLUSTER_FAILURE,
  DELETE_CLUSTER_REQUEST,
  DELETE_CLUSTER_SUCCESS,
  DELETE_CLUSTER_FAILURE,
  FETCH_SINGLE_CLUSTER_REQUEST,
  FETCH_SINGLE_CLUSTER_SUCCESS,
  FETCH_SINGLE_CLUSTER_FAILURE,
  FETCH_CLUSTER_DROPDOWN_REQUEST,
  FETCH_CLUSTER_DROPDOWN_SUCCESS,
  FETCH_CLUSTER_DROPDOWN_FAILURE,
} from "./actionTypes";
import { AppDispatch } from "@/redux/store";

import {
  GET_ALL_CLUSTERS,
  CREATE_CLUSTER,
  UPDATE_CLUSTER,
  DELETE_CLUSTER,
  GET_SINGLE_CLUSTER,
  DROPDOWN_CLUSTER,
} from "../../../api/api_endpoints";


export const fetchClusters =
  (limit?: number) => async (dispatch: AppDispatch) => {
    try {
      dispatch({ type: FETCH_CLUSTERS_REQUEST });
      console.log(fetchClusters);

      let url = GET_ALL_CLUSTERS;
      if (limit) {
        const separator = url.includes("?") ? "&" : "?";
        url = `${url}${separator}limit=${limit}`;
      }

      const response = await axiosInstance.get(url);
      console.log(response);

      const pagination = {
        hasNextPage: response.data.hasNextPage,
        hasPrevPage: response.data.hasPrevPage,
        currentPage: response.data.currentPage,
      };

      const transformedData = response.data.data.map((cluster: any) => ({
        id: cluster.id,
        name: cluster.cluster_name,
        cluster_code: cluster.cluster_code, 
        supervisor_name: cluster.supervisor_name,
        capacity: cluster.cluster_radius,
        image_url: cluster.image_url,
        cluster_image_url: cluster.image_url,
        venue_image_url: cluster.image_url, 
        originalData: cluster,
      }));
      

      dispatch({
        type: FETCH_CLUSTERS_SUCCESS,
        payload: { cluster: transformedData, pagination },
      });
      console.log(response.data, "data for cluster");

      return { success: true };
    } catch (error) {
      console.error("Error fetching clusters:", error);
      dispatch({ type: FETCH_CLUSTERS_FAILURE, payload: error });
      return { success: false, error };
    }
  };

// Fetch a single cluster
export const fetchSingleCluster =
  (id: number) => async (dispatch: AppDispatch) => {
    try {
      dispatch({ type: FETCH_SINGLE_CLUSTER_REQUEST });
      const response = await axiosInstance.get(GET_SINGLE_CLUSTER(id));

      if (response.data && response.data.success) {
        dispatch({
          type: FETCH_SINGLE_CLUSTER_SUCCESS,
          payload: response.data,
        });
      } else {
        throw new Error("Failed to fetch cluster data");
      }
    } catch (error) {
      dispatch({
        type: FETCH_SINGLE_CLUSTER_FAILURE,
        payload: error,
      });
      return Promise.reject(error);
    }
  };

// Fetch clusters for dropdown
export const fetchClusterDropdown = async (dispatch: AppDispatch) => {
  try {
    dispatch({ type: FETCH_CLUSTER_DROPDOWN_REQUEST });
    const response = await axiosInstance.get(DROPDOWN_CLUSTER);

    return dispatch({
      type: FETCH_CLUSTER_DROPDOWN_SUCCESS,
      payload: response.data.data || [],
    });
  } catch (error) {
    console.error("Error fetching cluster dropdown:", error);
    dispatch({ type: FETCH_CLUSTER_DROPDOWN_FAILURE, payload: error });
    return Promise.reject(error);
  }
};

export const createCluster =
  (clusterData: FormData) => async (dispatch: AppDispatch) => {
    try {
      dispatch({ type: CREATE_CLUSTER_REQUEST });

      const response = await axiosInstance.post(CREATE_CLUSTER, clusterData);
      const data = response.data;

      if (
        response.status >= 200 &&
        response.status < 300 &&
        (!data || data.success !== false) &&
        (!data || !data.error)
      ) {
        dispatch({
          type: CREATE_CLUSTER_SUCCESS,
          payload: data,
        });

        dispatch(fetchClusters());

        return { type: CREATE_CLUSTER_SUCCESS, payload: data };
      } else {
        const errorMessage =
          data?.message || data?.error || "Unknown error occurred";

        dispatch({
          type: CREATE_CLUSTER_FAILURE,
          payload: { message: errorMessage },
        });

        return {
          type: CREATE_CLUSTER_FAILURE,
          payload: { message: errorMessage },
        };
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to create cluster";

      dispatch({
        type: CREATE_CLUSTER_FAILURE,
        payload: { message: errorMessage },
      });

      return {
        type: CREATE_CLUSTER_FAILURE,
        payload: { message: errorMessage },
      };
    }
  };

export const updateCluster = async (
  dispatch: AppDispatch,
  id: number,
  clusterData: FormData
) => {
  try {
    dispatch({ type: UPDATE_CLUSTER_REQUEST });
    console.log(`Updating cluster with ID: ${id}`);

    // Debug what's in the FormData
    console.log("Update payload (FormData contents):");
    clusterData.forEach((value, key) => {
      if (value instanceof File) {
        console.log(
          `${key}: File [${value.name}, ${value.type}, ${value.size} bytes]`
        );
      } else {
        console.log(`${key}: ${value}`);
      }
    });

    const response = await axiosInstance.put(UPDATE_CLUSTER(id), clusterData);

    console.log("Update response:", response.data);

    if (
      response.data &&
      (response.data.success === true || response.data.error === null)
    ) {
      dispatch({
        type: UPDATE_CLUSTER_SUCCESS,
        payload: response.data,
      });

      dispatch(fetchClusterDropdown);

      return response.data;
    } else {
      const errorMessage = response.data?.message || "Unknown error occurred";

      dispatch({
        type: UPDATE_CLUSTER_FAILURE,
        payload: { message: errorMessage },
      });

      return { error: true, message: errorMessage };
    }
  } catch (error: any) {
    console.error("Error in updateCluster action:", error.response || error);

    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to update cluster";

    dispatch({
      type: UPDATE_CLUSTER_FAILURE,
      payload: { message: errorMessage },
    });

    return { error: true, message: errorMessage };
  }
};

// Delete a cluster
export const deleteCluster = async (dispatch: AppDispatch, id: number) => {
  try {
    dispatch({ type: DELETE_CLUSTER_REQUEST });
    await axiosInstance.delete(DELETE_CLUSTER(id));
    dispatch({ type: DELETE_CLUSTER_SUCCESS, payload: id });

    // Re-fetch dropdown data to keep it in sync
    dispatch(fetchClusterDropdown);

    return true;
  } catch (error) {
    dispatch({ type: DELETE_CLUSTER_FAILURE, payload: error });
    return Promise.reject(error);
  }
};
