/* eslint-disable @typescript-eslint/no-explicit-any */
import {apiSlice} from '../api';

export const {
    useLoginMutation
} = apiSlice.injectEndpoints({
    endpoints: builder => ({
        login: builder.mutation<any, {user_id:string; user_password: string;}> ({
            query:(args) => ({
                url:'/auth/token/user',
                body: args,
                method:'POST'
            })  
        })
    })
})
