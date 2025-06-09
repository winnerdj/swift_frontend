/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiSlice } from '../api';

// export type routes = 'role' | 'quickcode' | 'available-counter'

export const {
    useGetSelectDataQuery,
    useLazyGetSelectDataQuery,
    useGetAvailableCounterSelectQuery,
    useLazyGetAvailableCounterSelectQuery
} = apiSlice.injectEndpoints({
    endpoints: builder => ({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        getSelectData: builder.query<any,{
            route: string;
            filters?: any;
        }>({
            query: (args) => ({
                url: `/select/${args.route}`,
                method:'GET',
                params:{
                    ...args.filters
                }
            })
        }),
        getAvailableCounterSelect: builder.query<any,{
            route: string;
            filters?: any;
        }>({
            query: (args) => ({
                url: `/work/${args.route}`,
                method:'GET',
                params:{
                    ...args.filters
                }
            })
        }),
    })
})
