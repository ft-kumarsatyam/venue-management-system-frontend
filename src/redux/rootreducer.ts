// src/redux/rootReducer.ts
import { combineReducers } from "redux";
import clusterReducer from "./reducer/cluster/reducer";
import venueReducer from "./reducer/venue/reducer";
import zoneReducer from "./reducer/zones/reducer";
import facilityReducer from "./reducer/facilities/reducer";
import adminReducer from "./reducer/admin/reducer";

const rootReducer = combineReducers({
  cluster: clusterReducer,
  venue: venueReducer,
  zone: zoneReducer,
  facility: facilityReducer,
  admins: adminReducer
  // Add more here
});

export default rootReducer;