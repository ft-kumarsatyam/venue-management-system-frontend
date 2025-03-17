export interface Facility {
  id: number;
  name: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  contactPhone?: string;
  contactEmail?: string;
  capacity?: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface FacilityCreateUpdatePayload {
  name: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  contactPhone?: string;
  contactEmail?: string;
  capacity?: number;
  isActive?: boolean;
}

export interface FacilityDropdownItem {
  id: number;
  facility_name: string;
}