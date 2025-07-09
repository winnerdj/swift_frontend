import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

//## Define the dashboard state type
type DashboardState = {
    service_id: string | undefined;
    service_name: string | undefined;
    service_location: string | undefined;
};

//## Initial state
const initialDashboardState: DashboardState = {
    service_id: undefined,
    service_name: undefined,
    service_location: undefined,
};

//## Create dashboard slice
const dashboardSlice = createSlice({
    name: "dashboardState",
    initialState: initialDashboardState,
    reducers: {
        setDashboardState: (state, action: PayloadAction<Partial<DashboardState>>) => {
            Object.assign(state, action.payload);
        }
    },
});

//## Selectors
export const getDashboardState = (state: RootState): DashboardState => state.dashboardState;

//## Export actions & reducer
export const { setDashboardState } = dashboardSlice.actions;
export default dashboardSlice.reducer;