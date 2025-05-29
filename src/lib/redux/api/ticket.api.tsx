import {apiSlice} from '../api';

type createTicket = {
    ticket_service : string;
    ticket_level : number;
    ticket_trip_number ?: string;
    ticket_vehicle_type ?: string;
    ticket_plate_num ?: string;
    ticket_remarks1 ?: string | null;
    ticket_remarks2 ?: string | null;
    ticket_remarks3 ?: string | null;
}

type updateTicket = {
    ticket_id : string;
    ticket_name : string;
    ticket_location : string;
    ticket_status : boolean;
    ticket_description : string;
    ticket_discipline : string;
    no_of_counters : number;
    counter_prefix : string;
    ticket_number_prefix : string;
    recall_waiting_flag : boolean;
    recall_waiting_time : number;
    ticket_remarks1 : string;
    ticket_remarks2 : string;
    ticket_remarks3 : string;
}

type getTicket = {
    filters?: any;
}

type getTripDetailsType = {
    tripPlanNo: string;
}

type getTicketByLocationType = {
    serviceLocation: string;
}

export const { 
    useCreateTicketMutation,
    useUpdateTicketMutation,
    useGetTicketsQuery,
    useLazyGetTripDetailsQuery,
    useGetTicketByLocationQuery,
    useLazyGetTicketByLocationQuery
} = apiSlice.injectEndpoints({
    endpoints: builder => ({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        createTicket: builder.mutation<any, createTicket>({
            query: (args) => ({
                url: '/ticket',
                method: 'POST',
                body: args
            }),
            invalidatesTags:['Table']
        }),
        updateTicket: builder.mutation<any, updateTicket>({
            query: (args) => ({
                url: '/ticket',
                method: 'PUT',
                body: args,
            }),
            invalidatesTags:['Table']
        }),
        getTickets: builder.query<any, getTicket>({
            query: (args) => ({
                url: '/ticket',
                method: 'GET',
                params: args,
            })
        }),
        getTripDetails: builder.query<any, getTripDetailsType>({
            query: (args) => ({
                url: '/ticket/trip-no',
                method: 'GET',
                params: args,
            })
        }),
        getTicketByLocation: builder.query<any, getTicketByLocationType>({
            query: (args) => ({
                url: '/ticket/queue-display',
                method: 'GET',
                params: args,
            })
        })
    })
})
