import * as types from "./actionTypes";

interface ZoneState {
  totalItems: number;
  zones: any[];
  loading: boolean;
  error: null | string;
  zoneDropdown: any[];
  selectedZone: any;
  pagination: {
    hasNextPage: boolean;
    hasPrevPage: boolean;
    currentPage: number;
    totalPages: number;
    totalItems: number;
  };
  createLoading: boolean;
  updateLoading: boolean;
  deleteLoading: boolean;
}

const initialState: ZoneState = {
  zones: [],
  loading: false,
  error: null,
  zoneDropdown: [],
  selectedZone: null,
  pagination: {
    hasNextPage: false,
    hasPrevPage: false,
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  },
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
  totalItems: 0
};

const zoneReducer = (state = initialState, action: any) => {
  switch (action.type) {
    // Fetch Zones
    case types.FETCH_ZONES_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case types.FETCH_ZONES_SUCCESS:
      return {
        ...state,
        loading: false,
        zones: action.payload.zones || [],
        pagination: {
          hasNextPage: action.payload.pagination?.hasNextPage || false,
          hasPrevPage: action.payload.pagination?.hasPrevPage || false,
          currentPage: action.payload.pagination?.currentPage || 1,
          totalPages: action.payload.pagination?.totalPages || 1,
          totalItems: action.payload.pagination?.totalItems || (action.payload.zones?.length || 0),
        },
        error: null,
      };

    case types.FETCH_ZONES_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        zones: [],
        pagination: initialState.pagination,
      };

    // Fetch Zone Details
    case types.FETCH_ZONE_DETAILS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case types.FETCH_ZONE_DETAILS_SUCCESS:
      return {
        ...state,
        loading: false,
        selectedZone: action.payload,
        error: null,
      };
    case types.FETCH_ZONE_DETAILS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // Create Zone
    case types.CREATE_ZONE_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case types.CREATE_ZONE_SUCCESS: {
      console.log(action.payload);
      return {
        ...state,
        zones: Array.isArray(state.zones)
          ? [...state.zones, action.payload]
          : [action.payload],
        loading: false,
        error: null,
        totalItems: state.totalItems + 1,
      };
    }
    case types.CREATE_ZONE_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // Update Zone
    case types.UPDATE_ZONE_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case types.UPDATE_ZONE_SUCCESS:
      return {
        ...state,
        zones: state.zones.map((zone: any) =>
          zone.id === action.payload.id ? action.payload : zone
        ),
        loading: false,
        error: null,
      };
    case types.UPDATE_ZONE_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // Delete Zone
    case types.DELETE_ZONE_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case types.DELETE_ZONE_SUCCESS:
      return {
        ...state,
        zones: state.zones.filter((zone: any) => zone.id !== action.payload),
        loading: false,
        error: null,
        totalItems: state.totalItems - 1,
      };
    case types.DELETE_ZONE_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // Fetch Zone Dropdown
    case types.FETCH_ZONE_DROPDOWN_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case types.FETCH_ZONE_DROPDOWN_SUCCESS:
      return {
        ...state,
        loading: false,
        zoneDropdown: action.payload,
        error: null,
      };
    case types.FETCH_ZONE_DROPDOWN_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    default:
      return state;
  }
};

export default zoneReducer;
