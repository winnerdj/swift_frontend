import {apiSlice} from '../api';

type getTripType = {
    trip_id: string;
    plate_no: string;
}

export const tripSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        getTrip: builder.query<any,getTripType>({
            query: (args) => ({
                url: '/v1/trip-submit',
                method:'GET',
                params: args
            })
        }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        executeTrip: builder.mutation<any, getTripType>({
            query: (args) => ({
                url:'/v1/trip-submit',
                method:'POST',
                params: args
            })
        })
    })
})

export const {
    useLazyGetTripQuery,
    useExecuteTripMutation
} = tripSlice;