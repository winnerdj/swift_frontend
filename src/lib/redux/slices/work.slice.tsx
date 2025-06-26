import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store"; // Assuming your store is set up to have 'workLog' as the key

//## Define the auth state type
type WorkState = {
    user_id: string | undefined;
    activity: string | undefined;
    service_id: string | undefined;
    service_name: string | undefined;
    location: string | undefined;
    location_desc: string | undefined;
    counter: number | undefined;
    user_status: string | undefined;
    reason_code: string | undefined;
};

//## Initial state
const initialWorkState: WorkState = {
    user_id: undefined,
    activity: undefined,
    service_id: undefined,
    service_name: undefined,
    location: undefined,
    location_desc: undefined,
    counter: undefined,
    user_status: undefined,
    reason_code: undefined,
};

//## Create auth slice
const workSlice = createSlice({
    name: "workSession",
    initialState: initialWorkState, // Corrected: Use 'initialState' property
    reducers: {
        setWorkSession: (state, action: PayloadAction<Partial<WorkState>>) => {
            // Corrected: More specific type for payload (Partial<WorkState>)
            Object.assign(state, action.payload); //## Mutate state directly (recommended by RTK)
        },
        setQueueLogOut: () => initialWorkState, //## Reset state on logout
    },
});

//## Selectors
export const getWorkSession = (state: RootState): WorkState => state.workSession; // Corrected: Access state.workLog

//## Export actions & reducer
export const { setWorkSession, setQueueLogOut } = workSlice.actions;
export default workSlice.reducer;