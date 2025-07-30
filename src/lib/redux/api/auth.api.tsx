import { apiSlice } from "../api";

interface LoginRequest {
    user_id: string;
    user_password: string;
}

interface LoginResponse {
    user_id?: string | undefined;
    token?: {
        app_key: string | undefined;
        expiry: string | undefined;
        "x-access-token": string | undefined;
    };
    userDetails?: {
        user_role: string | undefined;
        user_email: string | undefined;
        user_location: string | undefined;
        user_name: string | undefined;
    }
}

type updatePasswordRequest = {
    user_id: string | undefined;
    current_password: string;
    new_password: string;
}

export const { useLoginMutation, useUpdatePasswordMutation } = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation<LoginResponse, LoginRequest>({
            query: (credentials) => ({
                url: "/auth/token/user",
                method: "POST",
                body: credentials,
            }),
        }),
        updatePassword: builder.mutation<any, updatePasswordRequest>({
            query: (args) => ({
                url: '/auth/password_change',
                method: 'POST',
                body: args,
            })
        })
    }),
});
