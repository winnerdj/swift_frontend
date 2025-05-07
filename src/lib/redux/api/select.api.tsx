/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiSlice } from '../api';

export type routes = 'role' | 'quickcode'

export const {
    useGetSelectDataQuery,
    useLazyGetSelectDataQuery
} = apiSlice.injectEndpoints({
    endpoints: builder => ({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        getSelectData: builder.query<any,{
            route: routes;
            filters?: any;
        }>({
            query: (args) => ({
                url: `/select/${args.route}`,
                method:'GET',
                params:{
                    ...args.filters
                }
            })
        })
    })
})
