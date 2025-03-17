import { legacy_createStore as createStore, applyMiddleware } from "redux";
import { thunk } from "redux-thunk";
import rootReducer from "./rootreducer";

const store = createStore(
  rootReducer,
  applyMiddleware(thunk)
);
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>; //for useSelector
export default store;
