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
  FETCH_DROPDOWN_VENUES_REQUEST,
  FETCH_DROPDOWN_VENUES_SUCCESS,
  FETCH_DROPDOWN_VENUES_FAILURE,
  FETCH_FACILITIES_BY_VENUE_REQUEST,
  FETCH_FACILITIES_BY_VENUE_SUCCESS,
  FETCH_FACILITIES_BY_VENUE_FAILURE,
} from "./actionTypes";

export interface Venue {
  amenities(amenities: any): unknown;
  zones: any;
  venue_radius: number | undefined;
  geofencing_type: string;
  venue_description: string;
  venue_address: string;
  image_url: string;
  id: number;
  venue_code: string;
  venue_name: string;
  supervisor_name?: string | null;
  supervisor_contact?: string | null;
  supervisor_email?: string | null;
  supervisor_id?: number | null;
  venue_capacity: number;
  venue_image_url?: string | null;
  facilities?: any[];
  coordinates?: string;
  cluster_id?: number;
  parent_cluster?: {
    cluster_name: string;
    id: number;
  } | null;
  zones_count?: number;
  facilities_count?: number;
  originalData?: any;
}

export interface Facility {
  id: number;
  facility_name?: string;
  facility_code: string;
  facility_radius: number;
  facility_capacity: number;
  geofencing_type: string;
  coordinates: { latitude: string | number; longitude: string | number };
  facility_amenities?: string | string[];
  facility_image_url: string | null;
  supervisor_name?: string;
  supervisor_contact: string;
  supervisor_email: string;
  supervisor_id?: number;
  venue_id: number;
  zones_count?: number;
  [key: string]: any;
}

export interface VenueState {
  venues: Venue[];
  dropdownVenues: Venue[];
  facilities: Facility[];
  facilitiesData: any;
  selectedVenue: Venue | null;
  loading: boolean;
  error: Error | null;
  dropdownLoading: boolean;
  dropdownError: Error | null;
  facilitiesLoading: boolean;
  facilitiesError: Error | null;
  createLoading: boolean;
  updateLoading: boolean;
  deleteLoading: boolean;

  // Venues pagination
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };

  // Facilities pagination - separate from venues pagination
  facilitiesPagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };

  // Keep backward compatibility for venues
  totalItems: number;
  currentPage: number;
  totalPages: number;
}

const initialState: VenueState = {
  venues: [],
  dropdownVenues: [],
  facilities: [],
  facilitiesData: null,
  selectedVenue: null,
  loading: false,
  error: null,
  dropdownLoading: false,
  dropdownError: null,
  facilitiesLoading: false,
  facilitiesError: null,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,

  // Venues pagination
  pagination: {
    totalItems: 0,
    totalPages: 0,
    currentPage: 1,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false,
  },

  // Facilities pagination
  facilitiesPagination: {
    totalItems: 0,
    totalPages: 0,
    currentPage: 1,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false,
  },

  // Backward compatibility for venues
  totalItems: 0,
  currentPage: 1,
  totalPages: 1,
};

const venueReducer = (state = initialState, action: any): VenueState => {
  switch (action.type) {
    // ✅ Fetch all venues
    case FETCH_VENUES_REQUEST:
      return { ...state, loading: true, error: null };

    case FETCH_VENUES_SUCCESS:
      return {
        ...state,
        loading: false,
        venues: action.payload.venues || [],
        pagination: action.payload.pagination || initialState.pagination,
        // Backward compatibility
        totalItems: action.payload.pagination?.totalItems || 0,
        currentPage: action.payload.pagination?.currentPage || 1,
        totalPages: action.payload.pagination?.totalPages || 1,
        error: null,
      };

    case FETCH_VENUES_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        venues: [],
        pagination: initialState.pagination,
        totalItems: 0,
        currentPage: 1,
        totalPages: 1,
      };

    // ✅ Fetch single venue
    case FETCH_VENUE_REQUEST:
      return { ...state, loading: true, error: null };
    case FETCH_VENUE_SUCCESS:
      return { ...state, selectedVenue: action.payload, loading: false };
    case FETCH_VENUE_FAILURE:
      return { ...state, loading: false, error: action.payload };

    // ✅ Create venue
    case CREATE_VENUE_REQUEST:
      return { ...state, createLoading: true, error: null };
    case CREATE_VENUE_SUCCESS:
      return {
        ...state,
        venues: [...state.venues, action.payload],
        totalItems: state.totalItems + 1,
        pagination: {
          ...state.pagination,
          totalItems: state.pagination.totalItems + 1,
        },
        createLoading: false,
      };
    case CREATE_VENUE_FAILURE:
      return { ...state, createLoading: false, error: action.payload };

    // ✅ Update venue
    case UPDATE_VENUE_REQUEST:
      return { ...state, updateLoading: true, error: null };
    case UPDATE_VENUE_SUCCESS:
      return {
        ...state,
        venues: state.venues.map((venue) =>
          venue.id === action.payload.id ? action.payload : venue
        ),
        updateLoading: false,
      };
    case UPDATE_VENUE_FAILURE:
      return { ...state, updateLoading: false, error: action.payload };

    // ✅ Delete venue
    case DELETE_VENUE_REQUEST:
      return { ...state, deleteLoading: true, error: null };
    case DELETE_VENUE_SUCCESS:
      return {
        ...state,
        venues: state.venues.filter((venue) => venue.id !== action.payload),
        totalItems: Math.max(0, state.totalItems - 1),
        pagination: {
          ...state.pagination,
          totalItems: Math.max(0, state.pagination.totalItems - 1),
        },
        deleteLoading: false,
      };
    case DELETE_VENUE_FAILURE:
      return { ...state, deleteLoading: false, error: action.payload };

    // ✅ Dropdown venues
    case FETCH_DROPDOWN_VENUES_REQUEST:
      return { ...state, dropdownLoading: true, dropdownError: null };
    case FETCH_DROPDOWN_VENUES_SUCCESS:
      return {
        ...state,
        dropdownVenues: action.payload,
        dropdownLoading: false,
      };
    case FETCH_DROPDOWN_VENUES_FAILURE:
      return {
        ...state,
        dropdownLoading: false,
        dropdownError: action.payload,
      };

    // ✅ Fetch facilities by venue with proper pagination
    case FETCH_FACILITIES_BY_VENUE_REQUEST:
      return {
        ...state,
        facilitiesLoading: true,
        facilitiesError: null,
      };

    case FETCH_FACILITIES_BY_VENUE_SUCCESS:
      return {
        ...state,
        facilitiesData: action.payload.facilitiesData,
        facilitiesPagination:
          action.payload.pagination || initialState.facilitiesPagination,
        facilities: action.payload.facilitiesData?.data || [],
        facilitiesLoading: false,
        facilitiesError: null,
      };

    case FETCH_FACILITIES_BY_VENUE_FAILURE:
      return {
        ...state,
        facilitiesLoading: false,
        facilitiesError: action.payload,
        facilitiesData: null,
        facilities: [],
        facilitiesPagination: initialState.facilitiesPagination,
      };

    default:
      return state;
  }
};

export default venueReducer;
