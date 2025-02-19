import {apiSlice} from '../api';

export const {useGetDataQuery} = apiSlice.injectEndpoints({
    endpoints: builder => ({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        getData: builder.query<any, {
            page: number;
            result: number;
            route: string;
            order?: string;
            // eslint-disable-next-line @typescript-eslint/ban-types
            filters?: {};
        }>({
            query: (args) => ({
                url: args.route,
                params:{
                    page:   args.page,
                    result: args.result,
                    order:  args.order,
                    ...args.filters
                }
            }),
            providesTags:['Table']
        })
    })
})

