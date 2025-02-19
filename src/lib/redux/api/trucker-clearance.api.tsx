/* eslint-disable @typescript-eslint/no-explicit-any */
import {apiSlice} from '../api';

export const {
    useGetVehiclesQuery,
    useGetTruckerQuery,
    useSubmitClearanceMutation
} = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getVehicles: builder.query<any, void> ({
            query: () => ({
                url: '/trucker-clearance/select',
                method:'GET'
            })
        }),
        getTrucker: builder.query<any, string>({
            query:(vehicle_id) => ({
                url: '/trucker-clearance/trucker',
                params: {
                    vehicle_id
                },
                method:'GET'
            })
        }),
        submitClearance: builder.mutation<any, {
            trip_no: string;
            plate_no: string;
            trucker: string;
            vehicle_type: string;
        }>({
            query: (args) => ({
                url:'/trucker-clearance',
                body:{
                    ...args
                },
                method: 'POST'
            })
        })
    })
})