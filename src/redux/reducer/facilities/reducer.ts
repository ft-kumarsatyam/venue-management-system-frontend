import { ReactNode } from "react";
import * as types from "./actionTypes";
import { Facility } from "./types";

interface FacilityState {
  facilities: {
    data: Facility[];
    total: number;
  };
  currentFacility: Facility | null;
  facility: { data: Facility | null }; // For single facility data
  facilityDropdown: { id: number; facility_name: string }[];
  sportsDropdown: {
    sport_name: ReactNode;
    sport_id: any;
    id: number;
    name: string;
  }[];
  zonesByFacility: any[] | null | object;
  // zonesByFacility: ZonesByFacilityData | null;
  zonesPagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  loading: boolean;
  error: string | null;
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

const initialState: FacilityState = {
  facilities: {
    data: [],
    total: 0,
  },
  currentFacility: null,
  facility: { data: null },
  facilityDropdown: [],
  sportsDropdown: [],
  zonesByFacility: [],
  zonesPagination: {
    totalItems: 0,
    totalPages: 0,
    currentPage: 1,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false,
  },
  loading: false,
  error: null,
  pagination: {
    totalItems: 0,
    totalPages: 0,
    currentPage: 1,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false,
  },
};




const facilityReducer = (state = initialState, action: any): FacilityState => {
  switch (action.type) {
    case types.FACILITY_LOADING:
      return {
        ...state,
        loading: action.payload,
        error: null,
      };

    case types.FACILITY_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case types.GET_ALL_FACILITIES_SUCCESS:
      return {
        ...state,
        facilities: {
          data: action.payload.data || [],
          total: action.payload.total || 0,
        },
        pagination: {
          totalItems:
            action.payload.pagination?.totalItems || action.payload.total || 0,
          totalPages: action.payload.pagination?.totalPages || 1,
          currentPage: action.payload.pagination?.currentPage || 1,
          itemsPerPage: action.payload.pagination?.itemsPerPage || 10,
          hasNextPage: action.payload.pagination?.hasNextPage || false,
          hasPrevPage: action.payload.pagination?.hasPrevPage || false,
        },
        loading: false,
        error: null,
      };


          // Updated GET_ZONES_BY_FACILITY case in your facility reducer
    case types.GET_ZONES_BY_FACILITY:
      return {
        ...state,
        zonesByFacility: {
          data: action.payload.zones || [],
          facilityName: action.payload.facilityName || "Unknown Facility",
          pagination: {
            totalItems: action.payload.pagination?.totalItems || 0,
            totalPages: action.payload.pagination?.totalPages || 1,
            currentPage: action.payload.pagination?.currentPage || 1,
            itemsPerPage: action.payload.pagination?.itemsPerPage || 10,
            hasNextPage: action.payload.pagination?.hasNextPage || false,
            hasPrevPage: action.payload.pagination?.hasPrevPage || false,
          },
        },
        loading: false,
        error: null,
      };

      
    case types.GET_SINGLE_FACILITY_SUCCESS:
      return {
        ...state,
        currentFacility: action.payload,
        loading: false,
        error: null,
      };

    case types.CREATE_FACILITY_SUCCESS:
      return {
        ...state,
        facilities: {
          ...state.facilities,
          data: [...state.facilities.data, action.payload],
          total: state.facilities.total + 1,
        },
        currentFacility: action.payload,
        loading: false,
        error: null,
      };

    case types.UPDATE_FACILITY_SUCCESS:
      return {
        ...state,
        facilities: {
          ...state.facilities,
          data: state.facilities.data.map((facility) =>
            facility.id === action.payload.id ? action.payload : facility
          ),
        },
        currentFacility: action.payload,
        loading: false,
        error: null,
      };

    case types.DELETE_FACILITY_SUCCESS:
      return {
        ...state,
        facilities: {
          ...state.facilities,
          data: state.facilities.data.filter(
            (facility) => facility.id !== action.payload
          ),
          total: state.facilities.total - 1,
        },
        currentFacility:
          state.currentFacility?.id === action.payload
            ? null
            : state.currentFacility,
        loading: false,
        error: null,
      };

    case types.GET_FACILITY_DROPDOWN_SUCCESS:
      return {
        ...state,
        facilityDropdown: action.payload,
        loading: false,
        error: null,
      };

      case types.GET_SPORTS_DROPDOWN_SUCCESS:
        console.log('Reducer - Sports dropdown payload:', action.payload);
        return {
          ...state,
          sportsDropdown: Array.isArray(action.payload) ? action.payload : [],
          loading: false,
          error: null,
        };

    case types.RESET_FACILITY_STATE:
      return initialState;

    case types.RESET_FACILITY_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

export default facilityReducer;
