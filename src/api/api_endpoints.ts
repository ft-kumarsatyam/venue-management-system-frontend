// // API BASE URL
// export const API_BASE_URL = "http://localhost:3500";

// ===================== AUTH =====================
export const LOGIN_URL = "/login";

// ===================== DASHBOARD =====================
export const GET_DASHBOARD_DATA = "/admin/dash";

// ===================== CLUSTER =====================
export const CREATE_CLUSTER = "/cluster";
export const GET_ALL_CLUSTERS = "/cluster";
export const GET_SINGLE_CLUSTER = (id: number) => `/cluster/${id}`;
export const UPDATE_CLUSTER = (id: number) => `/cluster/${id}`;
export const DELETE_CLUSTER = (id: number) => `/cluster/${id}`;
export const DROPDOWN_CLUSTER = "/dropdown/cluster";

// ===================== VENUE =====================
export const CREATE_VENUE = "/venue";
export const GET_SINGLE_VENUE = (id: number) => `/venue/${id}`;
export const GET_ALL_VENUES = "/venue";
export const UPDATE_VENUE = (id: number) => `/venue/${id}`;
export const DELETE_VENUE = (id: number) => `/venue/${id}`;
export const DROPDOWN_VENUE = "/dropdown/venue";

// ===================== ZONE =====================
export const CREATE_ZONE = "/zone";
export const GET_ALL_ZONES = "/zone";
export const GET_SINGLE_ZONE = (id: number, limit?: number) =>
  `/zone/${id}${limit ? `?limit=${limit}` : ""}`;
export const UPDATE_ZONE = (id: number) => `/zone/${id}`;
export const DELETE_ZONE = (id: number) => `/zone/${id}`;
export const DROPDOWN_ZONE = "/dropdown/zone";

// ===================== FACILITY =====================
export const CREATE_FACILITY = "/facility";
export const GET_ALL_FACILITIES = (limit?: number) =>
  `/facility${limit ? `?limit=${limit}` : ""}`;
export const GET_SINGLE_FACILITY = (id: number, limit?: number) =>
  `/facility/${id}${limit ? `?limit=${limit}` : ""}`;
export const UPDATE_FACILITY = "/facility";
export const DELETE_FACILITY = (id: number) => `/facility/${id}`;
export const DROPDOWN_FACILITY = "/dropdown/facility";
export const GET_FACILITIES_BY_VENUE = (venueId: number) =>
  `/facility?venue_id=${venueId}`;
export const DROPDOWN_SPORTS = (venueId?: number) =>
  `/dropdown/sports${venueId ? `?venue_id=${venueId}` : ""}`;
export const GET_ZONES_BY_FACILITY_ID = (facilityId: number) =>
  `/zone/getFacilitiesByZone?facilities_by_id=${facilityId}`;

// ===================== ADMIN =====================

export const FETCH_ALL_ADMIN_LIST = () => `/subadmin`;
export const FETCH_ADMIN_BY_ID = (id: string | number) => `/getDataById/${id}`;
export const CREATE_SUBADMIN = () => `/create/subadmin`;
export const FETCH_CLUSTER_DROPDOWN = () => `/dropdown/cluster`;
export const FETCH_VENUE_DROPDOWN = (clusterId: string) => `/dropdown/venue?cluster_id=${clusterId}`;