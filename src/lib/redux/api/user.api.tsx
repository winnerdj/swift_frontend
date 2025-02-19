import {apiSlice} from '../api';

type createUser = {
    username:string;
    role_id: string;
    app_key: string;
}

type updateUser = {
    id: string;
    role_id?: string;
    app_key?: string;
    user_password?: string;
    is_active?: number;
}

export const {useGenerateAppKeyMutation, useCreateUserMutation, useUpdateUserMutation} = apiSlice.injectEndpoints({
    endpoints: builder => ({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        generateAppKey: builder.mutation<any, void>({
            query: () => ({
                url: '/user/app-key',
                method:'POST'
            })
        }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        createUser: builder.mutation<any,createUser>({
            query: (args) => ({
                url: '/user',
                method: 'POST',
                body: args
            }),
            invalidatesTags:['Table']
        }),
        updateUser: builder.mutation<void, updateUser>({
            query: ({id,...args}) => ({
                url: '/user/details/'+id,
                method: 'PUT',
                body: args,
            }),
            invalidatesTags:['Table']
        })

    })

})