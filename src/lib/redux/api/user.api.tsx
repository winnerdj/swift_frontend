import {apiSlice} from '../api';

type createUser = {
    user_name: string;
    user_role: string;
    // user_password: string;
    // user_status: string;
    user_email: string;
    user_first_name: string;
    user_middle_name: string;
    user_last_name: string;
    user_contact_person: string;
    user_contact_no: string;
    user_address: string;
}

type updateUser = {
    user_name: string;
    user_role: string;
    // user_password: string;
    user_status: boolean;
    user_email: string;
    user_first_name: string;
    user_middle_name: string;
    user_last_name: string;
    user_contact_person: string;
    user_contact_no: string;
    user_address: string;
}

export const { useCreateUserMutation, useUpdateUserMutation } = apiSlice.injectEndpoints({
    endpoints: builder => ({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        createUser: builder.mutation<any,createUser>({
            query: (args) => ({
                url: '/user',
                method: 'POST',
                body: args
            }),
            invalidatesTags:['Table']
        }),
        updateUser: builder.mutation<any, updateUser>({
            query: (args) => ({
                url: '/user',
                method: 'PUT',
                body: args,
            }),
            invalidatesTags:['Table']
        })
    })
})
