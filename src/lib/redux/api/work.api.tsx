import {apiSlice} from '../api';

type workLogin = {
    service_id: string;
    counter_no: string;
}


export const { useWorkLoginMutation, useGetExistingWorkSessionDataQuery } = apiSlice.injectEndpoints({
    endpoints: builder => ({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        workLogin: builder.mutation<any, workLogin>({
            query: (args) => ({
                url: '/work/login',
                method: 'POST',
                body: args
            }),
            invalidatesTags:['Table']
        }),
        getExistingWorkSessionData: builder.query<any, {
            user_id: string;
        }>({
            query: (args) => ({
                url: '/work/latest-user-activity',
                params:{
                    user_id: args.user_id,
                }
            }),
            providesTags: ['Table']
        })
    })
})
