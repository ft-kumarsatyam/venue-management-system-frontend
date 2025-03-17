import {
  FETCH_ADMIN_FAILURE,
  FETCH_ADMIN_REQUEST,
  FETCH_ADMIN_SUCCESS,
  FETCH_ADMIN_BY_ID_REQUEST,
  FETCH_ADMIN_BY_ID_SUCCESS,
  FETCH_ADMIN_BY_ID_FAILURE,
  CREATE_SUBADMIN_REQUEST,
  CREATE_SUBADMIN_SUCCESS,
  CREATE_SUBADMIN_FAILURE,
  FETCH_CLUSTER_DROPDOWN_REQUEST,
  FETCH_CLUSTER_DROPDOWN_SUCCESS,
  FETCH_CLUSTER_DROPDOWN_FAILURE,
  FETCH_VENUE_DROPDOWN_REQUEST,
  FETCH_VENUE_DROPDOWN_SUCCESS,
  FETCH_VENUE_DROPDOWN_FAILURE,
} from "./actionTypes";

interface AdminState {
  loading: boolean;
  admins: any[];
  error: any;
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  // Fetch admin by ID states
  adminByIdLoading: boolean;
  selectedAdmin: any;
  adminByIdError: any;
  // Create subadmin states
  createLoading: boolean;
  createSuccess: boolean;
  createError: any;
  createdAdmin: any;
  // Cluster dropdown states
  clusterLoading: boolean;
  clusters: any[];
  clusterError: any;
  // Venue dropdown states
  venueLoading: boolean;
  venues: any[];
  venueError: any;
}

const initialState: AdminState = {
  loading: false,
  admins: [],
  error: false,
  pagination: {
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false,
  },
  // Fetch admin by ID initial states
  adminByIdLoading: false,
  selectedAdmin: null,
  adminByIdError: null,
  // Create subadmin initial states
  createLoading: false,
  createSuccess: false,
  createError: null,
  createdAdmin: null,
  // Cluster dropdown initial states
  clusterLoading: false,
  clusters: [],
  clusterError: null,
  // Venue dropdown initial states
  venueLoading: false,
  venues: [],
  venueError: null,
};

const adminReducer = (state = initialState, action: any) => {
  switch (action.type) {
    // Fetch Admin Cases
    case FETCH_ADMIN_REQUEST:
      return { ...state, loading: true, error: false };
    case FETCH_ADMIN_SUCCESS:
      return {
        ...state,
        loading: false,
        admins: action.payload.admin,
        pagination: action.payload.pagination,
        error: false,
      };
    case FETCH_ADMIN_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        admins: [],
        pagination: initialState.pagination,
      };

    // Fetch Admin by ID Cases
    case FETCH_ADMIN_BY_ID_REQUEST:
      return {
        ...state,
        adminByIdLoading: true,
        adminByIdError: null,
        selectedAdmin: null,
      };
    case FETCH_ADMIN_BY_ID_SUCCESS:
      return {
        ...state,
        adminByIdLoading: false,
        selectedAdmin: action.payload.data,
        adminByIdError: null,
      };
    case FETCH_ADMIN_BY_ID_FAILURE:
      return {
        ...state,
        adminByIdLoading: false,
        adminByIdError: action.payload,
        selectedAdmin: null,
      };

    // Create Subadmin Cases
    case CREATE_SUBADMIN_REQUEST:
      return {
        ...state,
        createLoading: true,
        createError: null,
        createSuccess: false,
      };
    case CREATE_SUBADMIN_SUCCESS:
      return {
        ...state,
        createLoading: false,
        createSuccess: true,
        createdAdmin: action.payload,
        admins: [...state.admins, action.payload], // Add new admin to the list
      };
    case CREATE_SUBADMIN_FAILURE:
      return {
        ...state,
        createLoading: false,
        createError: action.payload,
        createSuccess: false,
      };

    // Fetch Cluster Dropdown Cases
    case FETCH_CLUSTER_DROPDOWN_REQUEST:
      return {
        ...state,
        clusterLoading: true,
        clusterError: null,
      };
    case FETCH_CLUSTER_DROPDOWN_SUCCESS:
      return {
        ...state,
        clusterLoading: false,
        clusters: action.payload,
      };
    case FETCH_CLUSTER_DROPDOWN_FAILURE:
      return {
        ...state,
        clusterLoading: false,
        clusterError: action.payload,
      };

    // Fetch Venue Dropdown Cases
    case FETCH_VENUE_DROPDOWN_REQUEST:
      return {
        ...state,
        venueLoading: true,
        venueError: null,
      };
    case FETCH_VENUE_DROPDOWN_SUCCESS:
      return {
        ...state,
        venueLoading: false,
        venues: action.payload,
      };
    case FETCH_VENUE_DROPDOWN_FAILURE:
      return {
        ...state,
        venueLoading: false,
        venueError: action.payload,
        venues: [], // Clear venues on error
      };

    default:
      return state;
  }
};

export default adminReducer;