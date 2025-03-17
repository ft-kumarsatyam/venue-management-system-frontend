import Pagination from "@/components/ui/pagination";
import {
  FETCH_CLUSTERS_FAILURE,
  FETCH_CLUSTERS_REQUEST,
  FETCH_CLUSTERS_SUCCESS,
  FETCH_SINGLE_CLUSTER_REQUEST,
  FETCH_SINGLE_CLUSTER_SUCCESS,
  FETCH_SINGLE_CLUSTER_FAILURE,
  CREATE_CLUSTER_REQUEST,
  CREATE_CLUSTER_SUCCESS,
  CREATE_CLUSTER_FAILURE,
  UPDATE_CLUSTER_REQUEST,
  UPDATE_CLUSTER_SUCCESS,
  UPDATE_CLUSTER_FAILURE,
  DELETE_CLUSTER,
  DELETE_CLUSTER_REQUEST,
  DELETE_CLUSTER_SUCCESS,
  DELETE_CLUSTER_FAILURE,
  FETCH_CLUSTER_DROPDOWN_REQUEST,
  FETCH_CLUSTER_DROPDOWN_SUCCESS,
  FETCH_CLUSTER_DROPDOWN_FAILURE,
} from "./actionTypes";

interface ClusterState {
  loading: boolean;
  singleClusterLoading: boolean;
  clusters: any[];
  dropdownOptions: any[];
  dropdownLoading: boolean;
  currentCluster: any;
  error: any;
  createLoading?: boolean;
  updateLoading?: boolean;
  deleteLoading?: boolean;
  pagination: {
    hasNextPage: boolean;
    hasPrevPage: boolean;
    currentPage: number;
  };
  // hasNextPage?: boolean;
  // hasPrevPage?: boolean;
}

const initialState: ClusterState = {
  loading: false,
  singleClusterLoading: false,
  clusters: [],
  dropdownOptions: [],
  dropdownLoading: false,
  currentCluster: null,
  error: false,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
  pagination: { hasNextPage: false, hasPrevPage: false, currentPage: 1 },
  // hasNextPage: false,
  // hasPrevPage: false.
};

const reducer = (state = initialState, action: any) => {
  switch (action.type) {
    // Fetch clusters
    case FETCH_CLUSTERS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case FETCH_CLUSTERS_SUCCESS:
      return {
        ...state,
        loading: false,
        clusters: action.payload.cluster || [], 
        pagination: {
          ...state.pagination,
          ...action.payload.pagination,
          totalItems: action.payload.cluster?.length || 0, 
        },
        error: null,
      };

    case FETCH_CLUSTERS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        clusters: [],
        pagination: initialState.pagination,
      };

    // Fetch single cluster
    case FETCH_SINGLE_CLUSTER_REQUEST:
      return { ...state, singleClusterLoading: true, error: false };
    case FETCH_SINGLE_CLUSTER_SUCCESS:
      // Store the entire API response which has the structure:
      // { message, success, error, data }
      return {
        ...state,
        singleClusterLoading: false,
        currentCluster: action.payload,
      };
    case FETCH_SINGLE_CLUSTER_FAILURE:
      return { ...state, singleClusterLoading: false, error: action.payload };

    // Fetch cluster dropdown
    case FETCH_CLUSTER_DROPDOWN_REQUEST:
      return { ...state, dropdownLoading: true, error: false };
    case FETCH_CLUSTER_DROPDOWN_SUCCESS:
      return {
        ...state,
        dropdownLoading: false,
        dropdownOptions: action.payload,
      };
    case FETCH_CLUSTER_DROPDOWN_FAILURE:
      return { ...state, dropdownLoading: false, error: action.payload };

    // Create cluster
    case CREATE_CLUSTER_REQUEST:
      return { ...state, createLoading: true };
    case CREATE_CLUSTER_SUCCESS:
      return {
        ...state,
        createLoading: false,
        clusters: [...state.clusters, action.payload],
      };
    case CREATE_CLUSTER_FAILURE:
      return { ...state, createLoading: false, error: action.payload };

    // Update cluster
    case UPDATE_CLUSTER_REQUEST:
      return { ...state, updateLoading: true };
    case UPDATE_CLUSTER_SUCCESS:
      return {
        ...state,
        updateLoading: false,
        clusters: state.clusters.map((cluster) =>
          cluster.id === action.payload.id ? action.payload : cluster
        ),
        currentCluster: action.payload,
      };
    case UPDATE_CLUSTER_FAILURE:
      return { ...state, updateLoading: false, error: action.payload };

    // Delete cluster
    case DELETE_CLUSTER_REQUEST:
      return { ...state, deleteLoading: true };
    case DELETE_CLUSTER_SUCCESS:
      return {
        ...state,
        deleteLoading: false,
        clusters: state.clusters.filter(
          (cluster) => cluster.id !== action.payload
        ),
        currentCluster:
          state.currentCluster?.id === action.payload
            ? null
            : state.currentCluster,
      };
    case DELETE_CLUSTER:
      return {
        ...state,
        clusters: state.clusters.filter(
          (cluster) => cluster.id !== action.payload
        ),
        currentCluster:
          state.currentCluster?.id === action.payload
            ? null
            : state.currentCluster,
      };
    case DELETE_CLUSTER_FAILURE:
      return { ...state, deleteLoading: false, error: action.payload };

    default:
      return state;
  }
};

export default reducer;
