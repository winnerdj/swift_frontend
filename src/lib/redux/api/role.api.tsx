import {apiSlice} from '../api';

type createRole = {
    role_name: string;
    role_description: string;
    role_remarks1: string;
    role_remarks2: string;
    role_remarks3: string;
}

type updateRole = {
    role_id: string;
    role_name: string;
    role_status: boolean;
    role_description: string;
    role_remarks1: string;
    role_remarks2: string;
    role_remarks3: string;
}

export const { useCreateRoleMutation, useUpdateRoleMutation } = apiSlice.injectEndpoints({
    endpoints: builder => ({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        createRole: builder.mutation<any, createRole>({
            query: (args) => ({
                url: '/role',
                method: 'POST',
                body: args
            }),
            invalidatesTags:['Table']
        }),
        updateRole: builder.mutation<any, updateRole>({
            query: (args) => ({
                url: '/role',
                method: 'PUT',
                body: args,
            }),
            invalidatesTags:['Table']
        })
    })
})
