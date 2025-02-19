import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

//## Define the auth state type
type AuthState = {
    user_id: string | undefined;
    token?: {
        app_key: string | undefined;
        expiry: string | undefined;
        "x-access-token": string | undefined;
    };
};

//## Initial state
const initialState: AuthState = {
    user_id: undefined,
    token: undefined
};

//## Create auth slice
const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setLogin: (state, action: PayloadAction<AuthState>) => {
            Object.assign(state, action.payload); //## Mutate state directly (recommended by RTK)
        },
        setLogOut: () => initialState, //## Reset state on logout
    },
});

//## Selectors
export const getAccessToken = (state: RootState) => state.auth.token;
export const getSession = (state: RootState): AuthState => state.auth;

//### Export actions & reducer
export const { setLogin, setLogOut } = authSlice.actions;
export default authSlice.reducer;
