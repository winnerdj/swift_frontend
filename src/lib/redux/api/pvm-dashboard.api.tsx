/* eslint-disable @typescript-eslint/no-explicit-any */
import {apiSlice} from '../api';

export const {
    useGetPvmDashboardQuery
} = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getPvmDashboard: builder.query<any, void> ({
            query: () => ({
                url: '/pvm/dashboard',
                method:'GET'
            })
        })
    })
})
